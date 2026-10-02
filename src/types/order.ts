/*
 * هدف:
 * تعریف وضعیت‌های واقعی چرخه عمر سفارش به‌صورت مستقل از پرداخت.
 *
 * محل استفاده:
 * تمام بخش‌هایی که با وضعیت سفارش کار می‌کنند؛
 * مثل Checkout، Admin Orders، فیلترها و جزئیات سفارش.
 *
 * نحوه کار:
 * وضعیت سفارش فقط مرحله پردازش و تحویل را مشخص می‌کند.
 * وضعیت پرداخت به‌صورت جداگانه توسط PaymentStatus مدیریت می‌شود.
 */
export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type PaymentStatus =
    | "pending"
    | "paid"
    | "failed";

export interface OrderItem {
    lineId: string;

    productId: number;
    variantId: string;

    name: string;
    thumbnail: string;

    colorName: string;
    colorHex: string;

    unitPrice: number;
    quantity: number;

    totalPrice: number;
}

export interface OrderCustomer {
    fullName: string;
    mobile: string;
}

export interface OrderDelivery {
    postalCode: string;

    address: string;

    plaque: string;

    unit?: string;

    latitude: number | null;
    longitude: number | null;

    /*
     * داخل Backend میلادی و استاندارد:
     * YYYY-MM-DD
     */
    deliveryDate: string;

    /*
     * HH:mm
     */
    deliveryTime: string;

    note?: string;
}

export interface Order {
    orderNumber?: string;
    id: number | string;

    customer: OrderCustomer;

    delivery: OrderDelivery;

    items: OrderItem[];

    itemsCount: number;

    subtotal: number;

    shippingCost: number;

    totalPrice: number;

    status: OrderStatus;

    paymentStatus: PaymentStatus;

    createdAt: number;

    paidAt: number | null;
    deliveredAt?: number | null;
}

// Checkout فقط انتخاب مشتری را می‌فرستد؛ مبلغ، snapshot کالا و وضعیت پرداخت را سرور می‌سازد.
export interface CreateOrderPayload {
  requestId: string;
  customer: OrderCustomer;
  delivery: OrderDelivery;
  items: Pick<OrderItem, "productId" | "variantId" | "quantity" | "unitPrice">[];
}
export interface CheckoutResponse { id: string | number; paymentUrl: string; resultUrl: string }
export interface PaymentSummary extends CheckoutResponse {
  orderNumber: string; expiresAt: number; captcha?: string; failureReason?: "cancelled" | "expired";
  totalPrice: number; itemsCount: number; paymentStatus: PaymentStatus; status: OrderStatus;
  paidAt: number | null; createdAt: number;
  items: Pick<OrderItem, "lineId" | "quantity">[];
}
