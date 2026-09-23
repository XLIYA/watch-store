/**
 * cart و checkout نتیجهٔ اعتبارسنجی را با همین تابع روی Redux اعمال می‌کنند.
 * جداسازی دریافت داده از تغییر سبد ضروری است: اگر یکی از درخواست‌ها شکست بخورد، سبد ناقص تغییر نمی‌کند.
 * پیام مشترک نیز دلیل توقف ادامهٔ خرید را در هر دو صفحه یکسان توضیح می‌دهد.
 */
import {
  removeItem,
  updateItemPrice,
  updateItemStock,
} from "@/features/cart/cart.slice";
import type { CheckoutStockValidationResult } from "@/features/checkout/validate-checkout-stock";
import type { AppDispatch } from "@/store/store";

// فقط پس از موفقیت دریافت تمام محصولات اجرا می‌شود؛ شکست جزئی شبکه هیچ قلمی را حذف نمی‌کند.
export function syncCartStock(
  result: CheckoutStockValidationResult,
  dispatch: AppDispatch,
) {
  for (const item of result.syncItems) dispatch(updateItemStock(item));
  for (const item of result.unavailableItems) dispatch(removeItem(item.lineId));
  for (const item of result.priceChangedItems)
    dispatch(
      updateItemPrice({ lineId: item.lineId, unitPrice: item.currentPrice }),
    );
}

export function getStockChangeMessage(result: CheckoutStockValidationResult) {
  if (result.priceChangedItems.length)
    return "قیمت برخی محصولات تغییر کرده است. مبلغ جدید را بررسی و دوباره تأیید کنید.";
  if (result.unavailableItems.length)
    return "کالاهای حذف‌شده یا ناموجود از سبد برداشته شدند. سبد را دوباره بررسی کنید.";
  if (result.reducedItems.length)
    return "تعداد برخی محصولات با موجودی فعلی اصلاح شد. سبد را دوباره بررسی کنید.";
  return "مجموع تعداد رنگ‌های انتخاب‌شده از موجودی کل محصول بیشتر است. تعداد را کاهش دهید.";
}
