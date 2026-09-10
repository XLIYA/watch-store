"use client";

import { useState } from "react";

import {
    CalendarIcon,
} from "lucide-react";

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

/*
 * مقدار YYYY-MM-DD ذخیره‌شده در فرم
 * را بدون مشکل UTC به Date تبدیل می‌کند.
 */
function parseIsoDate(
    value: string,
): Date | undefined {
    if (!value) {
        return undefined;
    }

    const parts = value
        .split("-")
        .map(Number);

    if (parts.length !== 3) {
        return undefined;
    }

    const [
        year,
        month,
        day,
    ] = parts;

    if (
        !year ||
        !month ||
        !day
    ) {
        return undefined;
    }

    const date = new Date(
        year,
        month - 1,
        day,
    );

    if (
        Number.isNaN(
            date.getTime(),
        )
    ) {
        return undefined;
    }

    return date;
}

/*
 * Date انتخاب‌شده را برای Backend
 * به YYYY-MM-DD میلادی تبدیل می‌کند.
 */
function formatIsoDate(
    date: Date,
) {
    const year =
        date.getFullYear();

    const month = String(
        date.getMonth() + 1,
    ).padStart(2, "0");

    const day = String(
        date.getDate(),
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

/*
 * تاریخ برای نمایش به کاربر
 * با تقویم شمسی فارسی.
 */
function formatPersianDate(
    date: Date,
) {
    return new Intl.DateTimeFormat(
        "fa-IR-u-ca-persian",
        {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        },
    ).format(date);
}

/*
 * حداقل تاریخ تحویل:
 * ۷ روز بعد از امروز
 */
function getMinimumDeliveryDate() {
    const date = new Date();

    date.setHours(
        0,
        0,
        0,
        0,
    );

    date.setDate(
        date.getDate() + 7,
    );

    return date;
}

export function DeliveryDatePicker({
    value,
    onChange,
    error,
}: DeliveryDatePickerProps) {
    const [
        open,
        setOpen,
    ] = useState(false);

    const selectedDate =
        parseIsoDate(value);

    const minimumDate =
        getMinimumDeliveryDate();

    const handleSelect = (
        date: Date | undefined,
    ) => {
        if (!date) {
            return;
        }

        onChange(
            formatIsoDate(date),
        );

        setOpen(false);
    };

    return (
        <div>
            <label
                htmlFor="deliveryDate"
                className="mb-2 block text-sm font-medium"
            >
                تاریخ تحویل
            </label>

            <Popover
                open={open}
                onOpenChange={setOpen}
            >
                <PopoverTrigger
                    asChild
                >
                    <Button
                        id="deliveryDate"
                        type="button"
                        variant="outline"
                        className={cn(
                            "h-12 w-full justify-between rounded-none border-border bg-background px-4 font-normal",
                            !selectedDate &&
                            "text-muted-foreground",
                            error &&
                            "border-destructive",
                        )}
                    >
                        <span>
                            {selectedDate
                                ? formatPersianDate(
                                    selectedDate,
                                )
                                : "انتخاب تاریخ"}
                        </span>

                        <CalendarIcon
                            className="size-4 opacity-60"
                            strokeWidth={1.5}
                        />
                    </Button>
                </PopoverTrigger>

                <PopoverContent
                    className="w-auto p-0"
                    align="start"
                    dir="rtl"
                >
                    <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={handleSelect}
                        disabled={{
                            before: minimumDate,
                        }}
                        defaultMonth={
                            selectedDate ??
                            minimumDate
                        }
                        autoFocus
                    />
                </PopoverContent>
            </Popover>

            <p className="mt-2 text-xs leading-6 text-muted-foreground">
                اولین تاریخ قابل انتخاب،
                ۷ روز پس از امروز است.
            </p>

            {error ? (
                <p className="mt-2 text-xs text-destructive">
                    {error}
                </p>
            ) : null}
        </div>
    );
}