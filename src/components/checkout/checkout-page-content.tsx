"use client";
import { useEffect } from "react";
import { useDeliveryAvailability } from "@/features/checkout/use-delivery-availability";
import { checkoutRequestId } from "@/features/checkout/checkout-request";
import { getApiErrorMessage } from "@/services/api/api-error";

import { formatNumber } from "@/lib/format";
import { PersianDigitInput } from "@/components/ui/persian-digit-input";

import { selectCartTotals } from "@/features/cart/cart.selectors";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { ArrowRight, Loader2, ShoppingBag } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Controller, useForm, useWatch } from "react-hook-form";

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
  SHIPPING_COST,
} from "@/features/checkout/checkout.constants";

import { useHydrated } from "@/hooks/use-hydrated";

import { useAppDispatch, useAppSelector } from "@/store/hooks";

import { DeliveryLocationPicker } from "@/components/checkout/delivery-location-picker";

import {
  syncCartStock,
  getStockChangeMessage,
} from "@/features/checkout/sync-cart-stock";

import { useCreateOrderMutation } from "@/features/checkout/mutations";
import { useAddressSuggestion } from "@/features/checkout/use-address-suggestion";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

import { validateCheckoutStock } from "@/features/checkout/validate-checkout-stock";

export function CheckoutPageContent() {
  const router = useRouter();
  const createOrder = useCreateOrderMutation();
  const dispatch = useAppDispatch();

  const isHydrated = useHydrated();

  const items = useAppSelector((state) => state.cart.items);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    setError,

    formState: { errors, isSubmitting },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),

    defaultValues: DEFAULT_CHECKOUT_VALUES,

    mode: "onBlur",
  });

  const addressSuggestion = useAddressSuggestion(address => setValue("address", address, {shouldDirty: true, shouldValidate: true}));
  const availability = useDeliveryAvailability();
  const selectedDay = useWatch({ control, name: "deliveryDate" });
  const selectedTime = useWatch({ control, name: "deliveryTime" });
  const unavailableTimes = availability.data?.unavailable[selectedDay] || [];
  useEffect(() => {
    if (selectedTime && availability.data?.unavailable[selectedDay]?.includes(selectedTime)) {
      setValue("deliveryTime", "", { shouldValidate: true });
      setError("deliveryTime", { message: "این ساعت رزرو شده؛ ساعت دیگری انتخاب کنید." });
    }
  }, [availability.data, selectedDay, selectedTime, setValue, setError]);
  const { totalQuantity, totalPrice } = useAppSelector(selectCartTotals);

  const onSubmit = async (data: CheckoutFormValues) => {
    if (items.length === 0) {
      toast.error("سبد خرید شما خالی است.");

      router.push("/cart");

      return;
    }

    /*
     * Zod با superRefine این دو مقدار را
     * کنترل می‌کند، ولی TypeScript هنوز
     * نوع آن‌ها را number | null می‌داند.
     */
    if (data.latitude === null || data.longitude === null) {
      toast.warning("موقعیت تحویل مشخص نشده است.", {
        description: "لطفاً محل تحویل را روی نقشه انتخاب کنید.",
      });

      return;
    }

    try {
      const capacity = await availability.refetch();
      if (capacity.isError || !capacity.data) { toast.error("دریافت ظرفیت تحویل ممکن نشد؛ دوباره تلاش کنید."); return; }
      if (capacity.data.unavailable[data.deliveryDate]?.includes(data.deliveryTime)) {
        setError("deliveryTime", { message: "این ساعت رزرو شده؛ ساعت دیگری انتخاب کنید." });
        return;
      }
      /*
       * آخرین بررسی موجودی درست
       * قبل از ایجاد Order.
       */
      const stockResult = await validateCheckoutStock(items);

      // همان نتیجه و تغییرات سبد در هر دو صفحه اعمال می‌شود.
      syncCartStock(stockResult, dispatch);
      if (!stockResult.isValid) {
        toast.warning(getStockChangeMessage(stockResult), {
          action: { label: "بررسی سبد", onClick: () => router.push("/cart") },
        });
        return;
      }

      // مرورگر تنها انتخاب مشتری را می‌فرستد؛ ساخت snapshot و مبلغ سفارش مسئولیت سرور است.
      const { fullName, mobile, ...delivery } = data;
      const payload = {
        customer: { fullName, mobile },
        delivery: { ...delivery, latitude: data.latitude, longitude: data.longitude },
        items: items.map(item => ({ productId: item.productId, variantId: item.variantId, quantity: item.quantity, unitPrice: item.unitPrice })),
      };
      const order = await createOrder.mutateAsync({ ...payload, requestId: await checkoutRequestId(payload) });

      toast.success("سفارش با موفقیت ثبت شد.", {
        description: "در حال انتقال به مرحله پرداخت...",
      });

      /*
       * Cart هنوز پاک نمی‌شود.
       * پاک‌شدن فقط بعد از پرداخت موفق.
       */
      window.location.assign(order.paymentUrl);
    } catch (error) {
      void availability.refetch();
      toast.error(getApiErrorMessage(error));
    }
  };

  const latitude = useWatch({ control, name: "latitude" });

  const longitude = useWatch({ control, name: "longitude" });

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
                strokeWidth={1.5}
              />

              <p className="mt-4 text-sm text-muted-foreground">
                در حال آماده‌سازی سفارش...
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
  if (items.length === 0) {
    return (
      <main className="min-h-[70vh]">
        <div className="site-container">
          <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
            <div className="flex size-20 items-center justify-center rounded-full border border-border">
              <ShoppingBag
                className="size-8 text-muted-foreground"
                strokeWidth={1.25}
              />
            </div>

            <h1 className="mt-7 text-2xl font-medium">سبد خرید شما خالی است</h1>

            <p className="mt-3 max-w-md text-sm leading-7 text-muted-foreground">
              برای ادامه ثبت سفارش، ابتدا محصولی به سبد خرید اضافه کنید.
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
            onClick={() => router.push("/cart")}
            className="luxury-transition mb-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowRight className="size-4" strokeWidth={1.5} />
            بازگشت به سبد خرید
          </button>

          <p dir="ltr" className="section-eyebrow mb-3">تکمیل خرید</p>

          <h1 className="section-title">تکمیل سفارش</h1>

          <p className="mt-3 max-w-xl text-sm leading-7 text-muted-foreground">
            اطلاعات دریافت‌کننده، محل تحویل و زمان موردنظر برای دریافت سفارش را
            تکمیل کنید.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_380px] xl:gap-20">
            {/* Form Content */}
            <div className="space-y-12">
              {/* Customer Information */}
              <section>
                <div className="mb-7 border-b border-border pb-5">
                  <p dir="rtl" className="section-eyebrow">اطلاعات خریدار</p>

                  <h2 className="mt-2 text-xl font-medium">
                    اطلاعات دریافت‌کننده
                  </h2>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  {/* Full Name */}
                  <div className="sm:col-span-2">
                    <Label
                      htmlFor="fullName"
                      className="mb-2 block text-sm font-medium"
                    >
                      نام و نام خانوادگی
                    </Label>

                    <Input
                      id="fullName"
                      type="text"
                      autoComplete="name"
                      placeholder="مثلاً محمد رضایی"
                      {...register("fullName")}
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
                        {errors.fullName.message}
                      </p>
                    ) : null}
                  </div>

                  {/* Mobile */}
                  <div>
                    <Label
                      htmlFor="mobile"
                      className="mb-2 block text-sm font-medium"
                    >
                      شماره موبایل
                    </Label>

                    <PersianDigitInput
                      id="mobile"
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel"
                      dir="ltr"
                      placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                      maxLength={11}
                      {...register("mobile")}
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
                        {errors.mobile.message}
                      </p>
                    ) : null}
                  </div>

                  {/* Postal Code */}
                  <div>
                    <Label
                      htmlFor="postalCode"
                      className="mb-2 block text-sm font-medium"
                    >
                      کد پستی
                    </Label>

                    <PersianDigitInput
                      id="postalCode"
                      type="text"
                      inputMode="numeric"
                      dir="ltr"
                      maxLength={10}
                      placeholder="۱۲۳۴۵۶۷۸۹۰"
                      {...register("postalCode")}
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
                        {errors.postalCode.message}
                      </p>
                    ) : null}
                  </div>
                </div>
              </section>

              {/* Delivery Address */}
              <section>
                <div className="mb-7 border-b border-border pb-5">
                  <p dir="rtl" className="section-eyebrow">نشانی تحویل</p>

                  <h2 className="mt-2 text-xl font-medium">آدرس تحویل</h2>
                </div>

                <div className="space-y-6">
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
                    error={errors.latitude?.message}
                    onChange={(location) => {
                      void addressSuggestion.suggest(location.latitude, location.longitude);
                      setValue("latitude", location.latitude, {
                        shouldValidate: true,
                        shouldDirty: true,
                      });

                      setValue("longitude", location.longitude, {
                        shouldValidate: true,
                        shouldDirty: true,
                      });
                    }}
                  />

                  {/* Address */}
                  <div>
                    <Label
                      htmlFor="address"
                      className="mb-2 block text-sm font-medium"
                    >
                      آدرس کامل
                    </Label>

                    <Textarea
                      id="address"
                      rows={4}
                      autoComplete="street-address"
                      placeholder="استان، شهر، خیابان، کوچه و سایر جزئیات آدرس"
                      {...register("address", {onChange: addressSuggestion.cancel})}
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
                        {errors.address.message}
                      </p>
                    ) : null}
                  </div>

<p role="status" className="text-xs text-muted-foreground">{addressSuggestion.loading ? "در حال دریافت آدرس…" : addressSuggestion.message}</p>
                  {/* Plaque / Unit */}
                  <div className="grid gap-6 sm:grid-cols-2">
                    {/* Plaque */}
                    <div>
                      <Label
                        htmlFor="plaque"
                        className="mb-2 block text-sm font-medium"
                      >
                        پلاک
                      </Label>

                      <Input
                        id="plaque"
                        type="text"
                        inputMode="numeric"
                        placeholder="مثلاً ۱۲"
                        {...register("plaque")}
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
                          {errors.plaque.message}
                        </p>
                      ) : null}
                    </div>

                    {/* Unit */}
                    <div>
                      <Label
                        htmlFor="unit"
                        className="mb-2 block text-sm font-medium"
                      >
                        واحد
                        <span className="mr-2 text-xs font-normal text-muted-foreground">
                          اختیاری
                        </span>
                      </Label>

                      <Input
                        id="unit"
                        type="text"
                        inputMode="numeric"
                        placeholder="مثلاً ۳"
                        {...register("unit")}
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
                          {errors.unit.message}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>
              </section>

              {/* Delivery Time */}
              <section>
                <div className="mb-7 border-b border-border pb-5">
                  <p dir="rtl" className="section-eyebrow">زمان تحویل</p>

                  <h2 className="mt-2 text-xl font-medium">زمان تحویل</h2>
                  {availability.isFetching && <p role="status" className="mt-3 flex items-center gap-2 text-sm"><Loader2 className="size-4 animate-spin" />در حال بررسی ظرفیت تحویل…</p>}
                  {availability.isError && <div role="alert" className="mt-3 text-sm text-destructive">ظرفیت تحویل دریافت نشد. <Button type="button" variant="link" onClick={() => availability.refetch()}>تلاش دوباره</Button></div>}
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  {/* Persian Date Picker */}
                  <Controller
                    name="deliveryDate"
                    control={control}
                    render={({ field }) => (
                      <DeliveryDatePicker
                        value={field.value}
                        onChange={value => { field.onChange(value); setValue("deliveryTime", ""); }}
                        fullyBookedDates={availability.data?.fullyBookedDates}
                        disabled={availability.isPending || availability.isError}
                        error={errors.deliveryDate?.message}
                      />
                    )}
                  />

                  {/* Delivery Time */}
                  <div>
                    <Label
                      htmlFor="deliveryTime"
                      className="mb-2 block text-sm font-medium"
                    >
                      ساعت تحویل
                    </Label>

                    <Controller
                      name="deliveryTime"
                      control={control}
                      render={({ field }) => (
                        <Select
                          value={field.value}
                          disabled={!selectedDay || availability.isPending || availability.isError}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger
                            id="deliveryTime"
                            dir="rtl"
                            className={`
                                                        w-full
                                                        rounded-md
                                                        border-border
                                                        bg-background
                                                        px-4
                                                        data-[size=default]:h-12
                                                        ${
                                                          errors.deliveryTime
                                                            ? "border-destructive"
                                                            : ""
                                                        }
                                                        `}
                          >
                            <SelectValue placeholder="انتخاب ساعت" />
                          </SelectTrigger>

                          <SelectContent dir="rtl" position="popper">
                            {DELIVERY_TIME_SLOTS.map((time) => (
                              <SelectItem key={time} value={time} disabled={unavailableTimes.includes(time)}>
                                <span dir="ltr">{time}</span>{unavailableTimes.includes(time) ? " — رزرو شده" : ""}
                              </SelectItem>
                            ))}
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
                  <p dir="rtl" className="section-eyebrow">یادداشت سفارش</p>

                  <h2 className="mt-2 text-xl font-medium">توضیحات سفارش</h2>
                </div>

                <Label htmlFor="note" className="sr-only">
                  توضیحات سفارش
                </Label>

                <Textarea
                  id="note"
                  rows={4}
                  placeholder="اگر توضیح خاصی درباره تحویل سفارش دارید، اینجا بنویسید."
                  {...register("note")}
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
                    {errors.note.message}
                  </p>
                ) : null}
              </section>
            </div>

            {/* Order Summary */}
            <aside className="surface h-fit p-6 lg:sticky lg:top-24">
              <p dir="rtl" className="section-eyebrow">سفارش شما</p>

              <h2 className="mt-3 text-xl font-medium">خلاصه سفارش</h2>

              {/* Products */}
              <div className="mt-7 divide-y divide-border border-y border-border">
                {items.map((item) => (
                  <div key={item.lineId} className="flex gap-4 py-5">
                    {/* Thumbnail */}
                    <Link
                      href={`/product/${item.productId}`}
                      className="relative size-20 shrink-0 overflow-hidden bg-secondary"
                    >
                      {item.thumbnail ? (
                        <Image
                          src={item.thumbnail}
                          alt={item.name}
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
                        {item.name}
                      </Link>

                      <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                        <span
                          className="size-2.5 rounded-full border border-black/10"
                          style={{
                            backgroundColor: item.colorHex,
                          }}
                        />

                        <span>{item.colorName}</span>

                        <span>×</span>

                        <span>{formatNumber(item.quantity)}</span>
                      </div>

                      <p className="mt-3 text-xs font-medium">
                        {formatNumber(item.unitPrice * item.quantity)} تومان
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-4 py-6 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground">تعداد کالا</span>

                  <span>{formatNumber(totalQuantity)}</span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground">جمع کالاها</span>

                  <span>{formatNumber(totalPrice)} تومان</span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground">هزینه ارسال</span>

                  <span>{SHIPPING_COST === 0 ? "رایگان" : `${formatNumber(SHIPPING_COST)} تومان`}</span>
                </div>
              </div>

              {/* Final Total */}
              <div className="flex items-center justify-between gap-5 border-t border-border pt-6">
                <span className="font-medium">مبلغ قابل پرداخت</span>

                <span className="text-lg font-medium">
                  {formatNumber(totalPrice + SHIPPING_COST)} تومان
                </span>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
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
                      strokeWidth={1.5}
                    />
                    در حال بررسی...
                  </>
                ) : (
                  "ادامه و ثبت سفارش"
                )}
              </button>

              <p className="mt-4 text-center text-xs leading-6 text-muted-foreground">
                با ادامه فرایند، موجودی محصولات و اطلاعات سفارش پیش از پرداخت
                مجدداً بررسی خواهد شد.
              </p>
            </aside>
          </div>
        </form>
      </div>
    </main>
  );
}
