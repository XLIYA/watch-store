"use client";
import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { PaginatedResult } from "@/types/pagination";
import type { Product } from "@/types/product";
import { updateProductInventory } from "@/services/products.service";
import { getApiErrorMessage } from "@/services/api/api-error";
import { changedInventoryIds, discardInventoryField, saveInventoryQueue, type InventoryDrafts, type InventoryField } from "./inventory-draft";

/** state ویرایش مستقل از cache است؛ ref قفل هم‌زمانی است و پیش از render بعدی جلوی دوبار ذخیره را می‌گیرد. */
export function useInventoryEditor() {
  const [drafts, setDrafts] = useState<InventoryDrafts>({});
  const [saving, setSaving] = useState(false);
  const lock = useRef(false);
  const client = useQueryClient();
  const changedIds = changedInventoryIds(drafts);

  useEffect(() => {
    if (!changedIds.length) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [changedIds.length]);

  /** کلیک عدد baseline سرور را ثبت می‌کند؛ refresh لیست نباید مبنای draft باز را عوض کند. */
  function edit(product: Product, field: InventoryField, value = String(product[field])) {
    if (lock.current) return;
    setDrafts(current => ({...current, [product.id]: {original: current[product.id]?.original ?? {price:product.price,quantity:product.quantity}, values:{...current[product.id]?.values,[field]:value}}}));
  }

  /** موفق‌ها فوراً از حالت ویرایش خارج می‌شوند؛ خطاها با متن و مقدار واردشده برای تلاش دوباره باقی می‌مانند. */
  async function save() {
    if (lock.current || !changedIds.length) return;
    lock.current = true; setSaving(true);
    try {
      await saveInventoryQueue(drafts, async (id, patch) => {
        const product = await updateProductInventory(id, patch);
        client.setQueriesData<PaginatedResult<Product>>({queryKey:["admin","products","list"]}, current => current ? {...current,data:current.data.map(item=>item.id===id?product:item)} : current);
        return product;
      },
        id => setDrafts(current => {const next={...current}; delete next[id]; return next;}),
        (id,error) => setDrafts(current => ({...current,[id]:{...current[id],error:error instanceof Error && !('isAxiosError' in error) ? error.message : getApiErrorMessage(error)}})));
      await client.invalidateQueries({queryKey:["admin","products"]});
      await client.invalidateQueries({queryKey:["products"]});
    } finally { lock.current=false; setSaving(false); }
  }
  return {drafts, saving, changedIds, edit, save, cancel:(id:number,field:InventoryField)=>{if(!lock.current)setDrafts(current=>discardInventoryField(current,id,field));}, discardAll:()=>{if(!lock.current)setDrafts({});}};
}
