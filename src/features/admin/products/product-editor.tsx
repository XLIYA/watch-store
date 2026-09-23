"use client";

import { useState } from "react";
import Image from "next/image";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCategories } from "@/features/catalog/use-categories";
import { getSubcategories } from "@/services/categories.service";
import { saveProduct, uploadProductImage } from "@/services/products.service";
import { getApiErrorMessage } from "@/services/api/api-error";
import { productSchema, type ProductFormValues } from "./product.schema";
import type { Product } from "@/types/product";
import rules from "../../../../shared/product-rules.json";

/** هر بار بازشدن مودال یک فرم تازه می‌سازد؛ draft محصول قبلی به ایجاد یا ویرایش بعدی نشت نمی‌کند. */
export function ProductEditor({ product, onClose }: { product?: Product; onClose: () => void }) {
  const queryClient = useQueryClient();
  const categories = useCategories();
  const groups = useQuery({ queryKey: ["catalog", "subcategories"], queryFn: () => getSubcategories() });
  const [images, setImages] = useState(product?.images ?? []);
  const [uploading, setUploading] = useState(false);
  const [imageError, setImageError] = useState("");
  const form = useForm<ProductFormValues>({ resolver: zodResolver(productSchema), defaultValues: product ?? {
    name: "", brand: "", slug: "", category: 0, subcategory: 0, description: "", price: 0, quantity: 0, variants: [], isHero: false, heroOrder: null,
  } });
  const category = useWatch({ control: form.control, name: "category" });
  const variants = useFieldArray({ control: form.control, name: "variants", keyName: "fieldKey" });
  const mutation = useMutation({
    mutationFn: (values: ProductFormValues) => saveProduct({ ...values, thumbnail: images[0], images }, product?.id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      await queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success(product ? "تغییرات محصول ذخیره شد." : "محصول جدید ثبت شد.");
      onClose();
    },
  });
  const busy = mutation.isPending || uploading;

  /** تصویر قبل از ذخیرهٔ محصول آپلود می‌شود؛ نتایج موفق حفظ می‌شوند تا خطای فایل بعدی باعث آپلود دوباره نشود. */
  async function uploadFiles(files: FileList | null) {
    if (!files?.length) return;
    setImageError("");
    if (images.length + files.length > rules.maxImages) { setImageError(`حداکثر ${rules.maxImages} تصویر مجاز است.`); return; }
    if ([...files].some(file => file.type !== rules.imageMime || file.size > rules.maxImageBytes)) { setImageError("تصاویر باید JPEG و حداکثر ۲ مگابایت باشند."); return; }
    setUploading(true);
    try { for (const file of [...files]) { const url = await uploadProductImage(file); setImages(current => [...current, url]); } }
    catch (error) { setImageError(getApiErrorMessage(error)); }
    finally { setUploading(false); }
  }

  /** بسته‌شدن تصادفی، draft را از بین نمی‌برد؛ هنگام ارسال نیز مودال تا دریافت پاسخ باز می‌ماند. */
  function close() {
    if (busy) return;
    const changed = form.formState.isDirty || JSON.stringify(images) !== JSON.stringify(product?.images ?? []);
    if (!changed || window.confirm("تغییرات ذخیره نشده‌اند. از فرم خارج می‌شوید؟")) onClose();
  }

  /** همان handler برای ایجاد و ویرایش استفاده می‌شود؛ شرط تصویر خارج schema است چون فایل‌ها چرخهٔ آپلود مستقل دارند. */
  function submit(values: ProductFormValues) {
    if (!images.length) { setImageError("حداقل یک تصویر محصول لازم است."); return; }
    mutation.mutate(values);
  }

  return <Dialog open onOpenChange={open => { if (!open) close(); }}>
    <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-3xl" dir="rtl" onInteractOutside={event => event.preventDefault()}>
      <DialogHeader className="text-right"><DialogTitle>{product ? "ویرایش محصول" : "محصول تازه"}</DialogTitle><DialogDescription>مشخصات، تصاویر و موجودی ساعت را مدیریت کنید.</DialogDescription></DialogHeader>
      {(categories.isError || groups.isError) && <div role="alert" className="text-destructive">دریافت گروه‌ها ناموفق بود. <Button variant="link" onClick={() => { void categories.refetch(); void groups.refetch(); }}>تلاش دوباره</Button></div>}
      <form onSubmit={form.handleSubmit(submit)} className="space-y-7" noValidate>
        <fieldset disabled={busy} className="grid gap-5 sm:grid-cols-2">
          <legend className="mb-4 font-medium">هویت محصول</legend>
          {([['name','نام محصول'],['brand','برند'],['slug','شناسهٔ انگلیسی در آدرس']] as const).map(([name,label]) => <label className="form-field" key={name}>{label}<input {...form.register(name)} aria-invalid={!!form.formState.errors[name]} dir={name === "slug" ? "ltr" : undefined} /><span role="alert">{form.formState.errors[name]?.message}</span></label>)}
          <label className="form-field">سرگروه<select {...form.register("category", {valueAsNumber:true, onChange: () => form.setValue("subcategory", 0, {shouldDirty:true})})} disabled={categories.isPending}><option value={0}>انتخاب سرگروه</option>{categories.data?.map(item => <option value={item.id} key={item.id}>{item.name}</option>)}</select><span role="alert">{form.formState.errors.category?.message}</span></label>
          <label className="form-field">گروه<select {...form.register("subcategory", {valueAsNumber:true})} disabled={groups.isPending || !category}><option value={0}>انتخاب گروه</option>{groups.data?.filter(item => item.category === category).map(item => <option value={item.id} key={item.id}>{item.name}</option>)}</select><span role="alert">{form.formState.errors.subcategory?.message}</span></label>
          {([['price','قیمت (تومان)'],['quantity','موجودی کل']] as const).map(([name,label]) => <label className="form-field" key={name}>{label}<input type="number" min="0" step={name === "quantity" ? "1" : "any"} {...form.register(name,{valueAsNumber:true})} /><span role="alert">{form.formState.errors[name]?.message}</span></label>)}
        </fieldset>
        <fieldset disabled={busy} className="space-y-4"><legend className="mb-3 font-medium">تصاویر محصول</legend><p className="text-xs text-muted-foreground">تصویر اول به‌عنوان تصویر اصلی نمایش داده می‌شود. JPEG، حداکثر ۲ مگابایت برای هر تصویر.</p>
          <div className="flex flex-wrap gap-3">{images.map((src,index) => <div className="relative size-24 overflow-hidden rounded-lg border" key={src}><Image unoptimized src={src} fill sizes="96px" className="object-cover" alt={`تصویر ${index+1}`} /><button type="button" className="absolute left-1 top-1 rounded-md bg-card p-1" aria-label={`حذف تصویر ${index+1}`} onClick={() => setImages(current => current.filter((_,i)=>i!==index))}><Trash2 className="size-4"/></button></div>)}</div>
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed p-5 text-sm"><Upload className="size-4"/>{uploading ? "در حال آپلود…" : "انتخاب تصاویر"}<input className="sr-only" type="file" accept={rules.imageMime} multiple onChange={event => { void uploadFiles(event.target.files); event.target.value=""; }} /></label>{imageError && <p role="alert" className="text-sm text-destructive">{imageError}</p>}
        </fieldset>
        <fieldset disabled={busy} className="space-y-3"><legend className="mb-3 font-medium">رنگ‌ها و موجودی هر رنگ</legend>
          {variants.fields.map((item,index) => <div key={item.fieldKey} className="grid grid-cols-[1fr_3rem_5rem_auto] items-end gap-2"><label className="form-field">نام رنگ<input {...form.register(`variants.${index}.name`)} /></label><label className="form-field">رنگ<input type="color" {...form.register(`variants.${index}.hex`)} /></label><label className="form-field">موجودی<input type="number" min="0" {...form.register(`variants.${index}.quantity`,{valueAsNumber:true})} /></label><Button type="button" variant="ghost" aria-label="حذف رنگ" onClick={()=>variants.remove(index)}><Trash2/></Button></div>)}
          {form.formState.errors.variants && <p role="alert" className="text-sm text-destructive">نام و موجودی رنگ‌ها را بررسی کنید؛ شناسه‌ها باید یکتا باشند.</p>}
          <Button type="button" variant="outline" onClick={()=>variants.append({id:crypto.randomUUID(),name:"",hex:"#191b19",quantity:0})}><Plus/>افزودن رنگ</Button>
        </fieldset>
        <label className="form-field">توضیحات HTML<textarea {...form.register("description")} disabled={busy} dir="auto" placeholder="<p>توضیحات محصول</p>"/><span role="alert">{form.formState.errors.description?.message}</span><span className="text-xs text-muted-foreground">پاراگراف، فهرست و متن برجسته پشتیبانی می‌شوند؛ محتوای ناامن هنگام ذخیره پاک می‌شود.</span></label>
        <fieldset disabled={busy} className="flex flex-wrap items-center gap-5"><label className="flex items-center gap-2 text-sm"><input type="checkbox" {...form.register("isHero")}/>نمایش در ویترین اصلی</label><label className="form-field">ترتیب ویترین<input type="number" min="0" {...form.register("heroOrder",{setValueAs:value=>value===""?null:Number(value)})}/><span role="alert">{form.formState.errors.heroOrder?.message}</span></label></fieldset>
        {mutation.isError && <p role="alert" className="text-sm text-destructive">{getApiErrorMessage(mutation.error)}</p>}
        <div className="sticky bottom-0 flex justify-end gap-3 border-t bg-card py-4"><Button type="button" variant="outline" disabled={busy} onClick={close}>انصراف</Button><Button disabled={busy || categories.isPending || groups.isPending || categories.isError || groups.isError}>{busy && <Loader2 className="animate-spin"/>}ذخیرهٔ محصول</Button></div>
      </form>
    </DialogContent>
  </Dialog>;
}
