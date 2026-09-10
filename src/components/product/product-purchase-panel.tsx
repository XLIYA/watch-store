"use client";

import { useState } from "react";

import { ShoppingBag } from "lucide-react";
import { toast } from "sonner";

import { ProductVariantSelector } from "@/components/product/product-variant-selector";
import { QuantitySelector } from "@/components/product/quantity-selector";

import { addItem } from "@/features/cart/cart.slice";

import {
    useAppDispatch,
    useAppSelector,
} from "@/store/hooks";

import type {
    Product,
    ProductVariant,
} from "@/types/product";

interface ProductPurchasePanelProps {
    product: Product;
}

export function ProductPurchasePanel({
    product,
}: ProductPurchasePanelProps) {
    const dispatch = useAppDispatch();

    const firstAvailableVariant =
        product.variants.find(
            (variant) => variant.quantity > 0,
        ) ?? null;

    const [
        selectedVariantId,
        setSelectedVariantId,
    ] = useState<string | null>(
        firstAvailableVariant?.id ?? null,
    );

    const [quantity, setQuantity] =
        useState(1);

    const selectedVariant:
        | ProductVariant
        | null =
        product.variants.find(
            (variant) =>
                variant.id ===
                selectedVariantId,
        ) ?? null;

    const selectedLineId =
        selectedVariantId
            ? `${product.id}:${selectedVariantId}`
            : null;

    const existingCartItem =
        useAppSelector((state) => {
            if (!selectedLineId) {
                return undefined;
            }

            return state.cart.items.find(
                (item) =>
                    item.lineId === selectedLineId,
            );
        });

    const quantityAlreadyInCart =
        existingCartItem?.quantity ?? 0;

    const variantStock =
        selectedVariant?.quantity ?? 0;

    /*
     * مقدار باقی‌مانده‌ای که کاربر
     * اجازه دارد به Cart اضافه کند.
     */
    const availableToAdd = Math.max(
        0,
        variantStock -
        quantityAlreadyInCart,
    );

    const canAddToCart =
        selectedVariant !== null &&
        product.quantity > 0 &&
        availableToAdd > 0 &&
        quantity > 0 &&
        quantity <= availableToAdd;

    const handleVariantChange = (
        variantId: string,
    ) => {
        setSelectedVariantId(variantId);
        setQuantity(1);
    };

    const handleQuantityChange = (
        newQuantity: number,
    ) => {
        setQuantity(newQuantity);
    };

    const handleAddToCart = () => {
        if (!selectedVariant) {
            toast.warning(
                "ابتدا رنگ محصول را انتخاب کنید.",
            );

            return;
        }

        if (variantStock <= 0) {
            toast.warning(
                "رنگ انتخاب‌شده موجود نیست.",
            );

            return;
        }

        if (availableToAdd <= 0) {
            toast.warning(
                "تمام موجودی این رنگ در سبد خرید شما قرار دارد.",
            );

            return;
        }

        if (quantity > availableToAdd) {
            toast.warning(
                "تعداد انتخاب‌شده بیشتر از موجودی قابل افزودن است.",
                {
                    description: `حداکثر ${availableToAdd.toLocaleString(
                        "fa-IR",
                    )} عدد دیگر قابل افزودن است.`,
                },
            );

            return;
        }

        const thumbnail =
            product.thumbnail ||
            product.images?.[0] ||
            "";

        const wasAlreadyInCart =
            Boolean(existingCartItem);

        dispatch(
            addItem({
                productId: product.id,

                variantId:
                    selectedVariant.id,

                name: product.name,

                thumbnail,

                colorName:
                    selectedVariant.name,

                colorHex:
                    selectedVariant.hex,

                unitPrice:
                    product.price,

                quantity,

                maxQuantity:
                    selectedVariant.quantity,
            }),
        );

        if (wasAlreadyInCart) {
            toast.success(
                "تعداد محصول در سبد خرید به‌روزرسانی شد.",
            );
        } else {
            toast.success(
                "محصول به سبد خرید اضافه شد.",
            );
        }

        setQuantity(1);
    };

    return (
        <div className="mt-10 space-y-7">
            <ProductVariantSelector
                variants={product.variants}
                selectedVariantId={
                    selectedVariantId
                }
                onVariantChange={
                    handleVariantChange
                }
            />

            <QuantitySelector
                value={quantity}
                max={availableToAdd}
                disabled={
                    !selectedVariant ||
                    availableToAdd <= 0
                }
                onChange={
                    handleQuantityChange
                }
            />

            {selectedVariant &&
                quantityAlreadyInCart > 0 ? (
                <div className="text-xs leading-6 text-muted-foreground">
                    در حال حاضر{" "}
                    {quantityAlreadyInCart.toLocaleString(
                        "fa-IR",
                    )}{" "}
                    عدد از این رنگ در سبد خرید
                    شما قرار دارد.
                </div>
            ) : null}

            {selectedVariant &&
                availableToAdd === 0 ? (
                <div className="border border-border bg-secondary/60 p-4 text-sm leading-7">
                    تمام موجودی این رنگ در سبد
                    خرید شما قرار گرفته است.
                </div>
            ) : null}

            <div className="border-t border-border pt-7">
                <div className="flex items-center justify-between gap-6 text-sm">
                    <span className="text-muted-foreground">
                        مبلغ انتخاب فعلی
                    </span>

                    <span className="font-medium">
                        {(
                            product.price *
                            quantity
                        ).toLocaleString(
                            "fa-IR",
                        )}{" "}
                        تومان
                    </span>
                </div>
            </div>

            <button
                type="button"
                disabled={!canAddToCart}
                onClick={handleAddToCart}
                className="
          luxury-transition
          flex
          min-h-13
          w-full
          items-center
          justify-center
          gap-3
          bg-foreground
          px-6
          py-4
          text-sm
          text-background
          hover:opacity-85
          disabled:cursor-not-allowed
          disabled:opacity-35
        "
            >
                <ShoppingBag
                    className="size-[18px]"
                    strokeWidth={1.5}
                />

                {availableToAdd > 0
                    ? "افزودن به سبد خرید"
                    : "حداکثر موجودی در سبد خرید"}
            </button>
        </div>
    );
}