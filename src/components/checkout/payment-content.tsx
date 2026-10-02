"use client";
import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, XCircle, Loader2, Clock3, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PaymentForm } from "./payment-form";
import styles from "./payment.module.css";
import { getPayment } from "@/services/payment.service";
import { getApiErrorMessage } from "@/services/api/api-error";
import { clearCheckoutAttempt } from "@/features/checkout/checkout-request";
import { usePaymentMutation } from "@/features/checkout/payment-mutations";
import { formatPrice } from "@/lib/format";
import { persianDigits } from "@/lib/digits";
import { useAppDispatch } from "@/store/hooks";
import { settlePayment } from "@/features/cart/cart.slice";
import { useHydrated } from "@/hooks/use-hydrated";
import rules from "../../../shared/payment-rules.json";
import { paymentRefreshInterval } from "@/features/checkout/payment-refresh";
import type { PaymentFields } from "../../../shared/payment-validation";

/** رویداد اتصال برای پیام رابط است؛ مرجع قطعی نتیجه همچنان API است. */
function subscribeConnection(notify: () => void) {
  window.addEventListener("online", notify);
  window.addEventListener("offline", notify);
  return () => {
    window.removeEventListener("online", notify);
    window.removeEventListener("offline", notify);
  };
}
/** درگاه و رسید یک منبع حقیقت دارند؛ timeout شبکه هرگز به‌تنهایی پرداخت را ناموفق نمی‌کند. */
export function PaymentContent({
  id,
  token,
  result = false,
}: {
  id: string;
  token: string;
  result?: boolean;
}) {
  const online = useSyncExternalStore(
    subscribeConnection,
    () => navigator.onLine,
    () => true,
  );
  const query = useQuery({
    queryKey: ["payment", id, token],
    queryFn: ({ signal }) => getPayment(id, token, signal),
    enabled: Boolean(id && token),
    retry: false,
    staleTime: rules.pollMilliseconds,
    refetchOnWindowFocus: false,
    refetchOnReconnect: (q) =>
      !["paid", "failed"].includes(q.state.data?.paymentStatus ?? ""),
    refetchInterval: (q) =>
      paymentRefreshInterval(
        q.state.data?.paymentStatus,
        q.state.error,
        q.state.errorUpdateCount,
      ),
  });
  const mutation = usePaymentMutation();
  const dispatch = useAppDispatch();
  const hydrated = useHydrated();
  const [now, setNow] = useState(0);
  const [checking, setChecking] = useState(false);
  const order = query.data;
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    if (!hydrated || !order || order.paymentStatus === "pending") return;
    if (order.paymentStatus === "paid")
      dispatch(
        settlePayment({
          id: String(order.id),
          items: order.items,
          createdAt: order.createdAt,
        }),
      );
    clearCheckoutAttempt();
  }, [dispatch, hydrated, order]);
  async function pay(outcome: "paid" | "failed", fields?: PaymentFields) {
    if (!online) return;
    try {
      const response = await mutation.mutateAsync({
        id,
        token,
        outcome,
        fields,
      });
      window.location.assign(response.resultUrl);
    } catch {
      // پاسخ موفق ممکن است گم شده باشد؛ ارسال دوباره تا پایان استعلام غیرفعال می‌ماند.
      setChecking(true);
      await query.refetch();
      setChecking(false);
    }
  }
  const seconds =
    order && now
      ? Math.max(0, Math.ceil((order.expiresAt - now) / 1000))
      : null;
  const pending = order?.paymentStatus === "pending";
  const busy = mutation.isPending || checking;
  const showResult = result || (order && !pending);
  return (
    <main
      className={
        (showResult ? "bg-background text-foreground" : styles.gateway) +
        " min-h-screen px-4 py-6 sm:py-10"
      }
      dir="rtl"
    >
      <div className="mx-auto max-w-4xl">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-xl font-semibold">
            {showResult ? "نتیجهٔ پرداخت" : "درگاه پرداخت اینترنتی"}
          </h1>
          <p className="text-sm text-muted-foreground">خانهٔ ساعت</p>
        </header>
        {!online && (
          <p
            role="alert"
            className="mb-5 flex items-center gap-3 rounded-xl border bg-card p-4 text-sm"
          >
            <WifiOff className="size-5 shrink-0" />
            {order && !pending
              ? "ارتباط قطع است؛ آخرین نتیجهٔ تأییدشده نمایش داده می‌شود."
              : "اتصال اینترنت قطع است. نتیجه هنوز قابل تأیید نیست؛ پس از اتصال دوباره بررسی می‌شود."}
          </p>
        )}
        <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
          {!id || !token ? (
            <p role="alert" className="p-8">
              لینک پرداخت کامل نیست.
            </p>
          ) : !order ? (
            <div className="p-8">
              {query.isError ? (
                <p role="alert">{getApiErrorMessage(query.error)}</p>
              ) : (
                <p role="status" className="flex items-center gap-2">
                  <Loader2 className="size-5 animate-spin" />
                  {online ? "در حال دریافت سفارش…" : "در انتظار اتصال…"}
                </p>
              )}
            </div>
          ) : (
            <div
              className={
                showResult
                  ? "p-6 sm:p-10"
                  : "grid md:grid-cols-[minmax(0,1fr)_260px]"
              }
            >
              <aside
                className={
                  showResult
                    ? "mb-7 border-b pb-6"
                    : "border-b bg-secondary/50 p-6 md:order-2 md:border-r md:border-b-0"
                }
              >
                <h2 className="font-medium">اطلاعات پذیرنده</h2>
                <p className="mt-3 text-sm text-muted-foreground">
                  فروشگاه خانهٔ ساعت
                </p>
                <dl className="mt-6 space-y-5 text-sm">
                  <div>
                    <dt className="text-muted-foreground">شمارهٔ سفارش</dt>
                    <dd className="mt-2 font-medium">
                      {persianDigits(order.orderNumber)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">مبلغ قابل پرداخت</dt>
                    <dd className="mt-2 text-lg font-medium">
                      {formatPrice(order.totalPrice)} تومان
                    </dd>
                  </div>
                </dl>
                {pending && (
                  <p
                    role="timer"
                    className="mt-6 flex items-center gap-2 text-sm"
                  >
                    <Clock3 className="size-4" />
                    {seconds === null
                      ? "…"
                      : seconds === 0
                        ? "مهلت پرداخت پایان یافت"
                        : persianDigits(
                            Math.floor(seconds / 60) +
                              ":" +
                              String(seconds % 60).padStart(2, "0"),
                          )}
                  </p>
                )}
              </aside>
              <div className={showResult ? "" : "p-6 sm:p-8"}>
                {showResult ? (
                  <div className="space-y-4 text-center" role="status">
                    {order.paymentStatus === "paid" ? (
                      <CheckCircle2 className="mx-auto size-16 text-forest" />
                    ) : (
                      <XCircle className="mx-auto size-16 text-destructive" />
                    )}
                    <h2 className="text-xl">
                      {order.paymentStatus === "paid"
                        ? "پرداخت با موفقیت تأیید شد"
                        : "پرداخت نشده است"}
                    </h2>
                    <p className="text-sm leading-7 text-muted-foreground">
                      {order.paymentStatus === "paid"
                        ? "سفارش شما ثبت شد و برای ارسال آماده می‌شود."
                        : order.failureReason === "expired"
                          ? "مهلت پرداخت پایان یافته است. اقلام سبد خرید حفظ شده‌اند."
                          : "پرداخت تکمیل نشده و سبد خرید شما حفظ شده است."}
                    </p>
                    {pending && (
                      <Button asChild>
                        <a href={order.paymentUrl}>ادامهٔ پرداخت</a>
                      </Button>
                    )}
                    {order.paymentStatus === "failed" && (
                      <Button asChild>
                        <Link href="/checkout" onClick={clearCheckoutAttempt}>
                          ثبت مجدد سفارش و پرداخت
                        </Link>
                      </Button>
                    )}
                  </div>
                ) : (
                  <PaymentForm
                    id={id}
                    token={token}
                    captcha={order.captcha || ""}
                    disabled={!online || busy || seconds === 0 || query.isError}
                    paying={
                      mutation.isPending &&
                      mutation.variables?.outcome === "paid"
                    }
                    cancelling={
                      mutation.isPending &&
                      mutation.variables?.outcome === "failed"
                    }
                    onPay={(fields) => pay("paid", fields)}
                    onCancel={() => void pay("failed")}
                  />
                )}
              </div>
            </div>
          )}
          <div className="space-y-3 border-t px-6 py-4 text-sm">
            {(checking || (query.isFetching && Boolean(order))) && (
              <p role="status" className="flex items-center gap-2">
                <Loader2 className="size-4 animate-spin" />
                در حال استعلام وضعیت پرداخت…
              </p>
            )}
            {mutation.isError && pending && (
              <p role="alert" className="text-destructive">
                {getApiErrorMessage(mutation.error)} نتیجه به‌صورت خودکار
                استعلام می‌شود.
              </p>
            )}
            {query.isError && order && (
              <p role="alert">
                دریافت نتیجه ممکن نشد؛ وضعیت نمایش‌داده‌شده آخرین پاسخ سرور است.
              </p>
            )}
            {(!pending || result) && (
              <div className="flex justify-between gap-3">
                <Link href="/shop" className="underline underline-offset-4">
                  بازگشت به فروشگاه
                </Link>
                <Link href="/cart" className="underline underline-offset-4">
                  سبد خرید
                </Link>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
