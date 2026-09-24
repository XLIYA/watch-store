"use client";
import { Input } from "./input";
import { formatPrice } from "@/lib/format";
import type { ComponentProps } from "react";

/** فرم محصول و جدول موجودی مقدار خام را نگه می‌دارند؛ فقط نمایش با formatter مشترک فارسی می‌شود. */
export function PriceInput({
  value,
  onValueChange,
  ...props
}: Omit<ComponentProps<typeof Input>, "value" | "onChange" | "type"> & {
  value: string | number;
  onValueChange: (raw: string) => void;
}) {
  const raw = String(value ?? "");
  return (
    <Input
      {...props}
      type="text"
      inputMode="decimal"
      dir="rtl"
      className={`text-right tabular-nums ${props.className ?? ""}`}
      value={
        raw === "" || !Number.isFinite(Number(raw))
          ? ""
          : formatPrice(Number(raw))
      }
      onChange={(event) => {
        const normalized = event.target.value
          .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
          .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)))
          .replace(/[٬,\s]/g, "")
          .replace("٫", ".");
        if (/^\d*(\.\d*)?$/.test(normalized)) onValueChange(normalized);
      }}
    />
  );
}
