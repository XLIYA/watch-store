const jwt = require("jsonwebtoken");
const { randomBytes, randomUUID, scryptSync, timingSafeEqual } = require("node:crypto");

const { access: ACCESS_COOKIE, refresh: REFRESH_COOKIE } = require("../shared/auth-cookies.json");

function readCookie(req, name) {
  const part = (req.headers.cookie || "")
    .split(";")
    .map((value) => value.trim())
    .find((value) => value.startsWith(`${name}=`));
  return part ? part.slice(name.length + 1) : undefined;
}

function createAuth(db, options = {}) {
  const production = process.env.NODE_ENV === "production";
  if (
    production &&
    (!process.env.AUTH_JWT_SECRET || !process.env.AUTH_REFRESH_SECRET)
  ) {
    throw new Error("Authentication secrets must be configured in production");
  }
  const accessSecret =
    options.accessSecret ||
    process.env.AUTH_JWT_SECRET ||
    randomBytes(32).toString("hex");
  const refreshSecret =
    options.refreshSecret ||
    process.env.AUTH_REFRESH_SECRET ||
    randomBytes(32).toString("hex");
  const accessSeconds = options.accessSeconds || 3600;
  const refreshSeconds = options.refreshSeconds || 86400;
  const cookieOptions = { httpOnly: true, secure: production, sameSite: "lax" };
  // login شناسهٔ نشست را اینجا ثبت می‌کند؛ requireAdmin و refresh آن را بررسی و logout لغو می‌کند.
  // در نسخهٔ ابری این Map در تراکنش دیتابیس ذخیره می‌شود؛ در اجرای محلی، restart نشست‌ها را لغو می‌کند.
  const sessions = options.sessions || new Map();

  const clearCookies = (res) => {
    res.clearCookie(ACCESS_COOKIE, { ...cookieOptions, path: "/" });
    res.clearCookie(REFRESH_COOKIE, { ...cookieOptions, path: "/auth" });
  };
  const fail = (res, status, code) => res.status(status).json({ code });
  const publicUser = (user) => ({
    username: user.username,
    name: user.name,
    role: user.role,
  });
  const findUser = (username) => db.get("users").find({ username }).value();
  const verify = (token, secret) =>
    jwt.verify(token, secret, { algorithms: ["HS256"] });
  const setAccess = (res, user, sid) => {
    const token = jwt.sign({ ...publicUser(user), sid }, accessSecret, {
      expiresIn: accessSeconds,
    });
    res.cookie(ACCESS_COOKIE, token, {
      ...cookieOptions,
      path: "/",
      maxAge: accessSeconds * 1000,
    });
  };
  const activeUser = (payload) => {
    const session = sessions.get(payload.sid);
    if (
      !session ||
      session.expiresAt <= Date.now() ||
      session.username !== payload.username
    )
      return null;
    return findUser(session.username);
  };

  return {
    login(req, res) {
      res.set("Cache-Control", "no-store");
      const { username, password } = req.body || {};
      const user = typeof username === "string" ? findUser(username) : null;
      const valid = user && typeof password === "string" && password.length <= 256 && (user.passwordHash && /^[a-f0-9]{128}$/.test(user.passwordHash) && user.passwordSalt
        ? timingSafeEqual(scryptSync(password, user.passwordSalt, 64), Buffer.from(user.passwordHash, "hex"))
        : !production && user.password === password);
      if (!valid)
        return fail(res, 401, "INVALID_CREDENTIALS");
      if (user.role !== "admin") return fail(res, 403, "FORBIDDEN");
      for (const [sid, session] of sessions)
        if (session.expiresAt <= Date.now()) sessions.delete(sid);
      const sid = randomUUID();
      sessions.set(sid, {
        username: user.username,
        expiresAt: Date.now() + refreshSeconds * 1000,
      });
      const refreshToken = jwt.sign(
        { username: user.username, sid },
        refreshSecret,
        { expiresIn: refreshSeconds },
      );
      setAccess(res, user, sid);
      res.cookie(REFRESH_COOKIE, refreshToken, {
        ...cookieOptions,
        path: "/auth",
        maxAge: refreshSeconds * 1000,
      });
      // توکن فقط با Set-Cookie منتقل می‌شود و در JSON قابل‌خواندن برای JavaScript نیست.
      res.json({ user: publicUser(user) });
    },
    refresh(req, res) {
      res.set("Cache-Control", "no-store");
      try {
        const payload = verify(readCookie(req, REFRESH_COOKIE), refreshSecret);
        const user = activeUser(payload);
        if (!user || user.role !== "admin") throw new Error("Invalid session");
        setAccess(res, user, payload.sid);
        res.json({ user: publicUser(user) });
      } catch {
        clearCookies(res);
        fail(res, 401, "SESSION_EXPIRED");
      }
    },
    logout(req, res) {
      // هر دو کوکی بررسی می‌شوند تا خروج حتی بدون access معتبر، refresh را هم در سرور لغو کند.
      for (const [name, secret] of [
        [ACCESS_COOKIE, accessSecret],
        [REFRESH_COOKIE, refreshSecret],
      ]) {
        try {
          sessions.delete(verify(readCookie(req, name), secret).sid);
        } catch {
          /* کوکی حذف‌شده یا منقضی مانع خروج نیست. */
        }
      }
      clearCookies(res);
      res.set("Cache-Control", "no-store").sendStatus(204);
    },
    requireAdmin(req, res, next) {
      res.set("Cache-Control", "no-store");
      try {
        const payload = verify(readCookie(req, ACCESS_COOKIE), accessSecret);
        const user = activeUser(payload);
        if (!user) return fail(res, 401, "SESSION_EXPIRED");
        if (user.role !== "admin") return fail(res, 403, "FORBIDDEN");
        req.user = publicUser(user);
        next();
      } catch {
        fail(res, 401, "ACCESS_EXPIRED");
      }
    },
    session(req, res) {
      res.json({ user: req.user });
    },
  };
}

module.exports = { createAuth };
