import { z } from "zod";
import rules from "../../../../shared/product-rules.json";

/** فرم افزودن و ویرایش از قرارداد مشترک استفاده می‌کند؛ عدد با valueAsNumber خوانده می‌شود تا ورودی خالی صفر نشود. */
export const productSchema = z.object({
  name: z.string().trim().min(1, "نام محصول را وارد کنید.").max(rules.nameMaxLength),
  brand: z.string().trim().min(1, "برند را وارد کنید."),
  slug: z.string().trim().min(1, "شناسهٔ متنی را وارد کنید.").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "فقط حروف کوچک انگلیسی، عدد و خط تیره مجاز است."),
  category: z.number().int().positive("سرگروه را انتخاب کنید."),
  subcategory: z.number().int().positive("گروه را انتخاب کنید."),
  description: z.string().trim().min(1, "توضیحات را وارد کنید.").max(rules.descriptionMaxLength),
  price: z.number().finite().min(0, "قیمت نمی‌تواند منفی باشد."),
  quantity: z.number().int().min(0, "موجودی باید عدد صحیح غیرمنفی باشد."),
  variants: z.array(z.object({ id: z.string().min(1), name: z.string().trim().min(1, "نام رنگ لازم است."), hex: z.string().regex(/^#[0-9a-f]{6}$/i), quantity: z.number().int().min(0) })),
  isHero: z.boolean(),
  heroOrder: z.number().int().min(0).nullable(),
}).superRefine((value, ctx) => {
  if (value.variants.reduce((sum, variant) => sum + variant.quantity, 0) > value.quantity) ctx.addIssue({code: "custom", path: ["quantity"], message: "مجموع موجودی رنگ‌ها از موجودی کل بیشتر است."});
  if (new Set(value.variants.map(variant => variant.id)).size !== value.variants.length) ctx.addIssue({code: "custom", path: ["variants"], message: "شناسهٔ رنگ‌ها باید یکتا باشد."});
});
export type ProductFormValues = z.infer<typeof productSchema>;
