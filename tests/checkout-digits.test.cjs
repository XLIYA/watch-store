const { test } = require("node:test");
const assert = require("node:assert/strict");
const { loadTs } = require("./load-ts.cjs");
const { checkoutSchema } = loadTs("src/features/checkout/checkout.schema.ts");
const { persianDigits } = loadTs("src/lib/digits.ts");

test("checkout accepts all three digit alphabets and submits Latin identifiers with leading zero", () => {
  for (const mobile of ["09123456789", "۰۹۱۲۳۴۵۶۷۸۹", "٠٩١٢٣٤٥٦٧٨٩", "۰9١۲۳4۵٦۷8۹"]) {
    assert.equal(checkoutSchema.shape.mobile.parse(mobile), "09123456789");
    assert.equal(persianDigits(mobile), "۰۹۱۲۳۴۵۶۷۸۹");
  }
  for (const postalCode of ["0123456789", "۰۱۲۳۴۵۶۷۸۹", "٠١٢٣٤٥٦٧٨٩"]) {
    assert.equal(checkoutSchema.shape.postalCode.parse(postalCode), "0123456789");
    assert.equal(persianDigits(postalCode), "۰۱۲۳۴۵۶۷۸۹");
  }
});

test("digit conversion does not silently accept malformed mobile or postal code", () => {
  for (const mobile of ["", "۰۸۱۲۳۴۵۶۷۸۹", "۰۹۱۲۳۴۵۶۷۸", "۰۹۱۲۳۴۵۶۷۸۹۰", "۰۹۱۲۳۴۵۶۷۸a"]) {
    assert.equal(checkoutSchema.shape.mobile.safeParse(mobile).success, false);
  }
  for (const postalCode of ["", "۱۲۳۴۵۶۷۸۹", "۱۲۳۴۵۶۷۸۹۰۱", "۱۲۳۴۵۶۷۸۹a"]) {
    assert.equal(checkoutSchema.shape.postalCode.safeParse(postalCode).success, false);
  }
});
