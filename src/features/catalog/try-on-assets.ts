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

/** نام فایل، شناسهٔ محصول است؛ تنها تصاویر آماده و محصولات موجود وارد پرو می‌شوند، بدون تغییر قرارداد آپلود JPEG ادمین. */
export async function getTryOnAssets() {
  const root = path.join(process.cwd(), "public");
  try {
    await access(path.join(root, config.wristImage));
  } catch {
    return null;
  }
  const files = await readdir(path.join(root, "images/try-on/watches"));
  const candidates = [
    ...new Map(
      files
        .filter((name) => /^[1-9]\d*\.(png|webp)$/i.test(name))
        .map((name) => [Number(name.split(".")[0]), name]),
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
