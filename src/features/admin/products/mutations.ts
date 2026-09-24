"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  saveProduct,
  deleteProduct,
  updateProductInventory,
  uploadProductImage,
  type ProductPayload,
} from "@/services/products.service";
import { updateCategoryFeatured } from "@/services/categories.service";

/** همهٔ mutationهای کاتالوگ cache مشترک را تازه می‌کنند؛ فرم‌ها صرفاً وضعیت و نتیجه را مصرف می‌کنند. */
function useCatalogInvalidation() {
  const client = useQueryClient();
  const router = useRouter();
  return async () => {
    await Promise.all([
      client.invalidateQueries({ queryKey: ["admin", "products"] }),
      client.invalidateQueries({ queryKey: ["products"] }),
      client.invalidateQueries({ queryKey: ["catalog", "categories"] }),
    ]);
    router.refresh();
  };
}
export function useSaveProduct(onSuccess: () => void) {
  const invalidate = useCatalogInvalidation();
  return useMutation({
    mutationFn: ({ payload, id }: { payload: ProductPayload; id?: number }) =>
      saveProduct(payload, id),
    onSuccess: async () => {
      await invalidate();
      onSuccess();
    },
  });
}
export function useDeleteProduct(onSuccess: () => void) {
  const invalidate = useCatalogInvalidation();
  return useMutation({
    mutationFn: deleteProduct,
    onSuccess: async () => {
      await invalidate();
      onSuccess();
    },
  });
}
export function useFeaturedCategoryMutation() {
  const invalidate = useCatalogInvalidation();
  return useMutation({
    mutationFn: ({ id, featured }: { id: number; featured: boolean }) =>
      updateCategoryFeatured(id, featured),
    onSuccess: invalidate,
  });
}
/** جدول خودش صف ترتیبی و خطای هر ردیف را نگه می‌دارد؛ mutation فقط درخواست یک ردیف را اجرا می‌کند. */
export function useInventoryMutation() {
  return useMutation({
    mutationFn: ({
      id,
      patch,
    }: {
      id: number;
      patch: Partial<Pick<ProductPayload, "price" | "quantity">>;
    }) => updateProductInventory(id, patch),
  });
}
export function useImageUploadMutation() {
  return useMutation({ mutationFn: uploadProductImage });
}
