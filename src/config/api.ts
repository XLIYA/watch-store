const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;
if (!baseURL) throw new Error("NEXT_PUBLIC_API_BASE_URL is not defined");
const apiOrigin = new URL(baseURL);
if (!["http:", "https:"].includes(apiOrigin.protocol))
  throw new Error("Invalid API protocol");

export const apiConfig = {
  baseURL: baseURL.replace(/\/$/, ""),
  timeout: 15_000,
};

// نام endpointها قرارداد API است؛ آدرس محیط فقط در env تعیین می‌شود.
export const endpoints = {
  upload: "/upload",
  products: "/products",
  product: (id: number) => `/products/${encodeURIComponent(id)}`,
  categories: "/category",
  category: (id: number) => `/category/${encodeURIComponent(id)}`,
  subcategories: "/subcategory",
  subcategory: (id: number) => `/subcategory/${encodeURIComponent(id)}`,
  orders: "/orders",
  deliveryAvailability: "/delivery/availability",
  payment: (id: number | string) => '/payments/' + encodeURIComponent(id),
  paymentCode: (id: number | string) => '/payments/' + encodeURIComponent(id) + '/code',
  completePayment: (id: number | string) => '/payments/' + encodeURIComponent(id) + '/complete',
  deliverOrder: (id: number | string) => '/orders/' + encodeURIComponent(id) + '/deliver',
  order: (id: number | string) => `/orders/${encodeURIComponent(id)}`,
  auth: {
    login: "/auth/login",
    refresh: "/auth/refresh-token",
    logout: "/auth/logout",
    session: "/auth/session",
  },
};
