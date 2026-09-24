"use client";

import type { ComponentProps } from "react";
import { Input } from "./input";
import { persianDigits } from "@/lib/digits";

/** موبایل و کد پستی checkout این ورودی مشترک را دارند؛ تبدیل پیش از onChange فرم انجام می‌شود و طول رشته ثابت می‌ماند. */
export function PersianDigitInput({ onChange, value, defaultValue, ...props }: ComponentProps<typeof Input>) {
  return <Input {...props}
    value={value === undefined ? undefined : persianDigits(String(value))}
    defaultValue={defaultValue === undefined ? undefined : persianDigits(String(defaultValue))}
    onChange={event => {
      const { selectionStart, selectionEnd } = event.target;
      event.target.value = persianDigits(event.target.value);
      // تبدیل رقم هم‌طول است؛ مکان نشانگر در ویرایش وسط شماره حفظ می‌شود.
      if (selectionStart !== null && selectionEnd !== null) event.target.setSelectionRange(selectionStart, selectionEnd);
      onChange?.(event);
    }} />;
}
