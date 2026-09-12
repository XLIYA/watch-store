"use client";

import {
    Minus,
    Plus,
} from "lucide-react";

interface QuantitySelectorProps {
    value: number;
    max: number;
    disabled?: boolean;
    onChange: (quantity: number) => void;
}

export function QuantitySelector({
    value,
    max,
    disabled = false,
    onChange,
}: QuantitySelectorProps) {
    const canDecrease =
        !disabled && value > 1;

    const canIncrease =
        !disabled && value < max;

    return (
        <div className="border-t border-border pt-7">
            <div className="flex items-center justify-between gap-6">
                <div>
                    <p className="text-sm">
                        تعداد
                    </p>

                    {max > 0 ? (
                        <p className="mt-1 text-xs text-muted-foreground">
                            حداکثر{" "}
                            {max.toLocaleString(
                                "fa-IR",
                            )}{" "}
                            عدد
                        </p>
                    ) : null}
                </div>

                <div className="flex h-11 items-center border border-border">
                    <button
                        type="button"
                        disabled={!canDecrease}
                        onClick={() =>
                            onChange(value - 1)
                        }
                        className="luxury-transition flex size-10 items-center justify-center hover:bg-secondary disabled:pointer-events-none disabled:opacity-25"
                        aria-label="کاهش تعداد"
                    >
                        <Minus
                            className="size-4"
                            strokeWidth={1.5}
                        />
                    </button>

                    <span
                        className="min-w-12 text-center text-sm"
                        aria-live="polite"
                    >
                        {value.toLocaleString(
                            "fa-IR",
                        )}
                    </span>

                    <button
                        type="button"
                        disabled={!canIncrease}
                        onClick={() =>
                            onChange(value + 1)
                        }
                        className="luxury-transition flex size-10 items-center justify-center hover:bg-secondary disabled:pointer-events-none disabled:opacity-25"
                        aria-label="افزایش تعداد"
                    >
                        <Plus
                            className="size-4"
                            strokeWidth={1.5}
                        />
                    </button>
                </div>
            </div>
        </div>
    );
}