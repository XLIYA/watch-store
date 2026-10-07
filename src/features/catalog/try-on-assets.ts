import "server-only";
import { readdir, access } from "node:fs/promises";
import path from "node:path";
import config from "@/config/try-on.json";
import { getProductById } from "@/services/products.service";
import { getErrorStatus } from "@/services/api/api-error";

export type WatchPlacement = {
  x: number;
  y: number;
  width: number;
  rotation: number;
};

/** تصاویر با نگاشت صریح نام فایل به شناسهٔ محصول متصل می‌شوند؛ شمارهٔ ترتیبی عکس نباید قیمت یا لینک محصول دیگری را نمایش دهد. */
export async function getTryOnAssets() {
  const root = path.join(process.cwd(), "public");
  try {
    await access(path.join(root, config.wristImage));
  } catch {
    return null;
  }
  const files = await readdir(path.join(root, "images/try-on/watches"));
  const productIds = config.watchProducts as Record<string, number>;
  const candidates = [
    ...new Map(
      files
        // ترتیب طبیعی نام‌ها، عکس ۱۰ را پس از ۹ نگه می‌دارد نه کنار عکس ۱.
        .sort((a, b) => a.localeCompare(b, "en", { numeric: true }))
        .filter(
          (name) =>
            /\.(png|webp)$/i.test(name) &&
            Number.isSafeInteger(productIds[name]) &&
            productIds[name] > 0,
        )
        .map((name) => [productIds[name], name]),
    ).entries(),
  ];
  const overrides = config.products as Record<string, Partial<WatchPlacement>>;
  const items = await Promise.all(
    candidates.map(async ([id, file]) => {
      try {
        const product = await getProductById(id);
        return {
          product,
          image: `/images/try-on/watches/${file}`,
          placement: { ...config.placement, ...overrides[String(id)] },
        };
      } catch (error) {
        if (getErrorStatus(error) === 404) return null;
        throw error;
      }
    }),
  );
  return {
    wristImage: config.wristImage,
    aspectRatio: config.wristAspectRatio,
    items: items.filter((item) => item !== null),
  };
}
