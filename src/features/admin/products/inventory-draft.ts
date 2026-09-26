import type { Product } from "@/types/product";

export type InventoryField = "price" | "quantity" | `variant:${string}`;
export type InventoryPatch = Partial<Pick<Product, "price" | "quantity" | "variants">>;
export type InventoryDraft = {
  original: Pick<Product, "price" | "quantity" | "variants">;
  values: Partial<Record<InventoryField, string>>;
  error?: string;
};
export type InventoryDrafts = Record<number, InventoryDraft>;

/** جدول و هوک از همین نگاشت استفاده می‌کنند؛ کلید رنگ با شناسه پایدار است و به ترتیب ردیف‌ها وابسته نیست. */
export function inventoryFieldValue(product: InventoryDraft["original"], field: InventoryField): number {
  if (field === "price" || field === "quantity") return product[field];
  const variant = product.variants.find(item => `variant:${item.id}` === field);
  if (!variant) throw new Error("رنگ محصول پیدا نشد؛ فهرست را تازه کنید.");
  return variant.quantity;
}

/** مقدار خام حفظ می‌شود تا خالی‌کردن textbox به صفر ناخواسته تبدیل نشود؛ در hook جدول برای ساخت صف ذخیره کاربرد دارد. */
export function inventoryPatch(
  draft: InventoryDraft,
): InventoryPatch {
  const patch: InventoryPatch = {};
  const variants = draft.original.variants.map(variant => ({ ...variant }));
  let variantsChanged = false;
  for (const field of Object.keys(draft.values) as InventoryField[]) {
    const raw = draft.values[field];
    if (raw === undefined) continue;
    const value = Number(raw);
    if (
      !raw.trim() ||
      !Number.isFinite(value) ||
      value < 0 ||
      (field !== "price" && !Number.isSafeInteger(value))
    )
      throw new Error(
        "قیمت و موجودی باید معتبر و غیرمنفی باشند؛ موجودی عدد صحیح است.",
      );
    if (value === inventoryFieldValue(draft.original, field)) continue;
    if (field === "price" || field === "quantity") patch[field] = value;
    else {
      variants.find(variant => `variant:${variant.id}` === field)!.quantity = value;
      variantsChanged = true;
    }
  }
  // کل موجودی و تخصیص رنگ‌ها در یک PATCH ارسال می‌شوند تا هیچ وضعیت نیمه‌ذخیره‌ای ساخته نشود.
  if (variantsChanged) patch.variants = variants;
  if (Object.keys(patch).length && variants.reduce((sum, variant) => sum + variant.quantity, 0) !== (patch.quantity ?? draft.original.quantity))
    throw new Error("مجموع موجودی رنگ‌ها باید دقیقاً برابر موجودی کل محصول باشد.");
  return patch;
}

/** خطای محلی همان قانون صف ذخیره است؛ جدول پیش از ارسال، ردیف ناهماهنگ را مشخص می‌کند. */
export function inventoryDraftError(draft?: InventoryDraft): string | undefined {
  if (!draft) return;
  try { inventoryPatch(draft); } catch (error) { return error instanceof Error ? error.message : "موجودی معتبر نیست."; }
}

/** Escape فقط فیلد فعلی را کنار می‌گذارد؛ تغییر قیمت نباید با انصراف از موجودی همان ردیف حذف شود. */
export function discardInventoryField(
  drafts: InventoryDrafts,
  id: number,
  field: InventoryField,
): InventoryDrafts {
  const next = { ...drafts };
  if (!next[id]) return next;
  const values = { ...next[id].values };
  delete values[field];
  if (Object.keys(values).length)
    next[id] = { ...next[id], values, error: undefined };
  else delete next[id];
  return next;
}

/** طبق PDF شناسه‌های تغییرکرده آرایه‌اند؛ ورودی نامعتبر نیز dirty می‌ماند تا خطایش گم نشود. */
export function changedInventoryIds(drafts: InventoryDrafts): number[] {
  return Object.entries(drafts)
    .filter(([, draft]) => {
      try {
        return Object.keys(inventoryPatch(draft)).length > 0;
      } catch {
        return true;
      }
    })
    .map(([id]) => Number(id));
}

/** ذخیرهٔ سری مخصوص موجودی است: await داخل حلقه ترتیب درخواست‌ها را حفظ می‌کند و شکست یک ردیف مانع بقیه نمی‌شود. */
export async function saveInventoryQueue(
  drafts: InventoryDrafts,
  save: (
    id: number,
    patch: InventoryPatch,
  ) => Promise<unknown>,
  onSuccess: (id: number) => void,
  onError: (id: number, error: unknown) => void,
) {
  for (const id of changedInventoryIds(drafts)) {
    try {
      await save(id, inventoryPatch(drafts[id]));
      onSuccess(id);
    } catch (error) {
      onError(id, error);
    }
  }
}

/** پس از ذخیرهٔ جدول، سلول‌های بدون تغییر بسته می‌شوند؛ ورودی خالی و تغییر شکست‌خورده برای اصلاح باقی می‌مانند. */
export function closeUnchangedInventoryFields(drafts: InventoryDrafts): InventoryDrafts {
  const next: InventoryDrafts = {};
  for (const [id, draft] of Object.entries(drafts)) {
    const values = { ...draft.values };
    for (const field of Object.keys(values) as InventoryField[]) {
      const raw = values[field];
      if (raw?.trim() && Number(raw) === inventoryFieldValue(draft.original, field)) delete values[field];
    }
    if (Object.keys(values).length) next[Number(id)] = { ...draft, values };
  }
  return next;
}
