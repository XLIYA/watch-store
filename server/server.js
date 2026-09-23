const jsonServer = require("json-server");
const cors = require("cors");
const fs = require("node:fs");
const path = require("node:path");
const multer = require("multer");
const { createAuth } = require("./auth");

// مسیرها از محل فایل ساخته می‌شوند تا اجرای سرور از ریشهٔ پروژه هم درست باشد.
function createServer(options = {}) {
  const server = jsonServer.create();
  const router = jsonServer.router(
    options.dbPath || path.join(__dirname, "db.json"),
  );
  const origins =
    options.origins ||
    (process.env.WEB_ORIGINS || "http://localhost:3000")
      .split(",")
      .map((value) => value.trim());
  const uploadDir = options.uploadDir || path.join(__dirname, "uploads");
  const auth = createAuth(router.db, options.auth);

  server.use(
    cors({
      origin: (origin, callback) =>
        callback(null, !origin || origins.includes(origin)),
      credentials: true,
      exposedHeaders: ["X-Total-Count", "Link"],
    }),
  );
  server.use(jsonServer.defaults({ noCors: true, logger: !options.quiet }));
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
    if (entity === "orders" && req.method === "POST") return next();
    // قوانین حساس در کد هستند تا PATCH کردن جدول protection راه دورزدن مجوز نباشد.
    return auth.requireAdmin(req, res, next);
  });

  const upload = multer({
    dest: uploadDir,
    limits: { fileSize: 2 * 1024 * 1024, files: 1 },
    fileFilter: (_req, file, callback) => {
      if (file.mimetype !== "image/jpeg")
        return callback(new Error("INVALID_IMAGE_TYPE"));
      callback(null, true);
    },
  });
  server.post("/upload", upload.single("image"), (req, res) => {
    if (!req.file) return res.status(400).json({ code: "IMAGE_REQUIRED" });
    res.json({ ...req.file, image: `/files/${req.file.filename}` });
  });
  server.get("/files", (_req, res, next) => {
    fs.readdir(uploadDir, (error, files) =>
      error ? next(error) : res.json(files),
    );
  });
  server.get("/files/:fileId", (req, res) => {
    // نام تولیدشدهٔ multer فقط شناسه است، نه مسیر دلخواه روی فایل‌سیستم.
    if (!/^[a-f0-9]{32}$/.test(req.params.fileId)) return res.sendStatus(404);
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
  server.use((req, _res, next) => {
    if (req.file) req.body.image = `/files/${req.file.filename}`;
    if (req.method === "POST") req.body.createdAt = Date.now();
    next();
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
