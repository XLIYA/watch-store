import type { Product } from "@/types/product";

export type InventoryField = "price" | "quantity";
export type InventoryDraft = {
  original: Pick<Product, InventoryField>;
  values: Partial<Record<InventoryField, string>>;
  error?: string;
};
export type InventoryDrafts = Record<number, InventoryDraft>;

/** مقدار خام حفظ می‌شود تا خالی‌کردن textbox به صفر ناخواسته تبدیل نشود؛ در hook جدول برای ساخت صف ذخیره کاربرد دارد. */
export function inventoryPatch(
  draft: InventoryDraft,
): Partial<Pick<Product, InventoryField>> {
  const patch: Partial<Pick<Product, InventoryField>> = {};
  for (const field of ["price", "quantity"] as const) {
    const raw = draft.values[field];
    if (raw === undefined) continue;
    const value = Number(raw);
    if (
      !raw.trim() ||
      !Number.isFinite(value) ||
      value < 0 ||
      (field === "quantity" && !Number.isSafeInteger(value))
    )
      throw new Error(
        "قیمت و موجودی باید معتبر و غیرمنفی باشند؛ موجودی عدد صحیح است.",
      );
    if (value !== draft.original[field]) patch[field] = value;
  }
  return patch;
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
    patch: Partial<Pick<Product, InventoryField>>,
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
