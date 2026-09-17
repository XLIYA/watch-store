"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
    ArrowRight,
    Loader2,
    ShoppingBag,
} from "lucide-react";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import {
    Controller,
    useForm,
} from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import { toast } from "sonner";

import { DeliveryDatePicker } from "@/components/checkout/delivery-date-picker";

import {
    checkoutSchema,
    type CheckoutFormValues,
} from "@/features/checkout/checkout.schema";

import {
    DEFAULT_CHECKOUT_VALUES,
    DELIVERY_TIME_SLOTS,
} from "@/features/checkout/checkout.constants";

import { useHydrated } from "@/hooks/use-hydrated";

import {
    useAppDispatch,
    useAppSelector,
} from "@/store/hooks";

import { DeliveryLocationPicker } from "@/components/checkout/delivery-location-picker";

import {
    removeItem,
    updateItemPrice,
    updateItemStock,
} from "@/features/cart/cart.slice";

import { createOrder } from "@/services/orders.service";

import { validateCheckoutStock } from "@/features/checkout/validate-checkout-stock";

export function CheckoutPageContent() {
    const router = useRouter();
    const dispatch = useAppDispatch();

    const isHydrated =
        useHydrated();

    const items = useAppSelector(
        (state) =>
            state.cart.items,
    );

    const {
        register,
        control,
        handleSubmit,
        setValue,
        watch,

        formState: {
            errors,
            isSubmitting,
        },
    } =
        useForm<CheckoutFormValues>({
            resolver:
                zodResolver(
                    checkoutSchema,
                ),

            defaultValues:
                DEFAULT_CHECKOUT_VALUES,

            mode: "onBlur",
        });

    const totalQuantity =
        items.reduce(
            (total, item) =>
                total +
                item.quantity,
            0,
        );

    const totalPrice =
        items.reduce(
            (total, item) =>
                total +
                item.unitPrice *
                item.quantity,
            0,
        );

    const onSubmit = async (
        data: CheckoutFormValues,
    ) => {
        if (items.length === 0) {
            toast.error(
                "سبد خرید شما خالی است.",
            );

            router.push("/cart");

            return;
        }

        /*
         * Zod با superRefine این دو مقدار را
         * کنترل می‌کند، ولی TypeScript هنوز
         * نوع آن‌ها را number | null می‌داند.
         */
        if (
            data.latitude === null ||
            data.longitude === null
        ) {
            toast.warning(
                "موقعیت تحویل مشخص نشده است.",
                {
                    description:
                        "لطفاً محل تحویل را روی نقشه انتخاب کنید.",
                },
            );

            return;
        }

        try {
            /*
             * آخرین بررسی موجودی درست
             * قبل از ایجاد Order.
             */
            const stockResult =
                await validateCheckoutStock(
                    items,
                );

            /*
             * maxQuantityهای قدیمی Cart
             * با موجودی فعلی Backend Sync شوند.
             */
            for (
                const syncItem of
                stockResult.syncItems
            ) {
                dispatch(
                    updateItemStock({
                        lineId:
                            syncItem.lineId,

                        maxQuantity:
                            syncItem.maxQuantity,
                    }),
                );
            }

            /*
             * محصول یا Variant کاملاً
             * ناموجود از Cart حذف می‌شود.
             */
            for (
                const unavailableItem of
                stockResult.unavailableItems
            ) {
                dispatch(
                    removeItem(
                        unavailableItem.lineId,
                    ),
                );
            }

            /*
            * هدف:
            * همگام‌سازی قیمت Cart با آخرین قیمت معتبر Backend.
            *
            * محل استفاده:
            * داخل Checkout بعد از validateCheckoutStock و قبل از تصمیم نهایی برای ساخت Order.
            *
            * نحوه کار:
            * اگر قیمت محصول از زمان Add To Cart تغییر کرده باشد،
            * قیمت جدید Backend داخل Redux قرار می‌گیرد تا خلاصه سفارش و مبلغ نهایی به‌روز شوند.
            * همان Submit ادامه پیدا نمی‌کند و کاربر باید قیمت جدید را بررسی و دوباره ثبت سفارش کند.
            */
            for (const priceChangedItem of stockResult.priceChangedItems) {
                dispatch(
                    updateItemPrice({
                        lineId: priceChangedItem.lineId,
                        unitPrice: priceChangedItem.currentPrice,
                    }),
                );
            }


            /*
 * هدف:
 * جلوگیری از ساخت Order در صورت تغییر قیمت یا موجودی.
 *
 * محل استفاده:
 * داخل Checkout بعد از Sync شدن Cart با آخرین اطلاعات Backend.
 *
 * نحوه کار:
 * اگر Validation نامعتبر باشد، بر اساس نوع مشکل پیام مناسب نمایش داده می‌شود
 * و فرآیند ساخت Order در همان Submit متوقف می‌شود.
 */
            if (!stockResult.isValid) {
                let title = "موجودی سفارش تغییر کرده است.";

                let description =
                    "موجودی یک یا چند محصول تغییر کرده است. لطفاً سبد خرید را بررسی کنید.";

                /*
                 * هدف:
                 * نمایش پیام اختصاصی در صورت تغییر قیمت.
                 *
                 * محل استفاده:
                 * اولین اولویت پیام Validation ناموفق Checkout.
                 *
                 * نحوه کار:
                 * اگر حداقل یک قیمت تغییر کرده باشد، پیام تغییر قیمت نمایش داده می‌شود.
                 */
                if (stockResult.priceChangedItems.length > 0) {
                    title = "قیمت سفارش تغییر کرده است.";

                    description =
                        "قیمت یک یا چند محصول تغییر کرده است. مبلغ جدید اعمال شد؛ لطفاً سفارش را بررسی و دوباره ثبت کنید.";
                } else if (stockResult.unavailableItems.length > 0) {
                    description =
                        "یک یا چند محصول دیگر موجود نیست و از سبد خرید حذف شده است.";
                } else if (stockResult.reducedItems.length > 0) {
                    description =
                        "موجودی یک یا چند محصول کمتر شده و تعداد قابل سفارش تغییر کرده است.";
                } else if (stockResult.productStockIssues.length > 0) {
                    description =
                        "مجموع تعداد انتخاب‌شده از موجودی کل یکی از محصولات بیشتر است.";
                }

                toast.warning(title, {
                    description,

                    action: {
                        label: "بررسی سبد",
                        onClick: () => router.push("/cart"),
                    },
                });

                return;
            }

            /*
            * Snapshot اقلام سفارش.
            *
            * مشخصات محصول، Variant و قیمت
            * از داده معتبر Backend گرفته می‌شوند
            * تا به اطلاعات قابل تغییر localStorage
            * اعتماد نکنیم.
            */

            const orderItems = items.map(
                (item) => {
                    const product =
                        stockResult.products.get(
                            item.productId,
                        );

                    if (!product) {
                        throw new Error(
                            `Product ${item.productId} not found during checkout.`,
                        );
                    }

                    const variant =
                        product.variants.find(
                            (currentVariant) =>
                                currentVariant.id ===
                                item.variantId,
                        );

                    if (!variant) {
                        throw new Error(
                            `Variant ${item.variantId} not found during checkout.`,
                        );
                    }

                    /*
                     * اطلاعات Order از Backend معتبر
                     * گرفته می‌شود، نه localStorage.
                     */
                    const unitPrice =
                        product.price;

                    return {
                        lineId:
                            item.lineId,

                        productId:
                            product.id,

                        variantId:
                            variant.id,

                        name:
                            product.name,

                        thumbnail:
                            product.thumbnail ||
                            product.images?.[0] ||
                            "",

                        colorName:
                            variant.name,

                        colorHex:
                            variant.hex,

                        unitPrice,

                        quantity:
                            item.quantity,

                        totalPrice:
                            unitPrice *
                            item.quantity,
                    };
                },
            );

            const itemsCount =
                orderItems.reduce(
                    (total, item) =>
                        total +
                        item.quantity,
                    0,
                );

            const subtotal =
                orderItems.reduce(
                    (total, item) =>
                        total +
                        item.totalPrice,
                    0,
                );

            /*
             * فعلاً ارسال رایگان است.
             * بعداً اگر Shipping Rules
             * اضافه شد این مقدار تغییر می‌کند.
             */
            const shippingCost = 0;

            const totalPrice =
                subtotal +
                shippingCost;

            /*
             * ایجاد سفارش قبل از پرداخت.
             *
             * در این مرحله هنوز موجودی
             * Backend کم نمی‌شود.
             */
            const order =
                await createOrder({
                    customer: {
                        fullName:
                            data.fullName,

                        mobile:
                            data.mobile,
                    },

                    delivery: {
                        postalCode:
                            data.postalCode,

                        address:
                            data.address,

                        plaque:
                            data.plaque,

                        unit:
                            data.unit ||
                            undefined,

                        latitude:
                            data.latitude,

                        longitude:
                            data.longitude,

                        deliveryDate:
                            data.deliveryDate,

                        deliveryTime:
                            data.deliveryTime,

                        note:
                            data.note ||
                            undefined,
                    },

                    items:
                        orderItems,

                    itemsCount,

                    subtotal,

                    shippingCost,

                    totalPrice,

                    /*
 * هدف:
 * ایجاد سفارش جدید در وضعیت اولیه چرخه سفارش.
 *
 * محل استفاده:
 * هنگام ثبت نهایی سفارش در Checkout.
 *
 * نحوه کار:
 * وضعیت سفارش مستقل از وضعیت پرداخت نگهداری می‌شود.
 * سفارش جدید pending است و پرداخت آن نیز در ابتدا pending خواهد بود.
 */
                    status: "pending",

                    paymentStatus: "pending",

                    createdAt:
                        Date.now(),

                    paidAt:
                        null,
                });

            toast.success(
                "سفارش با موفقیت ثبت شد.",
                {
                    description:
                        "در حال انتقال به مرحله پرداخت...",
                },
            );

            /*
             * Cart هنوز پاک نمی‌شود.
             * پاک‌شدن فقط بعد از پرداخت موفق.
             */
            router.push(
                `/payment?orderId=${encodeURIComponent(
                    String(order.id),
                )}`,
            );
        } catch {
            toast.error(
                "ثبت سفارش انجام نشد.",
                {
                    description:
                        "ارتباط با سرور با خطا مواجه شد. لطفاً دوباره تلاش کنید.",
                },
            );
        }
    };

    const latitude =
        watch("latitude");

    const longitude =
        watch("longitude");

    /*
     * Hydration Guard
     *
     * Cart از localStorage Hydrate می‌شود.
     * بنابراین تا Hydration کامل نشده،
     * Checkout واقعی Render نمی‌شود.
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
                                در حال آماده‌سازی
                                سفارش...
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    /*
     * Checkout بدون Cart
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
                            برای ادامه ثبت سفارش،
                            ابتدا محصولی به سبد خرید
                            اضافه کنید.
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
        <main className="section-shell">
            <div className="site-container">
                {/* Page Header */}
                <div className="mb-10">
                    <button
                        type="button"
                        onClick={() =>
                            router.push(
                                "/cart",
                            )
                        }
                        className="luxury-transition mb-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                    >
                        <ArrowRight
                            className="size-4"
                            strokeWidth={
                                1.5
                            }
                        />

                        بازگشت به سبد خرید
                    </button>

                    <p
                        dir="ltr"
                        className="section-eyebrow mb-3"
                    >
                        CHECKOUT
                    </p>

                    <h1 className="section-title">
                        تکمیل سفارش
                    </h1>

                    <p className="mt-3 max-w-xl text-sm leading-7 text-muted-foreground">
                        اطلاعات دریافت‌کننده،
                        محل تحویل و زمان موردنظر
                        برای دریافت سفارش را
                        تکمیل کنید.
                    </p>
                </div>

                <form
                    onSubmit={
                        handleSubmit(
                            onSubmit,
                        )
                    }
                    noValidate
                >
                    <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_380px] xl:gap-20">
                        {/* Form Content */}
                        <div className="space-y-12">
                            {/* Customer Information */}
                            <section>
                                <div className="mb-7 border-b border-border pb-5">
                                    <p
                                        dir="ltr"
                                        className="section-eyebrow"
                                    >
                                        CUSTOMER
                                    </p>

                                    <h2 className="mt-2 text-xl font-medium">
                                        اطلاعات دریافت‌کننده
                                    </h2>
                                </div>

                                <div className="grid gap-6 sm:grid-cols-2">
                                    {/* Full Name */}
                                    <div className="sm:col-span-2">
                                        <label
                                            htmlFor="fullName"
                                            className="mb-2 block text-sm font-medium"
                                        >
                                            نام و نام خانوادگی
                                        </label>

                                        <input
                                            id="fullName"
                                            type="text"
                                            autoComplete="name"
                                            placeholder="مثلاً محمد رضایی"
                                            {...register(
                                                "fullName",
                                            )}
                                            className="
                        luxury-transition
                        h-12
                        w-full
                        border
                        border-border
                        bg-background
                        px-4
                        text-sm
                        outline-none
                        placeholder:text-muted-foreground/60
                        focus:border-foreground
                      "
                                        />

                                        {errors.fullName ? (
                                            <p className="mt-2 text-xs text-destructive">
                                                {
                                                    errors
                                                        .fullName
                                                        .message
                                                }
                                            </p>
                                        ) : null}
                                    </div>

                                    {/* Mobile */}
                                    <div>
                                        <label
                                            htmlFor="mobile"
                                            className="mb-2 block text-sm font-medium"
                                        >
                                            شماره موبایل
                                        </label>

                                        <input
                                            id="mobile"
                                            type="tel"
                                            inputMode="numeric"
                                            autoComplete="tel"
                                            dir="ltr"
                                            placeholder="09123456789"
                                            maxLength={
                                                11
                                            }
                                            {...register(
                                                "mobile",
                                            )}
                                            className="
                        luxury-transition
                        h-12
                        w-full
                        border
                        border-border
                        bg-background
                        px-4
                        text-left
                        text-sm
                        outline-none
                        placeholder:text-muted-foreground/60
                        focus:border-foreground
                      "
                                        />

                                        {errors.mobile ? (
                                            <p className="mt-2 text-xs text-destructive">
                                                {
                                                    errors
                                                        .mobile
                                                        .message
                                                }
                                            </p>
                                        ) : null}
                                    </div>

                                    {/* Postal Code */}
                                    <div>
                                        <label
                                            htmlFor="postalCode"
                                            className="mb-2 block text-sm font-medium"
                                        >
                                            کد پستی
                                        </label>

                                        <input
                                            id="postalCode"
                                            type="text"
                                            inputMode="numeric"
                                            dir="ltr"
                                            maxLength={
                                                10
                                            }
                                            placeholder="1234567890"
                                            {...register(
                                                "postalCode",
                                            )}
                                            className="
                        luxury-transition
                        h-12
                        w-full
                        border
                        border-border
                        bg-background
                        px-4
                        text-left
                        text-sm
                        outline-none
                        placeholder:text-muted-foreground/60
                        focus:border-foreground
                      "
                                        />

                                        {errors.postalCode ? (
                                            <p className="mt-2 text-xs text-destructive">
                                                {
                                                    errors
                                                        .postalCode
                                                        .message
                                                }
                                            </p>
                                        ) : null}
                                    </div>
                                </div>
                            </section>

                            {/* Delivery Address */}
                            <section>
                                <div className="mb-7 border-b border-border pb-5">
                                    <p
                                        dir="ltr"
                                        className="section-eyebrow"
                                    >
                                        DELIVERY ADDRESS
                                    </p>

                                    <h2 className="mt-2 text-xl font-medium">
                                        آدرس تحویل
                                    </h2>
                                </div>

                                <div className="space-y-6">
                                    {/* Address */}
                                    <div>
                                        <label
                                            htmlFor="address"
                                            className="mb-2 block text-sm font-medium"
                                        >
                                            آدرس کامل
                                        </label>

                                        <textarea
                                            id="address"
                                            rows={4}
                                            autoComplete="street-address"
                                            placeholder="استان، شهر، خیابان، کوچه و سایر جزئیات آدرس"
                                            {...register(
                                                "address",
                                            )}
                                            className="
                        luxury-transition
                        w-full
                        resize-none
                        border
                        border-border
                        bg-background
                        px-4
                        py-3
                        text-sm
                        leading-7
                        outline-none
                        placeholder:text-muted-foreground/60
                        focus:border-foreground
                      "
                                        />

                                        {errors.address ? (
                                            <p className="mt-2 text-xs text-destructive">
                                                {
                                                    errors
                                                        .address
                                                        .message
                                                }
                                            </p>
                                        ) : null}
                                    </div>

                                    {/*
                   * Map Placeholder
                   *
                   * در مرحله بعد با
                   * نقشه واقعی جایگزین می‌شود
                   * و latitude / longitude
                   * داخل React Hook Form
                   * ذخیره خواهند شد.
                   */}
                                    <DeliveryLocationPicker
                                        latitude={latitude}
                                        longitude={longitude}
                                        error={
                                            errors.latitude?.message
                                        }
                                        onChange={(
                                            location,
                                        ) => {
                                            setValue(
                                                "latitude",
                                                location.latitude,
                                                {
                                                    shouldValidate: true,
                                                    shouldDirty: true,
                                                },
                                            );

                                            setValue(
                                                "longitude",
                                                location.longitude,
                                                {
                                                    shouldValidate: true,
                                                    shouldDirty: true,
                                                },
                                            );
                                        }}
                                    />

                                    {/* Plaque / Unit */}
                                    <div className="grid gap-6 sm:grid-cols-2">
                                        {/* Plaque */}
                                        <div>
                                            <label
                                                htmlFor="plaque"
                                                className="mb-2 block text-sm font-medium"
                                            >
                                                پلاک
                                            </label>

                                            <input
                                                id="plaque"
                                                type="text"
                                                inputMode="numeric"
                                                placeholder="مثلاً ۱۲"
                                                {...register(
                                                    "plaque",
                                                )}
                                                className="
                          luxury-transition
                          h-12
                          w-full
                          border
                          border-border
                          bg-background
                          px-4
                          text-sm
                          outline-none
                          placeholder:text-muted-foreground/60
                          focus:border-foreground
                        "
                                            />

                                            {errors.plaque ? (
                                                <p className="mt-2 text-xs text-destructive">
                                                    {
                                                        errors
                                                            .plaque
                                                            .message
                                                    }
                                                </p>
                                            ) : null}
                                        </div>

                                        {/* Unit */}
                                        <div>
                                            <label
                                                htmlFor="unit"
                                                className="mb-2 block text-sm font-medium"
                                            >
                                                واحد

                                                <span className="mr-2 text-xs font-normal text-muted-foreground">
                                                    اختیاری
                                                </span>
                                            </label>

                                            <input
                                                id="unit"
                                                type="text"
                                                inputMode="numeric"
                                                placeholder="مثلاً ۳"
                                                {...register(
                                                    "unit",
                                                )}
                                                className="
                          luxury-transition
                          h-12
                          w-full
                          border
                          border-border
                          bg-background
                          px-4
                          text-sm
                          outline-none
                          placeholder:text-muted-foreground/60
                          focus:border-foreground
                        "
                                            />

                                            {errors.unit ? (
                                                <p className="mt-2 text-xs text-destructive">
                                                    {
                                                        errors
                                                            .unit
                                                            .message
                                                    }
                                                </p>
                                            ) : null}
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Delivery Time */}
                            <section>
                                <div className="mb-7 border-b border-border pb-5">
                                    <p
                                        dir="ltr"
                                        className="section-eyebrow"
                                    >
                                        DELIVERY TIME
                                    </p>

                                    <h2 className="mt-2 text-xl font-medium">
                                        زمان تحویل
                                    </h2>
                                </div>

                                <div className="grid gap-6 sm:grid-cols-2">
                                    {/* Persian Date Picker */}
                                    <Controller
                                        name="deliveryDate"
                                        control={control}
                                        render={({
                                            field,
                                        }) => (
                                            <DeliveryDatePicker
                                                value={
                                                    field.value
                                                }
                                                onChange={
                                                    field.onChange
                                                }
                                                error={
                                                    errors
                                                        .deliveryDate
                                                        ?.message
                                                }
                                            />
                                        )}
                                    />

                                    {/* Delivery Time */}
                                    <div>
                                        <label
                                            htmlFor="deliveryTime"
                                            className="mb-2 block text-sm font-medium"
                                        >
                                            ساعت تحویل
                                        </label>

                                        <Controller
                                            name="deliveryTime"
                                            control={control}
                                            render={({ field }) => (
                                                <Select
                                                    value={field.value}
                                                    onValueChange={field.onChange}
                                                >
                                                    <SelectTrigger
                                                        id="deliveryTime"
                                                        dir="rtl"
                                                        className={`
                                                        w-full
                                                        rounded-none
                                                        border-border
                                                        bg-background
                                                        px-4
                                                        data-[size=default]:h-12
                                                        ${errors.deliveryTime
                                                                ? "border-destructive"
                                                                : ""
                                                            }
                                                        `}
                                                    >
                                                        <SelectValue placeholder="انتخاب ساعت" />
                                                    </SelectTrigger>

                                                    <SelectContent
                                                        dir="rtl"
                                                        position="popper"
                                                    >
                                                        {DELIVERY_TIME_SLOTS.map(
                                                            (time) => (
                                                                <SelectItem
                                                                    key={time}
                                                                    value={time}
                                                                >
                                                                    <span dir="ltr">
                                                                        {time}
                                                                    </span>
                                                                </SelectItem>
                                                            ),
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />

                                        <p className="mt-2 text-xs leading-6 text-muted-foreground">
                                            بازه تحویل از ساعت ۱۱ تا ۱۸
                                        </p>

                                        {errors.deliveryTime ? (
                                            <p className="mt-2 text-xs text-destructive">
                                                {errors.deliveryTime.message}
                                            </p>
                                        ) : null}
                                    </div>
                                </div>
                            </section>

                            {/* Order Note */}
                            <section>
                                <div className="mb-7 border-b border-border pb-5">
                                    <p
                                        dir="ltr"
                                        className="section-eyebrow"
                                    >
                                        NOTE
                                    </p>

                                    <h2 className="mt-2 text-xl font-medium">
                                        توضیحات سفارش
                                    </h2>
                                </div>

                                <label
                                    htmlFor="note"
                                    className="sr-only"
                                >
                                    توضیحات سفارش
                                </label>

                                <textarea
                                    id="note"
                                    rows={4}
                                    placeholder="اگر توضیح خاصی درباره تحویل سفارش دارید، اینجا بنویسید."
                                    {...register(
                                        "note",
                                    )}
                                    className="
                    luxury-transition
                    w-full
                    resize-none
                    border
                    border-border
                    bg-background
                    px-4
                    py-3
                    text-sm
                    leading-7
                    outline-none
                    placeholder:text-muted-foreground/60
                    focus:border-foreground
                  "
                                />

                                {errors.note ? (
                                    <p className="mt-2 text-xs text-destructive">
                                        {
                                            errors
                                                .note
                                                .message
                                        }
                                    </p>
                                ) : null}
                            </section>
                        </div>

                        {/* Order Summary */}
                        <aside className="h-fit border border-border p-6 lg:sticky lg:top-24">
                            <p
                                dir="ltr"
                                className="section-eyebrow"
                            >
                                YOUR ORDER
                            </p>

                            <h2 className="mt-3 text-xl font-medium">
                                خلاصه سفارش
                            </h2>

                            {/* Products */}
                            <div className="mt-7 divide-y divide-border border-y border-border">
                                {items.map(
                                    (item) => (
                                        <div
                                            key={
                                                item.lineId
                                            }
                                            className="flex gap-4 py-5"
                                        >
                                            {/* Thumbnail */}
                                            <Link
                                                href={`/product/${item.productId}`}
                                                className="relative size-20 shrink-0 overflow-hidden bg-secondary"
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
                                                        sizes="80px"
                                                        className="object-cover"
                                                    />
                                                ) : null}
                                            </Link>

                                            {/* Product Information */}
                                            <div className="min-w-0 flex-1">
                                                <Link
                                                    href={`/product/${item.productId}`}
                                                    dir="ltr"
                                                    className="block truncate font-heading text-lg font-medium"
                                                >
                                                    {
                                                        item.name
                                                    }
                                                </Link>

                                                <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                                                    <span
                                                        className="size-2.5 rounded-full border border-black/10"
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

                                                    <span>
                                                        ×
                                                    </span>

                                                    <span>
                                                        {item.quantity.toLocaleString(
                                                            "fa-IR",
                                                        )}
                                                    </span>
                                                </div>

                                                <p className="mt-3 text-xs font-medium">
                                                    {(
                                                        item.unitPrice *
                                                        item.quantity
                                                    ).toLocaleString(
                                                        "fa-IR",
                                                    )}{" "}
                                                    تومان
                                                </p>
                                            </div>
                                        </div>
                                    ),
                                )}
                            </div>

                            {/* Totals */}
                            <div className="space-y-4 py-6 text-sm">
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
                                        رایگان
                                    </span>
                                </div>
                            </div>

                            {/* Final Total */}
                            <div className="flex items-center justify-between gap-5 border-t border-border pt-6">
                                <span className="font-medium">
                                    مبلغ قابل پرداخت
                                </span>

                                <span className="text-lg font-medium">
                                    {totalPrice.toLocaleString(
                                        "fa-IR",
                                    )}{" "}
                                    تومان
                                </span>
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={
                                    isSubmitting
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
                                {isSubmitting ? (
                                    <>
                                        <Loader2
                                            className="size-4 animate-spin"
                                            strokeWidth={
                                                1.5
                                            }
                                        />

                                        در حال بررسی...
                                    </>
                                ) : (
                                    "ادامه و ثبت سفارش"
                                )}
                            </button>

                            <p className="mt-4 text-center text-xs leading-6 text-muted-foreground">
                                با ادامه فرایند،
                                موجودی محصولات و
                                اطلاعات سفارش پیش
                                از پرداخت مجدداً
                                بررسی خواهد شد.
                            </p>
                        </aside>
                    </div>
                </form>
            </div>
        </main>
    );
}