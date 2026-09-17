import { endpoints } from "@/config/api";
import { toPaginatedResult } from "@/services/api/pagination";
import { apiClient } from "@/services/api/api-client";

import type { Product } from "@/types/product";
import type { PaginatedResult } from "@/types/pagination";

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