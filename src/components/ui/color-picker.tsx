"use client";
import { HexColorPicker } from "react-colorful";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Button } from "./button";
import { Input } from "./input";

/** انتخاب رنگ در فرم محصول با Popover شادسی‌ان انجام می‌شود؛ مقدار HEX همان قرارداد API باقی می‌ماند. */
export function ColorPicker({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          aria-label="انتخاب رنگ"
          className="w-full"
        >
          <span
            className="size-5 rounded-full border"
            style={{ backgroundColor: value }}
          />
          <span className="sr-only">{value}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-60 space-y-3" align="end" dir="rtl">
        <HexColorPicker color={value} onChange={onChange} />
        <Input
          aria-label="کد رنگ"
          dir="ltr"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          maxLength={7}
        />
      </PopoverContent>
    </Popover>
  );
}
