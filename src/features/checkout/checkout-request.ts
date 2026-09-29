import type { CreateOrderPayload } from "@/types/order";

let fallback: { fingerprint: string; id: string } | undefined;
/** شناسهٔ یک سفارش ثابت در retry و refresh حفظ می‌شود؛ فقط هش فرم ذخیره می‌شود، نه اطلاعات شخصی آن. */
export async function checkoutRequestId(payload: Omit<CreateOrderPayload, "requestId">) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(JSON.stringify(payload)));
  const fingerprint = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, "0")).join("");
  try {
    const previous = JSON.parse(sessionStorage.getItem("checkout-attempt") || "null");
    if (previous?.fingerprint === fingerprint && typeof previous.id === "string") return previous.id;
  } catch { /* در حالت محدودیت storage از شناسهٔ حافظه استفاده می‌شود. */ }
  if (fallback?.fingerprint !== fingerprint) fallback = { fingerprint, id: crypto.randomUUID() };
  try { sessionStorage.setItem("checkout-attempt", JSON.stringify(fallback)); } catch { /* فرم همچنان قابل ارسال است. */ }
  return fallback.id;
}

/** پس از پایان یک پرداخت، تلاش بعدی شناسهٔ تازه می‌گیرد؛ cache حافظه و storage با هم پاک می‌شوند. */
export function clearCheckoutAttempt() {
  fallback = undefined;
  try { sessionStorage.removeItem("checkout-attempt"); } catch { /* storage اختیاری است. */ }
}
