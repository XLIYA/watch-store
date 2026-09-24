"use client";
import { formatNumber } from "@/lib/format";

import { useState } from "react";

import { ShoppingBag } from "lucide-react";
import { toast } from "sonner";

import { ProductVariantSelector } from "@/components/product/product-variant-selector";
import { QuantitySelector } from "@/components/product/quantity-selector";

import { addItem } from "@/features/cart/cart.slice";

import { useAppDispatch, useAppSelector } from "@/store/hooks";

import type { Product, ProductVariant } from "@/types/product";

import { useHydrated } from "@/hooks/use-hydrated";

interface ProductPurchasePanelProps {
  product: Product;
}

export function ProductPurchasePanel({ product }: ProductPurchasePanelProps) {
  const dispatch = useAppDispatch();
  /*
   * هدف:
   * جلوگیری از Hydration mismatch بین Server و Client برای اطلاعات وابسته به Cart.
   *
   * محل استفاده:
   * داخل ProductPurchasePanel قبل از محاسباتی که به Redux Cart وابسته هستند.
   *
   * نحوه کار:
   * در اولین Render سمت Server و اولین Render سمت Client مقدار false است.
   * بعد از کامل شدن Hydration در مرورگر true می‌شود و اطلاعات واقعی Cart استفاده می‌شوند.
   */
  const isHydrated = useHydrated();

  const firstAvailableVariant =
    product.variants.find((variant) => variant.quantity > 0) ?? null;

  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    firstAvailableVariant?.id ?? null,
  );

  const [quantity, setQuantity] = useState(1);

  const selectedVariant: ProductVariant | null =
    product.variants.find((variant) => variant.id === selectedVariantId) ??
    null;

  const selectedLineId = selectedVariantId
    ? `${product.id}:${selectedVariantId}`
    : null;

  /*
   * هدف:
   * دریافت Cart واقعی از Redux بدون ایجاد اختلاف بین Render سمت Server و Client.
   *
   * محل استفاده:
   * در محاسبه تعداد Variant موجود در Cart و موجودی کل Product.
   *
   * نحوه کار:
   * Redux Cart همیشه خوانده می‌شود، اما تا قبل از کامل شدن Hydration
   * برای محاسبات این کامپوننت از آرایه خالی استفاده می‌کنیم تا خروجی Server و Client یکسان باشد.
   */
  const storedCartItems = useAppSelector((state) => state.cart.items);

  const cartItems = isHydrated ? storedCartItems : [];

  /*
   * هدف:
   * پیدا کردن Variant فعلی در سبد خرید.
   *
   * محل استفاده:
   * برای فهمیدن اینکه از رنگ انتخاب‌شده قبلاً چند عدد در Cart وجود دارد.
   *
   * نحوه کار:
   * lineId از ترکیب productId و variantId ساخته شده و در Cart جستجو می‌شود.
   */
  const existingCartItem = selectedLineId
    ? cartItems.find((item) => item.lineId === selectedLineId)
    : undefined;

  /*
   * هدف:
   * مشخص کردن تعداد فعلی Variant انتخاب‌شده داخل Cart.
   *
   * محل استفاده:
   * در محاسبه موجودی باقی‌مانده همان Variant.
   *
   * نحوه کار:
   * اگر Variant قبلاً داخل Cart باشد quantity آن خوانده می‌شود، در غیر این صورت صفر است.
   */
  const quantityAlreadyInCart = existingCartItem?.quantity ?? 0;

  /*
   * هدف:
   * دریافت موجودی واقعی Variant انتخاب‌شده از Product.
   *
   * محل استفاده:
   * برای جلوگیری از افزودن بیشتر از موجودی همان رنگ.
   *
   * نحوه کار:
   * quantity مربوط به selectedVariant خوانده می‌شود و اگر Variant وجود نداشته باشد صفر است.
   */
  const variantStock = selectedVariant?.quantity ?? 0;

  /*
   * هدف:
   * محاسبه مجموع تعداد تمام Variantهای همین Product که داخل Cart قرار دارند.
   *
   * محل استفاده:
   * برای جلوگیری از عبور مجموع رنگ‌های مختلف از product.quantity.
   *
   * نحوه کار:
   * فقط Cart Itemهایی که productId آن‌ها با Product فعلی برابر است فیلتر می‌شوند
   * و سپس quantity همه آن‌ها با هم جمع می‌شود.
   */
  const totalProductQuantityInCart = cartItems
    .filter((item) => item.productId === product.id)
    .reduce((total, item) => total + item.quantity, 0);

  /*
   * هدف:
   * محاسبه تعداد باقی‌مانده از موجودی همان Variant.
   *
   * محل استفاده:
   * یکی از دو محدودیت اصلی برای availableToAdd.
   *
   * نحوه کار:
   * تعداد Variant موجود در Cart از موجودی Variant کم می‌شود.
   */
  const variantAvailableToAdd = Math.max(
    0,
    variantStock - quantityAlreadyInCart,
  );

  /*
   * هدف:
   * محاسبه تعداد باقی‌مانده از موجودی کل Product.
   *
   * محل استفاده:
   * برای کنترل مجموع تمام Variantهای یک Product.
   *
   * نحوه کار:
   * مجموع تمام Variantهای همین Product در Cart از product.quantity کم می‌شود.
   */
  const productAvailableToAdd = Math.max(
    0,
    product.quantity - totalProductQuantityInCart,
  );

  /*
   * هدف:
   * تعیین حداکثر تعداد واقعی قابل افزودن به Cart.
   *
   * محل استفاده:
   * QuantitySelector، دکمه Add To Cart و validation نهایی handleAddToCart.
   *
   * نحوه کار:
   * محدودترین مقدار بین موجودی Variant و موجودی کل Product انتخاب می‌شود.
   */
  const availableToAdd = Math.min(variantAvailableToAdd, productAvailableToAdd);

  const canAddToCart =
    selectedVariant !== null &&
    product.quantity > 0 &&
    availableToAdd > 0 &&
    quantity > 0 &&
    quantity <= availableToAdd;

  const handleVariantChange = (variantId: string) => {
    setSelectedVariantId(variantId);
    setQuantity(1);
  };

  const handleQuantityChange = (newQuantity: number) => {
    setQuantity(newQuantity);
  };

  const handleAddToCart = () => {
    if (!selectedVariant) {
      toast.warning("ابتدا رنگ محصول را انتخاب کنید.");

      return;
    }

    if (variantStock <= 0) {
      toast.warning("رنگ انتخاب‌شده موجود نیست.");

      return;
    }

    /*
     * هدف:
     * جلوگیری از افزودن Variant بیشتر از موجودی همان رنگ.
     *
     * محل استفاده:
     * داخل handleAddToCart قبل از dispatch کردن addItem.
     *
     * نحوه کار:
     * اگر تمام موجودی Variant داخل Cart باشد، عملیات متوقف می‌شود.
     */
    if (variantAvailableToAdd <= 0) {
      toast.warning("تمام موجودی این رنگ در سبد خرید شما قرار دارد.");
      return;
    }

    /*
     * هدف:
     * جلوگیری از بیشتر شدن مجموع Variantهای یک Product از موجودی کل Product.
     *
     * محل استفاده:
     * داخل handleAddToCart قبل از dispatch کردن addItem.
     *
     * نحوه کار:
     * اگر مجموع رنگ‌های موجود در Cart به product.quantity رسیده باشد،
     * حتی اگر Variant انتخاب‌شده به‌تنهایی موجودی داشته باشد، افزودن متوقف می‌شود.
     */
    if (productAvailableToAdd <= 0) {
      toast.warning("تمام موجودی این محصول در سبد خرید شما قرار دارد.");
      return;
    }

    if (quantity > availableToAdd) {
      toast.warning("تعداد انتخاب‌شده بیشتر از موجودی قابل افزودن است.", {
        description: `حداکثر ${formatNumber(availableToAdd)} عدد دیگر قابل افزودن است.`,
      });

      return;
    }

    const thumbnail = product.thumbnail || product.images?.[0] || "";

    const wasAlreadyInCart = Boolean(existingCartItem);

    dispatch(
      addItem({
        productId: product.id,

        variantId: selectedVariant.id,

        name: product.name,

        thumbnail,

        colorName: selectedVariant.name,

        colorHex: selectedVariant.hex,

        unitPrice: product.price,

        quantity,

        maxQuantity: selectedVariant.quantity,
      }),
    );

    if (wasAlreadyInCart) {
      toast.success("تعداد محصول در سبد خرید به‌روزرسانی شد.");
    } else {
      toast.success("محصول به سبد خرید اضافه شد.");
    }

    setQuantity(1);
  };

  return (
    <div className="mt-10 space-y-7">
      <ProductVariantSelector
        variants={product.variants}
        selectedVariantId={selectedVariantId}
        onVariantChange={handleVariantChange}
      />

      <QuantitySelector
        value={quantity}
        max={availableToAdd}
        disabled={!selectedVariant || availableToAdd <= 0}
        onChange={handleQuantityChange}
      />

      {selectedVariant && quantityAlreadyInCart > 0 ? (
        <div className="text-xs leading-6 text-muted-foreground">
          در حال حاضر {formatNumber(quantityAlreadyInCart)} عدد از این رنگ در
          سبد خرید شما قرار دارد.
        </div>
      ) : null}

      {/* هدف: نمایش علت واقعی صفر شدن availableToAdd؛ محل استفاده: زیر QuantitySelector؛ نحوه کار: ابتدا موجودی کل Product و سپس موجودی Variant بررسی می‌شود. */}
      {selectedVariant &&
      variantStock > 0 &&
      product.quantity > 0 &&
      availableToAdd === 0 ? (
        <div className="border border-border bg-secondary/60 p-4 text-sm leading-7">
          {productAvailableToAdd <= 0
            ? "تمام موجودی این محصول در سبد خرید شما قرار گرفته است."
            : "تمام موجودی این رنگ در سبد خرید شما قرار گرفته است."}
        </div>
      ) : null}

      <div className="border-t border-border pt-7">
        <div className="flex items-center justify-between gap-6 text-sm">
          <span className="text-muted-foreground">مبلغ انتخاب فعلی</span>

          <span className="font-medium">
            {formatNumber(product.price * quantity)} تومان
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
          rounded-md
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
        <ShoppingBag className="size-[18px]" strokeWidth={1.5} />

        {/* ناموجودی سرور با پرشدن ظرفیت سبد متفاوت است؛ پیام دکمه باید علت واقعی غیرفعال‌شدن را نشان دهد. */}
        {product.quantity <= 0
          ? "اتمام موجودی"
          : !selectedVariant
            ? "رنگ موجودی برای خرید انتخاب نشده"
            : variantStock <= 0
              ? "این رنگ موجود نیست"
              : availableToAdd > 0
                ? "افزودن به سبد خرید"
                : "حداکثر موجودی در سبد خرید"}
      </button>
    </div>
  );
}
