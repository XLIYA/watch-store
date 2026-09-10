"use client";

import { useState } from "react";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
    Loader2,
    Minus,
    Plus,
    ShoppingBag,
    Trash2,
} from "lucide-react";

import { toast } from "sonner";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import {
    clearCart,
    removeItem,
    setItemQuantity,
    updateItemStock,
} from "@/features/cart/cart.slice";

import { useHydrated } from "@/hooks/use-hydrated";

import { getProductById } from "@/services/products.service";

import {
    useAppDispatch,
    useAppSelector,
} from "@/store/hooks";

import type { Product } from "@/types/product";

type PendingCartAction =
    | {
        type: "remove";
        lineId: string;
        itemName: string;
    }
    | {
        type: "clear";
    }
    | null;

export function CartPageContent() {
    const dispatch = useAppDispatch();
    const router = useRouter();

    const isHydrated = useHydrated();

    const items = useAppSelector(
        (state) => state.cart.items,
    );

    const [isValidating, setIsValidating] =
        useState(false);

    const [
        validationMessage,
        setValidationMessage,
    ] = useState<string | null>(null);

    const [
        pendingCartAction,
        setPendingCartAction,
    ] = useState<PendingCartAction>(
        null,
    );

    const totalQuantity = items.reduce(
        (total, item) =>
            total + item.quantity,
        0,
    );

    const totalPrice = items.reduce(
        (total, item) =>
            total +
            item.unitPrice *
            item.quantity,
        0,
    );

    const handleDecrease = (
        lineId: string,
        quantity: number,
        itemName: string,
    ) => {
        setValidationMessage(null);

        if (quantity <= 1) {
            setPendingCartAction({
                type: "remove",
                lineId,
                itemName,
            });

            return;
        }

        dispatch(
            setItemQuantity({
                lineId,
                quantity:
                    quantity - 1,
            }),
        );
    };

    const handleIncrease = (
        lineId: string,
        quantity: number,
        maxQuantity: number,
    ) => {
        setValidationMessage(null);

        if (
            quantity >=
            maxQuantity
        ) {
            toast.warning(
                "بیشتر از موجودی فعلی نمی‌توانید به سبد اضافه کنید.",
            );

            return;
        }

        dispatch(
            setItemQuantity({
                lineId,
                quantity:
                    quantity + 1,
            }),
        );
    };

    const handleRemove = (
        lineId: string,
        itemName: string,
    ) => {
        setPendingCartAction({
            type: "remove",
            lineId,
            itemName,
        });
    };

    const handleClearCart =
        () => {
            if (
                items.length === 0
            ) {
                return;
            }

            setPendingCartAction({
                type: "clear",
            });
        };

    const handleConfirmCartAction =
        () => {
            if (
                !pendingCartAction
            ) {
                return;
            }

            if (
                pendingCartAction.type ===
                "remove"
            ) {
                dispatch(
                    removeItem(
                        pendingCartAction.lineId,
                    ),
                );

                toast.success(
                    "محصول از سبد خرید حذف شد.",
                );
            }

            if (
                pendingCartAction.type ===
                "clear"
            ) {
                dispatch(
                    clearCart(),
                );

                toast.success(
                    "سبد خرید خالی شد.",
                );
            }

            setValidationMessage(
                null,
            );

            setPendingCartAction(
                null,
            );
        };

    const handleCheckout =
        async () => {
            if (
                items.length === 0 ||
                isValidating
            ) {
                return;
            }

            setIsValidating(true);
            setValidationMessage(
                null,
            );

            try {
                /*
                 * اگر از یک محصول چند Variant
                 * داخل Cart باشد، اطلاعات محصول
                 * فقط یک بار از Backend گرفته می‌شود.
                 */
                const productIds = [
                    ...new Set(
                        items.map(
                            (item) =>
                                item.productId,
                        ),
                    ),
                ];

                const productResults =
                    await Promise.all(
                        productIds.map(
                            async (
                                productId,
                            ): Promise<Product | null> => {
                                try {
                                    return await getProductById(
                                        productId,
                                    );
                                } catch {
                                    return null;
                                }
                            },
                        ),
                    );

                const productMap =
                    new Map<
                        number,
                        Product
                    >();

                for (const product of productResults) {
                    if (
                        !product
                    ) {
                        continue;
                    }

                    productMap.set(
                        product.id,
                        product,
                    );
                }

                let cartWasChanged =
                    false;

                let unavailableCount =
                    0;

                let reducedCount = 0;

                for (const item of items) {
                    const product =
                        productMap.get(
                            item.productId,
                        );

                    /*
                     * محصول از Backend حذف شده.
                     */
                    if (!product) {
                        dispatch(
                            removeItem(
                                item.lineId,
                            ),
                        );

                        unavailableCount +=
                            1;

                        cartWasChanged =
                            true;

                        continue;
                    }

                    const variant =
                        product.variants.find(
                            (
                                currentVariant,
                            ) =>
                                currentVariant.id ===
                                item.variantId,
                        );

                    /*
                     * Variant حذف شده
                     * یا موجودی ندارد.
                     */
                    if (
                        !variant ||
                        variant.quantity <=
                        0 ||
                        product.quantity <=
                        0
                    ) {
                        dispatch(
                            removeItem(
                                item.lineId,
                            ),
                        );

                        unavailableCount +=
                            1;

                        cartWasChanged =
                            true;

                        continue;
                    }

                    /*
                     * موجودی قابل فروش را
                     * از کمترین مقدار Product
                     * و Variant می‌گیریم.
                     */
                    const availableQuantity =
                        Math.min(
                            product.quantity,
                            variant.quantity,
                        );

                    if (
                        availableQuantity <=
                        0
                    ) {
                        dispatch(
                            removeItem(
                                item.lineId,
                            ),
                        );

                        unavailableCount +=
                            1;

                        cartWasChanged =
                            true;

                        continue;
                    }

                    /*
                     * موجودی ذخیره شده در Cart
                     * با Backend Sync می‌شود.
                     */
                    if (
                        item.maxQuantity !==
                        availableQuantity
                    ) {
                        dispatch(
                            updateItemStock({
                                lineId:
                                    item.lineId,

                                maxQuantity:
                                    availableQuantity,
                            }),
                        );
                    }

                    /*
                     * اگر تعداد Cart بیشتر
                     * از موجودی فعلی باشد،
                     * Reducer مقدار را کم می‌کند.
                     */
                    if (
                        item.quantity >
                        availableQuantity
                    ) {
                        reducedCount +=
                            1;

                        cartWasChanged =
                            true;
                    }
                }

                /*
                 * اگر Cart تغییر کرده،
                 * وارد Checkout نمی‌شویم.
                 */
                if (
                    cartWasChanged
                ) {
                    const messages: string[] =
                        [];

                    if (
                        unavailableCount >
                        0
                    ) {
                        messages.push(
                            `${unavailableCount.toLocaleString(
                                "fa-IR",
                            )} مورد به دلیل اتمام موجودی از سبد خرید حذف شد`,
                        );
                    }

                    if (
                        reducedCount > 0
                    ) {
                        messages.push(
                            `تعداد ${reducedCount.toLocaleString(
                                "fa-IR",
                            )} مورد با موجودی فعلی انبار اصلاح شد`,
                        );
                    }

                    const message =
                        `${messages.join(
                            " و ",
                        )}. لطفاً سبد خرید را دوباره بررسی کنید.`;

                    setValidationMessage(
                        message,
                    );

                    toast.warning(
                        "موجودی سبد خرید تغییر کرده است.",
                        {
                            description:
                                message,
                        },
                    );

                    return;
                }

                /*
                 * همه اقلام معتبرند.
                 */
                router.push(
                    "/checkout",
                );
            } catch {
                const message =
                    "امکان بررسی موجودی محصولات وجود ندارد. لطفاً اتصال خود را بررسی کرده و دوباره تلاش کنید.";

                setValidationMessage(
                    message,
                );

                toast.error(
                    "خطا در بررسی موجودی",
                    {
                        description:
                            message,
                    },
                );
            } finally {
                setIsValidating(
                    false,
                );
            }
        };

    /*
     * Hydration Guard
     */
    if (!isHydrated) {
        return (
            <main className="min-h-[70vh]">
                <div className="site-container">
                    <div className="flex min-h-[70vh] items-center justify-center">
                        <div className="text-center">
                            <Loader2
                                className="mx-auto size-5 animate-spin text-muted-foreground"
                                strokeWidth={
                                    1.5
                                }
                            />

                            <p className="mt-4 text-sm text-muted-foreground">
                                در حال بارگذاری
                                سبد خرید...
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    /*
     * Empty State
     */
    if (
        items.length === 0
    ) {
        return (
            <main className="min-h-[70vh]">
                <div className="site-container">
                    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
                        <div className="flex size-20 items-center justify-center rounded-full border border-border">
                            <ShoppingBag
                                className="size-8 text-muted-foreground"
                                strokeWidth={
                                    1.25
                                }
                            />
                        </div>

                        <h1 className="mt-7 text-2xl font-medium">
                            سبد خرید شما خالی است
                        </h1>

                        <p className="mt-3 max-w-md text-sm leading-7 text-muted-foreground">
                            هنوز محصولی به
                            سبد خرید اضافه
                            نکرده‌اید.
                        </p>

                        <Link
                            href="/shop"
                            className="luxury-transition mt-8 bg-foreground px-7 py-3.5 text-sm text-background hover:opacity-85"
                        >
                            مشاهده فروشگاه
                        </Link>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <>
            <main className="section-shell">
                <div className="site-container">
                    {/* Header */}
                    <div className="mb-10 flex flex-wrap items-end justify-between gap-5">
                        <div>
                            <p
                                dir="ltr"
                                className="section-eyebrow mb-3"
                            >
                                SHOPPING CART
                            </p>

                            <h1 className="section-title">
                                سبد خرید
                            </h1>

                            <p className="mt-3 text-sm text-muted-foreground">
                                {totalQuantity.toLocaleString(
                                    "fa-IR",
                                )}{" "}
                                کالا
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={
                                handleClearCart
                            }
                            className="luxury-transition text-sm text-muted-foreground hover:text-foreground"
                        >
                            حذف همه
                        </button>
                    </div>

                    <div className="grid gap-10 lg:grid-cols-[1fr_360px] xl:gap-16">
                        {/* Items */}
                        <section>
                            <div className="border-t border-border">
                                {items.map(
                                    (item) => (
                                        <article
                                            key={
                                                item.lineId
                                            }
                                            className="grid gap-5 border-b border-border py-6 sm:grid-cols-[140px_1fr]"
                                        >
                                            {/* Image */}
                                            <Link
                                                href={`/product/${item.productId}`}
                                                className="group relative aspect-[4/5] overflow-hidden bg-secondary sm:aspect-auto sm:h-[180px]"
                                            >
                                                {item.thumbnail ? (
                                                    <Image
                                                        src={
                                                            item.thumbnail
                                                        }
                                                        alt={
                                                            item.name
                                                        }
                                                        fill
                                                        sizes="(max-width: 640px) 100vw, 140px"
                                                        className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                                                    />
                                                ) : null}
                                            </Link>

                                            {/* Information */}
                                            <div className="flex min-w-0 flex-col">
                                                <div className="flex items-start justify-between gap-5">
                                                    <div className="min-w-0">
                                                        <Link
                                                            href={`/product/${item.productId}`}
                                                            dir="ltr"
                                                            className="font-heading text-2xl font-medium"
                                                        >
                                                            {
                                                                item.name
                                                            }
                                                        </Link>

                                                        <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                                                            <span
                                                                className="size-3 rounded-full border border-black/10"
                                                                style={{
                                                                    backgroundColor:
                                                                        item.colorHex,
                                                                }}
                                                            />

                                                            <span>
                                                                {
                                                                    item.colorName
                                                                }
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleRemove(
                                                                item.lineId,
                                                                item.name,
                                                            )
                                                        }
                                                        className="luxury-transition flex size-9 shrink-0 items-center justify-center text-muted-foreground hover:bg-secondary hover:text-foreground"
                                                        aria-label={`حذف ${item.name} از سبد خرید`}
                                                    >
                                                        <Trash2
                                                            className="size-4"
                                                            strokeWidth={
                                                                1.5
                                                            }
                                                        />
                                                    </button>
                                                </div>

                                                <div className="mt-5 flex flex-wrap items-center justify-between gap-5">
                                                    {/* Quantity */}
                                                    <div className="flex h-11 items-center border border-border">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleDecrease(
                                                                    item.lineId,
                                                                    item.quantity,
                                                                    item.name,
                                                                )
                                                            }
                                                            className="luxury-transition flex size-10 items-center justify-center hover:bg-secondary"
                                                            aria-label="کاهش تعداد"
                                                        >
                                                            <Minus
                                                                className="size-4"
                                                                strokeWidth={
                                                                    1.5
                                                                }
                                                            />
                                                        </button>

                                                        <span
                                                            className="min-w-12 text-center text-sm"
                                                            aria-live="polite"
                                                        >
                                                            {item.quantity.toLocaleString(
                                                                "fa-IR",
                                                            )}
                                                        </span>

                                                        <button
                                                            type="button"
                                                            disabled={
                                                                item.quantity >=
                                                                item.maxQuantity
                                                            }
                                                            onClick={() =>
                                                                handleIncrease(
                                                                    item.lineId,
                                                                    item.quantity,
                                                                    item.maxQuantity,
                                                                )
                                                            }
                                                            className="luxury-transition flex size-10 items-center justify-center hover:bg-secondary disabled:pointer-events-none disabled:opacity-25"
                                                            aria-label="افزایش تعداد"
                                                        >
                                                            <Plus
                                                                className="size-4"
                                                                strokeWidth={
                                                                    1.5
                                                                }
                                                            />
                                                        </button>
                                                    </div>

                                                    {/* Price */}
                                                    <div className="text-left">
                                                        <p className="text-sm font-medium">
                                                            {(
                                                                item.unitPrice *
                                                                item.quantity
                                                            ).toLocaleString(
                                                                "fa-IR",
                                                            )}{" "}
                                                            تومان
                                                        </p>

                                                        <p className="mt-1 text-xs text-muted-foreground">
                                                            قیمت واحد:{" "}
                                                            {item.unitPrice.toLocaleString(
                                                                "fa-IR",
                                                            )}{" "}
                                                            تومان
                                                        </p>
                                                    </div>
                                                </div>

                                                <p className="mt-4 text-xs text-muted-foreground">
                                                    حداکثر موجودی
                                                    قابل سفارش:{" "}
                                                    {item.maxQuantity.toLocaleString(
                                                        "fa-IR",
                                                    )}{" "}
                                                    عدد
                                                </p>
                                            </div>
                                        </article>
                                    ),
                                )}
                            </div>
                        </section>

                        {/* Summary */}
                        <aside className="h-fit border border-border p-6 lg:sticky lg:top-24">
                            <p
                                dir="ltr"
                                className="section-eyebrow"
                            >
                                ORDER SUMMARY
                            </p>

                            <h2 className="mt-3 text-xl font-medium">
                                خلاصه سفارش
                            </h2>

                            <div className="mt-7 space-y-4 border-y border-border py-5 text-sm">
                                <div className="flex items-center justify-between gap-4">
                                    <span className="text-muted-foreground">
                                        تعداد کالا
                                    </span>

                                    <span>
                                        {totalQuantity.toLocaleString(
                                            "fa-IR",
                                        )}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between gap-4">
                                    <span className="text-muted-foreground">
                                        جمع کالاها
                                    </span>

                                    <span>
                                        {totalPrice.toLocaleString(
                                            "fa-IR",
                                        )}{" "}
                                        تومان
                                    </span>
                                </div>

                                <div className="flex items-center justify-between gap-4">
                                    <span className="text-muted-foreground">
                                        هزینه ارسال
                                    </span>

                                    <span>
                                        در مرحله بعد
                                    </span>
                                </div>
                            </div>

                            {/* Final Price */}
                            <div className="mt-6 flex items-center justify-between gap-5">
                                <span className="font-medium">
                                    مبلغ نهایی
                                </span>

                                <span className="text-lg font-medium">
                                    {totalPrice.toLocaleString(
                                        "fa-IR",
                                    )}{" "}
                                    تومان
                                </span>
                            </div>

                            {/* Validation */}
                            {validationMessage ? (
                                <div
                                    role="alert"
                                    className="mt-6 border border-border bg-secondary/60 p-4 text-sm leading-7"
                                >
                                    {
                                        validationMessage
                                    }
                                </div>
                            ) : null}

                            {/* Checkout */}
                            <button
                                type="button"
                                disabled={
                                    isValidating
                                }
                                onClick={
                                    handleCheckout
                                }
                                className="
                  luxury-transition
                  mt-7
                  flex
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
                  disabled:cursor-wait
                  disabled:opacity-60
                "
                            >
                                {isValidating ? (
                                    <>
                                        <Loader2
                                            className="size-4 animate-spin"
                                            strokeWidth={
                                                1.5
                                            }
                                        />

                                        در حال بررسی
                                        موجودی...
                                    </>
                                ) : (
                                    "ادامه و ثبت سفارش"
                                )}
                            </button>

                            <Link
                                href="/shop"
                                className="luxury-transition mt-4 flex w-full items-center justify-center border border-border px-6 py-3.5 text-sm hover:bg-secondary"
                            >
                                ادامه خرید
                            </Link>
                        </aside>
                    </div>
                </div>
            </main>

            {/* Confirmation Modal */}
            <AlertDialog
                open={
                    pendingCartAction !==
                    null
                }
                onOpenChange={(
                    open,
                ) => {
                    if (!open) {
                        setPendingCartAction(
                            null,
                        );
                    }
                }}
            >
                <AlertDialogContent dir="rtl">
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {pendingCartAction?.type ===
                                "clear"
                                ? "حذف تمام اقلام سبد خرید"
                                : "حذف محصول از سبد خرید"}
                        </AlertDialogTitle>

                        <AlertDialogDescription>
                            {pendingCartAction?.type ===
                                "clear"
                                ? "آیا مطمئن هستید که می‌خواهید تمام اقلام سبد خرید را حذف کنید؟ این عملیات قابل بازگشت نیست."
                                : pendingCartAction?.type ===
                                    "remove"
                                    ? `آیا از حذف «${pendingCartAction.itemName}» از سبد خرید مطمئن هستید؟`
                                    : ""}
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter className="gap-2 sm:justify-start">
                        <AlertDialogAction
                            onClick={
                                handleConfirmCartAction
                            }
                        >
                            حذف
                        </AlertDialogAction>

                        <AlertDialogCancel>
                            انصراف
                        </AlertDialogCancel>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}