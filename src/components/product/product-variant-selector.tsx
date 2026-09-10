"use client";

import type { ProductVariant } from "@/types/product";

interface ProductVariantSelectorProps {
    variants: ProductVariant[];
    selectedVariantId: string | null;
    onVariantChange: (variantId: string) => void;
}

export function ProductVariantSelector({
    variants,
    selectedVariantId,
    onVariantChange,
}: ProductVariantSelectorProps) {
    const selectedVariant =
        variants.find(
            (variant) =>
                variant.id === selectedVariantId,
        ) ?? null;

    if (variants.length === 0) {
        return (
            <div className="border-t border-border pt-7">
                <p className="text-sm text-muted-foreground">
                    این محصول تنوع رنگ ندارد.
                </p>
            </div>
        );
    }

    return (
        <div className="border-t border-border pt-7">
            <div className="flex items-center justify-between gap-6">
                <p className="text-sm">
                    انتخاب رنگ
                </p>

                {selectedVariant ? (
                    <p className="text-sm text-muted-foreground">
                        {selectedVariant.name}
                    </p>
                ) : null}
            </div>

            <div
                className="mt-5 flex flex-wrap gap-3"
                role="radiogroup"
                aria-label="انتخاب رنگ محصول"
            >
                {variants.map((variant) => {
                    const isSelected =
                        selectedVariantId === variant.id;

                    const isDisabled =
                        variant.quantity <= 0;

                    return (
                        <button
                            key={variant.id}
                            type="button"
                            role="radio"
                            aria-checked={isSelected}
                            disabled={isDisabled}
                            aria-label={`${variant.name}${isDisabled
                                ? " - ناموجود"
                                : ""
                                }`}
                            title={`${variant.name}${isDisabled
                                ? " - ناموجود"
                                : ""
                                }`}
                            onClick={() =>
                                onVariantChange(
                                    variant.id,
                                )
                            }
                            className={`
                luxury-transition
                relative
                flex
                size-11
                items-center
                justify-center
                rounded-full
                border
                ${isSelected
                                    ? "border-foreground"
                                    : "border-border"
                                }
                ${isDisabled
                                    ? "cursor-not-allowed opacity-30"
                                    : "hover:border-foreground/60"
                                }
              `}
                        >
                            <span
                                className="size-7 rounded-full border border-black/10"
                                style={{
                                    backgroundColor:
                                        variant.hex,
                                }}
                            />

                            {isSelected ? (
                                <span className="pointer-events-none absolute inset-[-4px] rounded-full border border-foreground/30" />
                            ) : null}

                            {isDisabled ? (
                                <span className="pointer-events-none absolute h-px w-8 rotate-45 bg-foreground/50" />
                            ) : null}
                        </button>
                    );
                })}
            </div>

            {selectedVariant ? (
                <div className="mt-5 flex items-center justify-between gap-4 text-xs">
                    <span className="text-muted-foreground">
                        موجودی رنگ انتخاب‌شده
                    </span>

                    <span>
                        {selectedVariant.quantity.toLocaleString(
                            "fa-IR",
                        )}{" "}
                        عدد
                    </span>
                </div>
            ) : (
                <p className="mt-5 text-xs text-destructive">
                    هیچ رنگی از این محصول موجود نیست.
                </p>
            )}
        </div>
    );
}