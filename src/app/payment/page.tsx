import { PaymentContent } from "@/components/checkout/payment-content";
import type { Metadata } from "next";
export const metadata: Metadata = { referrer: "no-referrer", robots: { index: false, follow: false } };
/** شناسه‌ها از URL خوانده می‌شوند تا ورود مستقیم و refresh به حافظهٔ موقت وابسته نباشند. */
export default async function PaymentPage({ searchParams }: { searchParams: Promise<{ orderId?: string; token?: string }> }) {
  const query = await searchParams;
  return <PaymentContent id={query.orderId || ""} token={query.token || ""} result={false} />;
}
