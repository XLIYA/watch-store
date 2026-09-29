"use client";

import { clearCheckoutAttempt } from "@/features/checkout/checkout-request";
import { useEffect } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, XCircle, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getPayment } from "@/services/payment.service";
import { getApiErrorMessage } from "@/services/api/api-error";
import { usePaymentMutation } from "@/features/checkout/payment-mutations";
import { formatPrice } from "@/lib/format";
import { useAppDispatch } from "@/store/hooks";
import { settlePayment } from "@/features/cart/cart.slice";
import { useHydrated } from "@/hooks/use-hydrated";

/** درگاه و رسید از یک GET استفاده می‌کنند؛ URL فقط شناسهٔ دسترسی است و موفقیت از سرور می‌آید. */
export function PaymentContent({ id, token, result = false }: { id: string; token: string; result?: boolean }) {
  const query = useQuery({ queryKey: ["payment", id, token], queryFn: ({ signal }) => getPayment(id, token, signal), enabled: Boolean(id && token), retry: false, staleTime: 0 });
  const mutation = usePaymentMutation();
  const dispatch = useAppDispatch();
  const hydrated = useHydrated();
  const order = query.data;
  useEffect(() => {
    if (!hydrated || !order || order.paymentStatus === "pending") return;
    if (order.paymentStatus === "paid") {
      dispatch(settlePayment({ id: String(order.id), items: order.items, createdAt: order.createdAt }));
    }
    // درخواست بعدی checkout یک خرید جدید است؛ کلید قبلی فقط برای retry همین خرید بود.
    clearCheckoutAttempt();
  }, [dispatch, hydrated, order]);

  /** redirect کامل، استقلال پرداخت از حافظهٔ React را مانند رفت‌وبرگشت درگاه واقعی بررسی می‌کند. */
  async function pay(outcome: "paid" | "failed") {
    try {
      const response = await mutation.mutateAsync({ id, token, outcome });
      window.location.assign(response.resultUrl);
    } catch { /* خطا کنار دکمه‌ها نمایش داده می‌شود؛ سبد و فرم از دست نمی‌روند. */ }
  }
  const validLink = Boolean(id && token);
  return <main className="flex min-h-screen items-center justify-center bg-secondary/40 px-4 py-12" dir="rtl">
    <section className="w-full max-w-lg space-y-6 rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-10">
      <p className="section-kicker">خانهٔ ساعت</p>
      <h1 className="text-2xl font-medium">{result ? "نتیجهٔ پرداخت" : "درگاه پرداخت آزمایشی"}</h1>
      {!validLink ? <p role="alert">لینک پرداخت کامل نیست.</p> : query.isPending ? <p role="status" className="flex items-center gap-2"><Loader2 className="size-4 animate-spin" /> در حال دریافت سفارش…</p> : query.isError ? <div role="alert" className="space-y-4"><p>{getApiErrorMessage(query.error)}</p><Button variant="outline" onClick={() => query.refetch()}>تلاش دوباره</Button></div> : order && <>
        {result || order.paymentStatus !== "pending" ? <div className="space-y-4 text-center" role="status">
          {order.paymentStatus === "paid" ? <CheckCircle2 className="mx-auto size-14 text-forest" /> : <XCircle className="mx-auto size-14 text-muted-foreground" />}
          <h2 className="text-xl">{order.paymentStatus === "paid" ? "پرداخت با موفقیت ثبت شد" : order.paymentStatus === "failed" ? "پرداخت انجام نشد" : "سفارش در انتظار پرداخت است"}</h2>
          <p className="text-sm leading-7 text-muted-foreground">{order.paymentStatus === "paid" ? "سفارش شما برای آماده‌سازی ثبت شده است." : "سبد خرید شما حفظ شده است."}</p>
        </div> : <p className="flex items-start gap-2 rounded-xl bg-forest/5 p-4 text-sm leading-7"><ShieldCheck className="mt-1 size-5 shrink-0 text-forest" />این درگاه آموزشی است؛ پولی جابه‌جا نمی‌شود و نیازی به اطلاعات کارت بانکی نیست.</p>}
        <dl className="space-y-4 border-y py-5 text-sm"><div><dt className="text-muted-foreground">شناسهٔ سفارش</dt><dd className="mt-2 break-all" dir="ltr">{order.id}</dd></div><div className="flex justify-between gap-3"><dt>مبلغ سفارش</dt><dd>{formatPrice(order.totalPrice)} تومان</dd></div></dl>
        {mutation.isError && <p role="alert" className="text-sm leading-7 text-destructive">{getApiErrorMessage(mutation.error)}</p>}
        {!result && order.paymentStatus === "pending" && <div className="grid grid-cols-2 gap-3"><Button disabled={mutation.isPending} onClick={() => pay("paid")}>{mutation.isPending ? "در حال ثبت…" : "پرداخت آزمایشی"}</Button><Button variant="outline" disabled={mutation.isPending} onClick={() => pay("failed")}>انصراف از پرداخت</Button></div>}
        {result && order.paymentStatus === "pending" && <Button asChild className="w-full"><a href={order.paymentUrl}>ادامهٔ پرداخت</a></Button>}
        {order.paymentStatus === "failed" && <Button asChild className="w-full"><Link href="/checkout" onClick={clearCheckoutAttempt}>ثبت مجدد سفارش و پرداخت</Link></Button>}
      </>}
      <div className="flex justify-between gap-4 text-sm"><Link href="/shop" className="underline underline-offset-4">بازگشت به فروشگاه</Link><Link href="/cart" className="underline underline-offset-4">سبد خرید</Link></div>
    </section>
  </main>;
}
