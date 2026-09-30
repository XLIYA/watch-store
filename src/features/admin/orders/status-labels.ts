import type { Order } from "@/types/order";
/** برچسب یکسان در لیست و جزئیات سفارش استفاده می‌شود. */
export function getOrderStatusLabel(status: Order["status"]) {
  switch (status) {
    case "pending":
      return "در انتظار بررسی";

    case "processing":
      return "در حال پردازش";

    case "shipped":
      return "ارسال شده";

    case "delivered":
      return "تحویل شده";

    case "cancelled":
      return "لغو شده";
  }
}

/*
 * هدف:
 * تبدیل وضعیت فنی پرداخت به متن فارسی.
 *
 * محل استفاده:
 * ستون وضعیت پرداخت در جدول Admin Orders.
 *
 * نحوه کار:
 * paymentStatus دریافتی از Backend به متن فارسی مناسب تبدیل می‌شود.
 */
export function getPaymentStatusLabel(status: Order["paymentStatus"]) {
  switch (status) {
    case "pending":
      return "در انتظار پرداخت";

    case "paid":
      return "پرداخت شده";

    case "failed":
      return "ناموفق";
  }
}

