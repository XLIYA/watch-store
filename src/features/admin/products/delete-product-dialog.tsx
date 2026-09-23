"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { deleteProduct } from "@/services/products.service";
import { getApiErrorMessage } from "@/services/api/api-error";
import type { Product } from "@/types/product";

/** حذف خوش‌بینانه نیست: فقط تأیید موفق سرور لیست را تغییر می‌دهد؛ والد مسئول برگشت از صفحهٔ خالی است. */
export function DeleteProductDialog({ product, onClose, onDeleted }: { product: Product; onClose: () => void; onDeleted: () => void }) {
  const client = useQueryClient();
  const mutation = useMutation({ mutationFn: () => deleteProduct(product.id), onSuccess: async () => {
    await client.invalidateQueries({queryKey:["admin","products"]});
    await client.invalidateQueries({queryKey:["products"]});
    onDeleted(); onClose();
  }});
  return <Dialog open onOpenChange={open=>{if(!open&&!mutation.isPending)onClose();}}><DialogContent dir="rtl"><DialogHeader><DialogTitle>حذف محصول</DialogTitle><DialogDescription>«{product.name}» از فروشگاه حذف شود؟ این عملیات قابل بازگشت نیست.</DialogDescription></DialogHeader>{mutation.isError&&<p role="alert" className="text-destructive">{getApiErrorMessage(mutation.error)}</p>}<div className="flex justify-end gap-3"><Button variant="outline" disabled={mutation.isPending} onClick={onClose}>انصراف</Button><Button variant="destructive" disabled={mutation.isPending} onClick={()=>mutation.mutate()}>{mutation.isPending?"در حال حذف…":"حذف محصول"}</Button></div></DialogContent></Dialog>;
}
