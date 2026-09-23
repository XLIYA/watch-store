import { endpoints } from "@/config/api";
import { toPaginatedResult } from "@/services/api/pagination";
import { apiClient } from "@/services/api/api-client";

import type { Product } from "@/types/product";
import type { PaginatedResult } from "@/types/pagination";
import { apiConfig } from "@/config/api";
import rules from "../../shared/product-rules.json";

export type ProductPayload = Omit<Product, "id" | "createdAt" | "soldCount">;

/** مودال محصول فقط با این سرویس ذخیره می‌کند؛ ایجاد POST و ویرایش PATCH است تا فیلدهای آماری بازنویسی نشوند. */
export async function saveProduct(payload: ProductPayload, id?: number): Promise<Product> {
  const response = id === undefined
    ? await apiClient.post<Product>(endpoints.products, payload, { requiresAuth: true })
    : await apiClient.patch<Product>(endpoints.product(id), payload, { requiresAuth: true });
  return response.data;
}

/** حذف بعد از تأیید در مودال انجام می‌شود؛ خطا به mutation برمی‌گردد تا لیست زودتر از سرور تغییر نکند. */
export async function deleteProduct(id: number) {
  await apiClient.delete(endpoints.product(id), { requiresAuth: true });
}

/** جدول موجودی فقط فیلدهای تغییرکرده را ارسال می‌کند تا ویرایش هم‌زمان مشخصات محصول از بین نرود. */
export async function updateProductInventory(id: number, patch: Partial<Pick<Product, "price" | "quantity">>) {
  return (await apiClient.patch<Product>(endpoints.product(id), patch, { requiresAuth: true })).data;
}

/** تبدیل قرارداد upload به آدرس قابل‌استفاده در thumbnail/images اینجا متمرکز است؛ فرم با نام داخلی فایل سرور کاری ندارد. */
export async function uploadProductImage(file: File): Promise<string> {
  if (file.type !== rules.imageMime || file.size > rules.maxImageBytes) throw new Error("تصویر باید JPEG و حداکثر ۲ مگابایت باشد.");
  const body = new FormData();
  body.append("image", file);
  const { data } = await apiClient.post<{ image: string }>(endpoints.upload, body, { requiresAuth: true });
  return new URL(data.image, apiConfig.baseURL).href;
}

export type ProductSort =
  | "newest"
  | "popular"
  | "price-asc"
  | "price-desc";

export interface GetProductsParams {
  category?: number;
  subcategory?: number;

  page?: number;
  limit?: number;

  minPrice?: number;
  maxPrice?: number;

  sort?: ProductSort;

  search?: string;
}

export async function getProducts({
  category,
  subcategory,
  page = 1,
  limit = 12,
  minPrice,
  maxPrice,
  sort = "newest",
  search,
}: GetProductsParams = {}, signal?: AbortSignal): Promise<PaginatedResult<Product>> {
  const params: Record<string, string | number> = {
    _page: page,
    _limit: limit,
  };

  if (category !== undefined) {
    params.category = category;
  }

  if (subcategory !== undefined) {
    params.subcategory = subcategory;
  }

  if (minPrice !== undefined) {
    params.price_gte = minPrice;
  }

  if (maxPrice !== undefined) {
    params.price_lte = maxPrice;
  }

  if (search?.trim()) {
    params.q = search.trim();
  }

  switch (sort) {
    case "popular":
      params._sort = "soldCount";
      params._order = "desc";
      break;

    case "price-asc":
      params._sort = "price";
      params._order = "asc";
      break;

    case "price-desc":
      params._sort = "price";
      params._order = "desc";
      break;

    case "newest":
    default:
      params._sort = "createdAt";
      params._order = "desc";
      break;
  }

  const response = await apiClient.get<Product[]>(endpoints.products, {
    params,
    signal,
  });

  return toPaginatedResult(response.data, response.headers["x-total-count"], page, limit);
}

export async function getProductById(
  productId: number,
  signal?: AbortSignal,
): Promise<Product> {
  const response = await apiClient.get<Product>(
    endpoints.product(productId), { signal },
  );

  return response.data;
}

export async function getHeroProducts(): Promise<Product[]> {
  const response = await apiClient.get<Product[]>(endpoints.products, {
    params: {
      isHero: true,
      _sort: "heroOrder",
      _order: "asc",
    },
  });

  return response.data;
}

export async function getPopularProducts(
  limit = 6,
): Promise<Product[]> {
  const response = await apiClient.get<Product[]>(
    endpoints.products,
    {
      params: {
        _sort: "soldCount",
        _order: "desc",
        _limit: limit,
      },
    },
  );

  return response.data;
}
