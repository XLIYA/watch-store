import { apiClient } from "@/services/api/api-client";

import type {
  Category,
  Subcategory,
} from "@/types/category";

export async function getCategories(): Promise<Category[]> {
  const response = await apiClient.get<Category[]>(
    "/category",
    {
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
    "/category",
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
    "/subcategory",
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
    "/subcategory",
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
        `/category/${categoryId}`,
      );

    return response.data;
  } catch {
    return null;
  }
}

export async function getSubcategoryById(
  subcategoryId: number,
): Promise<Subcategory | null> {
  try {
    const response =
      await apiClient.get<Subcategory>(
        `/subcategory/${subcategoryId}`,
      );

    return response.data;
  } catch {
    return null;
  }
}