"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import type { PaginatedResult } from "@/types/pagination";
import type { Product } from "@/types/product";
import { useInventoryMutation } from "./mutations";
import { getApiErrorMessage } from "@/services/api/api-error";
import { normalizeDigits } from "@/lib/digits";
import {
  changedInventoryIds,
  closeUnchangedInventoryFields,
  inventoryFieldValue,
  discardInventoryField,
  saveInventoryQueue,
  type InventoryDrafts,
  type InventoryField,
} from "./inventory-draft";

/** state ویرایش مستقل از cache است؛ ref قفل هم‌زمانی است و پیش از render بعدی جلوی دوبار ذخیره را می‌گیرد. */
export function useInventoryEditor() {
  const [drafts, setDrafts] = useState<InventoryDrafts>({});
  const [saving, setSaving] = useState(false);
  const lock = useRef(false);
  const client = useQueryClient();
  const router = useRouter();
  const mutation = useInventoryMutation();
  const changedIds = changedInventoryIds(drafts);

  useEffect(() => {
    if (!changedIds.length) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [changedIds.length]);

  /** کلیک عدد baseline سرور را ثبت می‌کند؛ refresh لیست نباید مبنای draft باز را عوض کند. */
  function edit(
    product: Product,
    field: InventoryField,
    value = String(inventoryFieldValue(drafts[product.id]?.original ?? product, field)),
  ) {
    if (lock.current) return;
    setDrafts((current) => ({
      ...current,
      [product.id]: {
        original: current[product.id]?.original ?? {
          price: product.price,
          quantity: product.quantity,
          variants: product.variants.map(variant => ({ ...variant })),
        },
        values: { ...current[product.id]?.values, [field]: normalizeDigits(value) },
        error: undefined,
      },
    }));
  }

  /** موفق‌ها فوراً از حالت ویرایش خارج می‌شوند؛ خطاها با متن و مقدار واردشده برای تلاش دوباره باقی می‌مانند. */
  async function save() {
    if (lock.current || !changedIds.length) return;
    lock.current = true;
    setSaving(true);
    try {
      await saveInventoryQueue(
        drafts,
        async (id, patch) => {
          const product = await mutation.mutateAsync({id, patch});
          client.setQueriesData<PaginatedResult<Product>>(
            { queryKey: ["admin", "products", "list"] },
            (current) =>
              current
                ? {
                    ...current,
                    data: current.data.map((item) =>
                      item.id === id ? product : item,
                    ),
                  }
                : current,
          );
          return product;
        },
        (id) =>
          setDrafts((current) => {
            const next = { ...current };
            delete next[id];
            return next;
          }),
        (id, error) =>
          setDrafts((current) => ({
            ...current,
            [id]: {
              ...current[id],
              error:
                error instanceof Error && !("isAxiosError" in error)
                  ? error.message
                  : getApiErrorMessage(error),
            },
          })),
      );
      setDrafts(closeUnchangedInventoryFields);
      await client.invalidateQueries({ queryKey: ["admin", "products"] });
      await client.invalidateQueries({ queryKey: ["products"] });
      // دادهٔ صفحه‌های سروری فروشگاه نیز پس از تغییر قیمت یا موجودی دوباره دریافت می‌شود.
      router.refresh();
    } finally {
      lock.current = false;
      setSaving(false);
    }
  }
  return {
    drafts,
    saving,
    changedIds,
    edit,
    save,
    cancel: (id: number, field: InventoryField) => {
      if (!lock.current)
        setDrafts((current) => discardInventoryField(current, id, field));
    },
    discardAll: () => {
      if (!lock.current) setDrafts({});
    },
  };
}
