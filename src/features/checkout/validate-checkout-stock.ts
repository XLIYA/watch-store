import type { CartItem } from "@/features/cart/cart.types";

import { getProductById } from "@/services/products.service";

import type { Product } from "@/types/product";

export interface StockSyncItem {
  lineId: string;
  maxQuantity: number;
}

export interface ReducedStockItem {
  lineId: string;
  productName: string;
  requestedQuantity: number;
  availableQuantity: number;
}

export interface UnavailableStockItem {
  lineId: string;
  productName: string;
}

/*
 * هدف:
 * نگهداری اطلاعات محصولاتی که قیمت آن‌ها از زمان Add To Cart تغییر کرده است.
 *
 * محل استفاده:
 * در validateCheckoutStock و سپس در Checkout برای اطلاع‌رسانی به کاربر
 * و Sync کردن قیمت Cart با قیمت فعلی Backend.
 *
 * نحوه کار:
 * قیمت ذخیره‌شده داخل Cart با قیمت فعلی Product مقایسه می‌شود
 * و در صورت اختلاف، اطلاعات قیمت قبلی و جدید داخل این ساختار قرار می‌گیرد.
 */
export interface PriceChangedItem {
  lineId: string;
  productName: string;
  previousPrice: number;
  currentPrice: number;
}

export interface ProductStockIssue {
  productId: number;
  productName: string;
  requestedQuantity: number;
  availableQuantity: number;
}

export interface CheckoutStockValidationResult {
  isValid: boolean;

  products: Map<number, Product>;

  syncItems: StockSyncItem[];

  reducedItems: ReducedStockItem[];

  unavailableItems: UnavailableStockItem[];

  productStockIssues: ProductStockIssue[];

  priceChangedItems: PriceChangedItem[];
}

export async function validateCheckoutStock(
  items: CartItem[],
): Promise<CheckoutStockValidationResult> {
  /*
   * هر Product فقط یک بار
   * از Backend دریافت می‌شود.
   */
  const productIds = [
    ...new Set(
      items.map(
        (item) => item.productId,
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

  const products =
    new Map<number, Product>();

  for (const product of productResults) {
    if (!product) {
      continue;
    }

    products.set(
      product.id,
      product,
    );
  }

  const syncItems: StockSyncItem[] = [];

  const reducedItems: ReducedStockItem[] =
    [];

  const unavailableItems: UnavailableStockItem[] = [];
  /*
 * هدف:
 * جمع‌آوری محصولاتی که قیمت فعلی Backend آن‌ها با قیمت ذخیره‌شده در Cart متفاوت است.
 *
 * محل استفاده:
 * هنگام Validation نهایی Checkout.
 *
 * نحوه کار:
 * برای هر Cart Item، قیمت ذخیره‌شده با product.price مقایسه می‌شود
 * و اختلاف‌ها داخل priceChangedItems قرار می‌گیرند.
 */
  const priceChangedItems: PriceChangedItem[] = [];

  /*
   * ابتدا هر Variant جداگانه
   * بررسی می‌شود.
   */
  for (const item of items) {
    const product =
      products.get(
        item.productId,
      );

    if (!product) {
      unavailableItems.push({
        lineId: item.lineId,
        productName: item.name,
      });

      continue;
    }

    const variant =
      product.variants.find(
        (currentVariant) =>
          currentVariant.id ===
          item.variantId,
      );

    if (
      !variant ||
      variant.quantity <= 0 ||
      product.quantity <= 0
    ) {
      unavailableItems.push({
        lineId: item.lineId,
        productName:
          product.name,
      });

      continue;
    }

    /*
    * هدف:
    * تشخیص تغییر قیمت محصول بین زمان Add To Cart و زمان Checkout.
    *
    * محل استفاده:
    * بعد از اطمینان از وجود Product و Variant و قبل از تأیید نهایی سفارش.
    *
    * نحوه کار:
    * unitPrice ذخیره‌شده در Cart با price فعلی Product از Backend مقایسه می‌شود.
    * اگر متفاوت باشند، Checkout نامعتبر می‌شود تا کاربر ابتدا قیمت جدید را ببیند.
    */
    if (item.unitPrice !== product.price) {
      priceChangedItems.push({
        lineId: item.lineId,
        productName: product.name,
        previousPrice: item.unitPrice,
        currentPrice: product.price,
      });
    }

    /*
     * موجودی Variant سقف مستقیم
     * همان رنگ است.
     *
     * موجودی کل Product هم نباید
     * نادیده گرفته شود.
     */
    const availableQuantity =
      Math.min(
        variant.quantity,
        product.quantity,
      );

    /*
     * اگر maxQuantity قدیمی باشد
     * باید Cart با Backend Sync شود.
     */
    if (
      item.maxQuantity !==
      availableQuantity
    ) {
      syncItems.push({
        lineId: item.lineId,
        maxQuantity:
          availableQuantity,
      });
    }

    /*
     * اگر کاربر بیشتر از موجودی
     * فعلی درخواست کرده باشد.
     */
    if (
      item.quantity >
      availableQuantity
    ) {
      reducedItems.push({
        lineId: item.lineId,

        productName:
          product.name,

        requestedQuantity:
          item.quantity,

        availableQuantity,
      });
    }
  }

  /*
   * بررسی دوم:
   *
   * ممکن است یک Product دو Variant
   * مختلف داخل Cart داشته باشد.
   *
   * مثال:
   *
   * موجودی کل Product = 3
   *
   * مشکی = 2
   * نقره‌ای = 2
   *
   * اگر کاربر 2 + 2 سفارش دهد،
   * از نظر Variantها معتبر است
   * ولی مجموع سفارش 4 شده و
   * بیشتر از موجودی کل Product است.
   */
  const requestedByProduct =
    new Map<number, number>();

  for (const item of items) {
    const current =
      requestedByProduct.get(
        item.productId,
      ) ?? 0;

    requestedByProduct.set(
      item.productId,
      current +
      item.quantity,
    );
  }

  const productStockIssues: ProductStockIssue[] =
    [];

  for (
    const [
      productId,
      requestedQuantity,
    ] of requestedByProduct
  ) {
    const product =
      products.get(
        productId,
      );

    if (!product) {
      continue;
    }

    if (
      requestedQuantity >
      product.quantity
    ) {
      productStockIssues.push({
        productId,

        productName:
          product.name,

        requestedQuantity,

        availableQuantity:
          product.quantity,
      });
    }
  }

  /*
   * هدف:
   * جلوگیری از ساخت Order در صورت وجود هرگونه مشکل موجودی یا تغییر قیمت.
   *
   * محل استفاده:
   * نتیجه نهایی validateCheckoutStock.
   *
   * نحوه کار:
   * فقط زمانی Validation موفق است که هیچ محصول ناموجود، کاهش موجودی،
   * مشکل موجودی کل Product یا تغییر قیمت وجود نداشته باشد.
   */
  const isValid =
    unavailableItems.length === 0 &&
    reducedItems.length === 0 &&
    productStockIssues.length === 0 &&
    priceChangedItems.length === 0;

  return {
    isValid,

    products,

    syncItems,

    reducedItems,

    unavailableItems,

    productStockIssues,

    priceChangedItems,
  };
}