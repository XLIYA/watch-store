const rules = require("../shared/product-rules.json");
const sanitizeHtml = require("sanitize-html");

/** پیش از نوشتن JSON Server اجرا می‌شود؛ اعتبار فرم به‌تنهایی کافی نیست و PATCH باید روی محصول کامل بررسی شود. */
function validateProductWrite(db) {
  return (req, res, next) => {
    if (
      !/^\/products(?:\/\d+)?\/?$/.test(req.path) ||
      !["POST", "PATCH", "PUT"].includes(req.method)
    )
      return next();
    const existing =
      req.method === "POST"
        ? {}
        : db
            .get("products")
            .find({ id: Number(req.path.split("/")[2]) })
            .value();
    if (!existing) return res.status(404).json({ code: "PRODUCT_NOT_FOUND" });
    const allowed = [
      "name",
      "brand",
      "slug",
      "category",
      "subcategory",
      "description",
      "thumbnail",
      "images",
      "price",
      "quantity",
      "variants",
      "isHero",
      "heroOrder",
    ];
    const patch = Object.fromEntries(
      Object.entries(req.body || {}).filter(([key]) => allowed.includes(key)),
    );
    const value = { ...existing, ...patch };
    const invalid = (message) =>
      res.status(422).json({ code: "INVALID_PRODUCT", message });
    if (
      ![
        value.name,
        value.brand,
        value.slug,
        value.description,
        value.thumbnail,
      ].every((v) => typeof v === "string" && v.trim())
    )
      return invalid("نام، برند، شناسه، تصویر و توضیحات لازم‌اند.");
    if (
      value.name.length > rules.nameMaxLength ||
      value.description.length > rules.descriptionMaxLength ||
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value.slug)
    )
      return invalid("نام یا شناسهٔ محصول معتبر نیست.");
    if (
      !Number.isFinite(value.price) ||
      value.price < 0 ||
      !Number.isSafeInteger(value.quantity) ||
      value.quantity < 0
    )
      return invalid("قیمت و موجودی معتبر نیستند.");
    const category = db.get("category").find({ id: value.category }).value();
    const subcategory = db
      .get("subcategory")
      .find({ id: value.subcategory })
      .value();
    if (!category || !subcategory || subcategory.category !== category.id)
      return invalid("گروه انتخاب‌شده متعلق به این سرگروه نیست.");
    if (
      db
        .get("products")
        .value()
        .some((p) => p.slug === value.slug && p.id !== existing.id)
    )
      return invalid("شناسهٔ متنی محصول تکراری است.");
    if (
      !Array.isArray(value.images) ||
      !value.images.length ||
      value.images.length > rules.maxImages ||
      !value.images.every(
        (v) => typeof v === "string" && /^(\/[^/]|https?:\/\/)/.test(v),
      ) ||
      !value.images.includes(value.thumbnail)
    )
      return invalid("تصاویر محصول معتبر نیستند.");
    if (
      !Array.isArray(value.variants) ||
      value.variants.some(
        (v) =>
          !v ||
          typeof v.id !== "string" ||
          !v.id ||
          typeof v.name !== "string" ||
          !v.name.trim() ||
          !/^#[0-9a-f]{6}$/i.test(v.hex) ||
          !Number.isSafeInteger(v.quantity) ||
          v.quantity < 0,
      )
    )
      return invalid("رنگ‌های محصول معتبر نیستند.");
    if (new Set(value.variants.map((v) => v.id)).size !== value.variants.length)
      return invalid("شناسهٔ رنگ‌ها باید یکتا باشد.");
    // حتی PATCH مستقیم باید برابری موجودی کل با رنگ‌های محصول نهایی را حفظ کند.
    if (value.variants.reduce((sum, v) => sum + v.quantity, 0) !== value.quantity)
      return invalid(
        "مجموع موجودی رنگ‌ها باید دقیقاً برابر موجودی کل محصول باشد؛ موجودی هر رنگ را در فرم محصول اصلاح کنید.",
      );
    if (
      typeof value.isHero !== "boolean" ||
      (value.heroOrder !== null &&
        (!Number.isSafeInteger(value.heroOrder) || value.heroOrder < 0))
    )
      return invalid("تنظیم نمایش محصول معتبر نیست.");
    if (patch.description !== undefined)
      patch.description = sanitizeHtml(patch.description);
    // PUT در JSON Server جایگزین کامل است؛ فیلدهای معتبر قبلی و شناسه‌های سرور باید حفظ شوند.
    req.body =
      req.method === "POST"
        ? { ...patch, soldCount: 0 }
        : req.method === "PUT"
          ? { ...existing, ...patch }
          : patch;
    next();
  };
}
module.exports = { validateProductWrite };
