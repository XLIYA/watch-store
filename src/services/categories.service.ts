import { endpoints } from "@/config/api";
import { getErrorStatus } from "@/services/api/api-error";
import { apiClient } from "@/services/api/api-client";

import type {
  Category,
  Subcategory,
} from "@/types/category";

export async function getCategories(signal?: AbortSignal): Promise<Category[]> {
  const response = await apiClient.get<Category[]>(
    endpoints.categories,
    {
      signal,
      params: {
        _sort: "homeOrder",
        _order: "asc",
      },
    },
  );

  return response.data;
}

export async function getCategoryBySlug(
  slug: string,
): Promise<Category | null> {
  const response = await apiClient.get<Category[]>(
    endpoints.categories,
    {
      params: {
        slug,
      },
    },
  );

  return response.data[0] ?? null;
}

export async function getSubcategories(
  categoryId?: number,
): Promise<Subcategory[]> {
  const params: Record<string, number> = {};

  if (categoryId !== undefined) {
    params.category = categoryId;
  }

  const response = await apiClient.get<Subcategory[]>(
    endpoints.subcategories,
    {
      params,
    },
  );

  return response.data;
}

export async function getSubcategoryBySlug(
  slug: string,
): Promise<Subcategory | null> {
  const response = await apiClient.get<Subcategory[]>(
    endpoints.subcategories,
    {
      params: {
        slug,
      },
    },
  );

  return response.data[0] ?? null;
}

export async function getCategoryById(
  categoryId: number,
): Promise<Category | null> {
  try {
    const response =
      await apiClient.get<Category>(
        endpoints.category(categoryId),
      );

    return response.data;
  } catch (error) {
    if (getErrorStatus(error) === 404) return null;
    throw error;
  }
}

export async function getSubcategoryById(
  subcategoryId: number,
): Promise<Subcategory | null> {
  try {
    const response =
      await apiClient.get<Subcategory>(
        endpoints.subcategory(subcategoryId),
      );

    return response.data;
  } catch (error) {
    if (getErrorStatus(error) === 404) return null;
    throw error;
  }
}