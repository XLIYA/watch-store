const jsonServer = require("json-server");
const cors = require("cors");
const fs = require("node:fs");
const path = require("node:path");
const multer = require("multer");
const { registerOrders } = require("./orders");
const { buildDashboard } = require("./dashboard");
const { createAuth } = require("./auth");
const { validateProductWrite } = require("./product-validation");
const productRules = require("../shared/product-rules.json");

// مسیرها از محل فایل ساخته می‌شوند تا اجرای سرور از ریشهٔ پروژه هم درست باشد.
function createServer(options = {}) {
  const server = jsonServer.create();
  const router = jsonServer.router(
    options.state || options.dbPath || path.join(__dirname, "db.json"),
  );
  const origins =
    options.origins ||
    (process.env.WEB_ORIGINS || "http://localhost:3000")
      .split(",")
      .map((value) => value.trim());
  const uploadDir = options.uploadDir || path.join(__dirname, "uploads");
  const auth = createAuth(router.db, options.auth);
  server.locals.store = router.db;

  server.use(
    cors({
      origin: (origin, callback) =>
        callback(null, !origin || origins.includes(origin)),
      credentials: true,
      exposedHeaders: ["X-Total-Count", "Link"],
    }),
  );
  // در ابر، Next فایل‌های عمومی را سرو می‌کند و پاسخ API تا ثبت تراکنش بافر می‌شود.
  if (!options.state) server.use(jsonServer.defaults({ noCors: true, logger: !options.quiet }));
  server.use((_req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });
  server.use(jsonServer.bodyParser);

  // کوکی خودکار ارسال می‌شود؛ Origin و هدر غیرساده جلوی درخواست تغییردهندهٔ سایت دیگر را می‌گیرند.
  server.use((req, res, next) => {
    if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return next();
    const origin = req.get("origin");
    if (
      (origin && !origins.includes(origin)) ||
      req.get("X-Requested-With") !== "watch-store"
    ) {
      return res.status(403).json({ code: "INVALID_ORIGIN" });
    }
    next();
  });

  server.post("/auth/login", auth.login);
  server.post("/auth/refresh-token", auth.refresh);
  server.post("/auth/logout", auth.logout);
  server.get("/auth/session", auth.requireAdmin, auth.session);

  registerOrders(server, router.db, auth);
  // نمودارها endpoint مستقل و محافظت‌شده دارند؛ سفارش‌های مشتری به مرورگر عمومی ارسال نمی‌شوند.
  server.get("/dashboard", auth.requireAdmin, (req, res) => {
    const days = Number(req.query.days || 30);
    if (![7, 30, 90].includes(days)) return res.status(400).json({ code: "INVALID_RANGE" });
    res.set("Cache-Control", "no-store").json(buildDashboard(router.db.get("orders").value() || [], router.db.get("products").value() || [], days));
  });

  server.use((req, res, next) => {
    const entity = req.path.split("/")[1];
    const readOnly = ["GET", "HEAD"].includes(req.method);
    // دادهٔ عمومی فروشگاه مستقل از session است؛ کوکی منقضی نباید مشاهدهٔ محصول را خراب کند.
    if (
      readOnly &&
      ["products", "category", "subcategory", "reviews"].includes(entity)
    )
      return next();
    if (readOnly && entity === "files" && req.path.split("/").length === 3)
      return next();
    if (entity === "orders" && !readOnly)
      return auth.requireAdmin(req, res, () => res.status(405).json({ code: "USE_ORDER_ACTION" }));
    // قوانین حساس در کد هستند تا PATCH کردن جدول protection راه دورزدن مجوز نباشد.
    return auth.requireAdmin(req, res, next);
  });

  const upload = multer({
    ...(options.files ? { storage: multer.memoryStorage() } : { dest: uploadDir }),
    limits: { fileSize: productRules.maxImageBytes, files: 1 },
    fileFilter: (_req, file, callback) => {
      if (file.mimetype !== productRules.imageMime)
        return callback(new Error("INVALID_IMAGE_TYPE"));
      callback(null, true);
    },
  });
  server.post("/upload", upload.single("image"), async (req, res, next) => {
    if (!req.file) return res.status(400).json({ code: "IMAGE_REQUIRED" });
    if (options.files) {
      try { const id = await options.files.save(req.file.buffer); return res.json({ image: `/files/${id}` }); }
      catch (error) { return next(error); }
    }
    res.json({ ...req.file, image: `/files/${req.file.filename}` });
  });
  server.get("/files", async (_req, res, next) => {
    if (options.files) {
      try { return res.json(await options.files.list()); } catch (error) { return next(error); }
    }
    fs.readdir(/* turbopackIgnore: true */ uploadDir, (error, files) =>
      error ? next(error) : res.json(files),
    );
  });
  server.get("/files/:fileId", async (req, res, next) => {
    // نام تولیدشدهٔ multer فقط شناسه است، نه مسیر دلخواه روی فایل‌سیستم.
    if (!/^[a-f0-9]{32}$/.test(req.params.fileId)) return res.sendStatus(404);
    if (options.files) {
      try { const buffer = await options.files.read(req.params.fileId); return buffer ? res.type("jpeg").send(buffer) : res.sendStatus(404); }
      catch (error) { return next(error); }
    }
    res.type("jpeg").sendFile(req.params.fileId, { root: uploadDir });
  });
  server.use((req, res, next) => {
    if (
      ["POST", "PATCH", "PUT"].includes(req.method) &&
      req.is("multipart/form-data")
    ) {
      return upload.single("image")(req, res, next);
    }
    next();
  });
  server.use(validateProductWrite(router.db));
  server.use(async (req, _res, next) => {
    try {
      if (req.file) req.body.image = `/files/${options.files ? await options.files.save(req.file.buffer) : req.file.filename}`;
      if (req.method === "POST") req.body.createdAt = Date.now();
      next();
    } catch (error) { next(error); }
  });
  server.use(router);
  server.use((error, _req, res, _next) => {
    const code = error.code || error.message;
    const invalidUpload = [
      "LIMIT_FILE_SIZE",
      "LIMIT_FILE_COUNT",
      "LIMIT_UNEXPECTED_FILE",
      "INVALID_IMAGE_TYPE",
    ].includes(code);
    res
      .status(invalidUpload ? 400 : 500)
      .json({ code: invalidUpload ? code : "SERVER_ERROR" });
  });
  return server;
}

if (require.main === module) {
  const envPath = path.join(__dirname, ".env");
  if (fs.existsSync(envPath)) process.loadEnvFile(envPath);
  const port = Number(process.env.PORT || 3002);
  createServer().listen(port, () =>
    console.log(`JSON Server listening on port ${port}`),
  );
}

module.exports = { createServer };
