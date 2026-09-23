"use client";
import { formatNumber } from "@/lib/format";

import { selectCartTotals } from "@/features/cart/cart.selectors";

import { useEffect } from "react";

import Image from "next/image";
import Link from "next/link";

import {
    ShoppingBag,
    X,
} from "lucide-react";

import { useAppSelector } from "@/store/hooks";

interface HeaderCartProps {
    onClose: () => void;
}

export function HeaderCart({
    onClose,
}: HeaderCartProps) {
    const items = useAppSelector(
        (state) => state.cart.items,
    );

    const { totalQuantity, totalPrice } = useAppSelector(selectCartTotals);

    useEffect(() => {
        function handleKeyDown(
            event: KeyboardEvent,
        ) {
            if (event.key === "Escape") {
                onClose();
            }
        }

        window.addEventListener(
            "keydown",
            handleKeyDown,
        );

        return () => {
            window.removeEventListener(
                "keydown",
                handleKeyDown,
            );
        };
    }, [onClose]);

    return (
        <div
            className="fixed inset-0 z-[80]"
            role="dialog"
            aria-modal="true"
            aria-label="سبد خرید"
        >
            {/* Backdrop */}
            <button
                type="button"
                aria-label="بستن سبد خرید"
                className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
                onClick={onClose}
            />

            {/* Drawer */}
            <aside
                className="
          absolute
          left-0
          top-0
          flex
          h-full
          w-full
          max-w-md
          flex-col
          bg-background
          shadow-2xl
        "
            >
                {/* Header */}
                <div className="flex h-[72px] items-center justify-between border-b border-border px-6">
                    <div className="flex items-center gap-3">
                        <ShoppingBag
                            className="size-[18px]"
                            strokeWidth={1.5}
                        />

                        <div>
                            <p className="font-medium">
                                سبد خرید
                            </p>

                            <p className="mt-0.5 text-xs text-muted-foreground">
                                {formatNumber(totalQuantity)}{" "}
                                کالا
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="luxury-transition flex size-10 items-center justify-center hover:bg-secondary"
                        aria-label="بستن سبد خرید"
                    >
                        <X
                            className="size-[18px]"
                            strokeWidth={1.5}
                        />
                    </button>
                </div>

                {/* Empty cart */}
                {items.length === 0 ? (
                    <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
                        <div className="flex size-16 items-center justify-center rounded-full border border-border">
                            <ShoppingBag
                                className="size-6 text-muted-foreground"
                                strokeWidth={1.25}
                            />
                        </div>

                        <h2 className="mt-6 text-lg font-medium">
                            سبد خرید شما خالی است
                        </h2>

                        <p className="mt-3 max-w-xs text-sm leading-7 text-muted-foreground">
                            هنوز ساعتی به سبد خرید اضافه
                            نکرده‌اید.
                        </p>

                        <Link
                            href="/shop"
                            onClick={onClose}
                            className="luxury-transition mt-8 bg-foreground px-7 py-3 text-sm text-background hover:opacity-85"
                        >
                            مشاهده محصولات
                        </Link>
                    </div>
                ) : (
                    <>
                        {/* Items */}
                        <div className="flex-1 overflow-y-auto px-6">
                            {items.map((item) => (
                                <Link
                                    key={item.lineId}
                                    href={`/product/${item.productId}`}
                                    onClick={onClose}
                                    className="group flex gap-4 border-b border-border py-6"
                                >
                                    <div className="relative h-28 w-24 shrink-0 overflow-hidden bg-secondary">
                                        {item.thumbnail ? (
                                            <Image
                                                src={item.thumbnail}
                                                alt={item.name}
                                                fill
                                                sizes="96px"
                                                className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                                            />
                                        ) : null}
                                    </div>

                                    <div className="flex min-w-0 flex-1 flex-col">
                                        <h3
                                            dir="ltr"
                                            className="truncate font-heading text-xl font-medium"
                                        >
                                            {item.name}
                                        </h3>

                                        <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                                            <span
                                                className="size-3 rounded-full border border-black/10"
                                                style={{
                                                    backgroundColor:
                                                        item.colorHex,
                                                }}
                                            />

                                            <span>
                                                {item.colorName}
                                            </span>
                                        </div>

                                        <div className="mt-auto flex items-end justify-between gap-4 pt-4">
                                            <span className="text-xs text-muted-foreground">
                                                تعداد{" "}
                                                {formatNumber(item.quantity)}
                                            </span>

                                            <span className="text-sm">
                                                {formatNumber((
                                                    item.unitPrice *
                                                    item.quantity
                                                ))}{" "}
                                                تومان
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {/* Summary */}
                        <div className="border-t border-border bg-background px-6 py-6">
                            <div className="flex items-center justify-between gap-6">
                                <span className="text-sm text-muted-foreground">
                                    مجموع
                                </span>

                                <span className="font-medium">
                                    {formatNumber(totalPrice)}{" "}
                                    تومان
                                </span>
                            </div>

                            <Link
                                href="/cart"
                                onClick={onClose}
                                className="luxury-transition mt-6 flex w-full items-center justify-center bg-foreground px-6 py-3.5 text-sm text-background hover:opacity-85"
                            >
                                مشاهده سبد خرید
                            </Link>
                        </div>
                    </>
                )}
            </aside>
        </div>
    );
}