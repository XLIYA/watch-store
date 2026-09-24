"use client";

import { useState } from "react";

import { CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { cn } from "cn";

interface DeliveryDatePickerProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

import {
  getMinimumDeliveryDate,
  parseIsoDate,
  formatIsoDate,
} from "@/features/checkout/delivery-date";
import { formatFilterDate as formatPersianDate } from "@/lib/format";

export function DeliveryDatePicker({
  value,
  onChange,
  error,
}: DeliveryDatePickerProps) {
  const [open, setOpen] = useState(false);

  const selectedDate = parseIsoDate(value);

  const minimumDate = getMinimumDeliveryDate();

  const handleSelect = (date: Date | undefined) => {
    if (!date) {
      return;
    }

    onChange(formatIsoDate(date));

    setOpen(false);
  };

  return (
    <div>
      <label htmlFor="deliveryDate" className="mb-2 block text-sm font-medium">
        تاریخ تحویل
      </label>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id="deliveryDate"
            type="button"
            variant="outline"
            className={cn(
              "h-12 w-full justify-between rounded-md border-border bg-background px-4 font-normal",
              !selectedDate && "text-muted-foreground",
              error && "border-destructive",
            )}
          >
            <span>
              {selectedDate ? formatPersianDate(selectedDate) : "انتخاب تاریخ"}
            </span>

            <CalendarIcon className="size-4 opacity-60" strokeWidth={1.5} />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-auto p-0" align="start" dir="rtl">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleSelect}
            disabled={{
              before: minimumDate,
            }}
            defaultMonth={selectedDate ?? minimumDate}
            autoFocus
          />
        </PopoverContent>
      </Popover>

      <p className="mt-2 text-xs leading-6 text-muted-foreground">
        اولین تاریخ قابل انتخاب، ۷ روز پس از امروز است.
      </p>

      {error ? <p className="mt-2 text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
