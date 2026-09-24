"use client";
import { useState } from "react";
import Image from "next/image";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Plus, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PriceInput } from "@/components/ui/price-input";
import { ColorPicker } from "@/components/ui/color-picker";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { useCategories } from "@/features/catalog/use-categories";
import { getSubcategories } from "@/services/categories.service";
import { productImageError } from "@/services/products.service";
import { getApiErrorMessage } from "@/services/api/api-error";
import { useSaveProduct, useImageUploadMutation } from "./mutations";
import { productSchema, type ProductFormValues } from "./product.schema";
import type { Product } from "@/types/product";
import rules from "../../../../shared/product-rules.json";

/** ایجاد و ویرایش همین فرم را مصرف می‌کنند؛ Controller قرارداد کنترل‌های Radix را به React Hook Form وصل می‌کند. */
export function ProductEditor({
  product,
  onClose,
}: {
  product?: Product;
  onClose: () => void;
}) {
  const categories = useCategories();
  const groups = useQuery({
    queryKey: ["catalog", "subcategories"],
    queryFn: () => getSubcategories(),
  });
  const [images, setImages] = useState(product?.images ?? []);
  const [uploading, setUploading] = useState(false);
  const [imageError, setImageError] = useState("");
  const [confirmClose, setConfirmClose] = useState(false);
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: product ?? {
      name: "",
      brand: "",
      slug: "",
      category: 0,
      subcategory: 0,
      description: "",
      price: 0,
      quantity: 0,
      variants: [],
      isHero: false,
      heroOrder: null,
    },
  });
  const category = useWatch({ control: form.control, name: "category" });
  const variants = useFieldArray({
    control: form.control,
    name: "variants",
    keyName: "fieldKey",
  });
  const mutation = useSaveProduct(() => {
    toast.success(product ? "تغییرات محصول ذخیره شد." : "محصول جدید ثبت شد.");
    onClose();
  });
  const upload = useImageUploadMutation();
  const busy = mutation.isPending || uploading;
  /** ابتدا کل انتخاب اعتبارسنجی می‌شود؛ آپلودهای موفق قبل از خطای شبکه در draft حفظ می‌شوند. */
  async function uploadFiles(files: FileList | null) {
    if (!files?.length) return;
    setImageError("");
    if (images.length + files.length > rules.maxImages) {
      setImageError("تعداد تصاویر از حد مجاز بیشتر است.");
      return;
    }
    const error = [...files].map(productImageError).find(Boolean);
    if (error) {
      setImageError(error);
      return;
    }
    setUploading(true);
    try {
      for (const file of [...files]) {
        const url = await upload.mutateAsync(file);
        setImages((current) => [...current, url]);
      }
    } catch (error) {
      setImageError(getApiErrorMessage(error));
    } finally {
      setUploading(false);
    }
  }
  /** خروج از فرم دارای تغییر به مودال تأیید می‌رود؛ بستن هنگام درخواست فعال مسدود است. */
  function close() {
    if (busy) return;
    if (
      form.formState.isDirty ||
      JSON.stringify(images) !== JSON.stringify(product?.images ?? [])
    )
      setConfirmClose(true);
    else onClose();
  }
  function submit(values: ProductFormValues) {
    if (!images.length) {
      setImageError("حداقل یک تصویر محصول لازم است.");
      return;
    }
    mutation.mutate({
      id: product?.id,
      payload: { ...values, thumbnail: images[0], images },
    });
  }
  return (
    <>
      <Dialog
        open
        onOpenChange={(open) => {
          if (!open) close();
        }}
      >
        <DialogContent
          dir="rtl"
          className="flex max-h-[90dvh] flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl"
          onInteractOutside={(event) => event.preventDefault()}
        >
          <DialogHeader className="shrink-0 border-b px-6 py-5 text-right">
            <DialogTitle>{product ? "ویرایش محصول" : "محصول تازه"}</DialogTitle>
            <DialogDescription>
              اطلاعات ساعت، تصاویر و موجودی را یکجا مدیریت کنید.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={form.handleSubmit(submit)}
            noValidate
            className="flex min-h-0 flex-1 flex-col"
          >
            <div className="min-h-0 flex-1 space-y-7 overflow-y-auto px-6 py-6">
              {(categories.isError || groups.isError) && (
                <div role="alert">
                  دریافت گروه‌ها ناموفق بود.
                  <Button
                    type="button"
                    variant="link"
                    onClick={() => {
                      void categories.refetch();
                      void groups.refetch();
                    }}
                  >
                    تلاش دوباره
                  </Button>
                </div>
              )}
              <fieldset disabled={busy} className="grid gap-5 sm:grid-cols-2">
                <legend className="mb-4 font-medium">هویت محصول</legend>
                {(
                  [
                    ["name", "نام محصول"],
                    ["brand", "برند"],
                    ["slug", "شناسهٔ انگلیسی در آدرس"],
                  ] as const
                ).map(([name, label]) => (
                  <div className="grid gap-2" key={name}>
                    <Label htmlFor={name}>{label}</Label>
                    <Input
                      id={name}
                      {...form.register(name)}
                      className="text-right"
                      aria-invalid={!!form.formState.errors[name]}
                    />
                    <p role="alert" className="text-xs text-destructive">
                      {form.formState.errors[name]?.message}
                    </p>
                  </div>
                ))}
                {(["category", "subcategory"] as const).map((name) => (
                  <div className="grid gap-2" key={name}>
                    <Label htmlFor={name}>
                      {name === "category" ? "سرگروه" : "گروه"}
                    </Label>
                    <Controller
                      name={name}
                      control={form.control}
                      render={({ field }) => (
                        <Select
                          dir="rtl"
                          value={field.value ? String(field.value) : ""}
                          onValueChange={(value) => {
                            field.onChange(Number(value));
                            if (name === "category")
                              form.setValue("subcategory", 0, {
                                shouldDirty: true,
                              });
                          }}
                          disabled={
                            busy ||
                            categories.isPending ||
                            groups.isPending ||
                            (name === "subcategory" && !category)
                          }
                        >
                          <SelectTrigger
                            id={name}
                            className="w-full"
                            onBlur={field.onBlur}
                          >
                            <SelectValue placeholder="انتخاب کنید" />
                          </SelectTrigger>
                          <SelectContent>
                            {(name === "category"
                              ? categories.data
                              : groups.data?.filter(
                                  (item) => item.category === category,
                                )
                            )?.map((item) => (
                              <SelectItem key={item.id} value={String(item.id)}>
                                {item.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    <p role="alert" className="text-xs text-destructive">
                      {form.formState.errors[name]?.message}
                    </p>
                  </div>
                ))}
                <div className="grid gap-2">
                  <Label htmlFor="product-price">قیمت (تومان)</Label>
                  <Controller
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <PriceInput
                        id="product-price"
                        disabled={busy}
                        value={field.value}
                        onBlur={field.onBlur}
                        onValueChange={(value) =>
                          field.onChange(value === "" ? NaN : Number(value))
                        }
                      />
                    )}
                  />
                  <p role="alert" className="text-xs text-destructive">
                    {form.formState.errors.price?.message}
                  </p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="product-quantity">موجودی کل</Label>
                  <Input
                    id="product-quantity"
                    type="number"
                    min="0"
                    {...form.register("quantity", { valueAsNumber: true })}
                  />
                  <p role="alert" className="text-xs text-destructive">
                    {form.formState.errors.quantity?.message}
                  </p>
                </div>
              </fieldset>
              <fieldset disabled={busy} className="space-y-4">
                <legend className="mb-3 font-medium">تصاویر محصول</legend>
                <p className="text-xs text-muted-foreground">
                  تصویر اول تصویر اصلی است؛ حداکثر{" "}
                  {rules.maxImages.toLocaleString("fa-IR")} فایل JPEG و{" "}
                  {(rules.maxImageBytes / 1024 / 1024).toLocaleString("fa-IR")}{" "}
                  مگابایت برای هر تصویر.
                </p>
                <div className="flex flex-wrap gap-3">
                  {images.map((src, index) => (
                    <div
                      key={src}
                      className="relative size-24 overflow-hidden rounded-lg border"
                    >
                      <Image
                        unoptimized
                        src={src}
                        fill
                        sizes="96px"
                        alt={"تصویر " + (index + 1)}
                        className="object-cover"
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        size="icon-sm"
                        className="absolute left-1 top-1"
                        aria-label={"حذف تصویر " + (index + 1)}
                        onClick={() =>
                          setImages((current) =>
                            current.filter((_, i) => i !== index),
                          )
                        }
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  ))}
                </div>
                <Label
                  htmlFor="product-images"
                  className="flex cursor-pointer justify-center gap-2 rounded-lg border border-dashed p-5"
                >
                  <Upload className="size-4" />
                  {uploading ? "در حال آپلود…" : "انتخاب تصاویر"}
                </Label>
                <Input
                  id="product-images"
                  type="file"
                  className="sr-only"
                  accept={rules.imageMime}
                  multiple
                  onChange={(event) => {
                    void uploadFiles(event.target.files);
                    event.target.value = "";
                  }}
                />
                {imageError && (
                  <p role="alert" className="text-sm text-destructive">
                    {imageError}
                  </p>
                )}
              </fieldset>
              <fieldset disabled={busy} className="space-y-4">
                <legend className="mb-3 font-medium">
                  رنگ‌ها و موجودی هر رنگ
                </legend>
                {variants.fields.map((item, index) => (
                  <div
                    key={item.fieldKey}
                    className="grid grid-cols-[minmax(0,1fr)_3rem_5rem_auto] items-end gap-2"
                  >
                    <div className="grid gap-2">
                      <Label htmlFor={"variant-name-" + index}>نام رنگ</Label>
                      <Input
                        id={"variant-name-" + index}
                        {...form.register(`variants.${index}.name`)}
                      />
                    </div>
                    <Controller
                      control={form.control}
                      name={`variants.${index}.hex`}
                      render={({ field }) => (
                        <ColorPicker
                          value={field.value}
                          onChange={field.onChange}
                          disabled={busy}
                        />
                      )}
                    />
                    <div className="grid gap-2">
                      <Label htmlFor={"variant-stock-" + index}>موجودی</Label>
                      <Input
                        id={"variant-stock-" + index}
                        type="number"
                        min="0"
                        {...form.register(`variants.${index}.quantity`, {
                          valueAsNumber: true,
                        })}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label="حذف رنگ"
                      onClick={() => variants.remove(index)}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                ))}
                {form.formState.errors.variants && (
                  <p role="alert" className="text-sm text-destructive">
                    نام، کد رنگ و موجودی را بررسی کنید؛ جمع موجودی رنگ‌ها نباید
                    بیشتر از موجودی کل باشد.
                  </p>
                )}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    variants.append({
                      id: crypto.randomUUID(),
                      name: "",
                      hex: "#165650",
                      quantity: 0,
                    })
                  }
                >
                  <Plus />
                  افزودن رنگ
                </Button>
              </fieldset>
              <div className="space-y-3">
                <Label>توضیحات محصول</Label>
                <Controller
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <RichTextEditor
                      value={field.value}
                      onChange={field.onChange}
                      disabled={busy}
                    />
                  )}
                />
                <p role="alert" className="text-xs text-destructive">
                  {form.formState.errors.description?.message}
                </p>
              </div>
              <fieldset
                disabled={busy}
                className="flex flex-wrap items-center gap-5"
              >
                <Controller
                  control={form.control}
                  name="isHero"
                  render={({ field }) => (
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="product-hero"
                        checked={field.value}
                        disabled={busy}
                        onCheckedChange={(checked) =>
                          field.onChange(checked === true)
                        }
                      />
                      <Label htmlFor="product-hero">نمایش در ویترین اصلی</Label>
                    </div>
                  )}
                />
                <div className="grid gap-2">
                  <Label htmlFor="hero-order">ترتیب ویترین</Label>
                  <Input
                    id="hero-order"
                    type="number"
                    min="0"
                    {...form.register("heroOrder", {
                      setValueAs: (value) =>
                        value === "" ? null : Number(value),
                    })}
                  />
                  <p role="alert" className="text-xs text-destructive">
                    {form.formState.errors.heroOrder?.message}
                  </p>
                </div>
              </fieldset>
              {mutation.isError && (
                <p role="alert" className="text-sm text-destructive">
                  {getApiErrorMessage(mutation.error)}
                </p>
              )}
            </div>
            {/* footer بیرون ناحیهٔ scroll است تا padding فرم زیر دکمه‌ها شکاف ایجاد نکند. */}
            <div className="flex shrink-0 justify-end gap-3 border-t bg-card px-6 py-4">
              <Button
                type="button"
                variant="outline"
                disabled={busy}
                onClick={close}
              >
                انصراف
              </Button>
              <Button
                disabled={
                  busy ||
                  categories.isPending ||
                  groups.isPending ||
                  categories.isError ||
                  groups.isError
                }
              >
                {busy && <Loader2 className="animate-spin" />}ذخیرهٔ محصول
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      <ConfirmDialog
        open={confirmClose}
        onOpenChange={setConfirmClose}
        onConfirm={onClose}
      />
    </>
  );
}
