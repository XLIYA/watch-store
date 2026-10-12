"use client";
import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, CalendarDays, Package, UserRound, Loader2, CheckCircle2 } from "lucide-react";
import { displayOrderNumber } from "../../../../../../shared/order-number";
import { getOrderById } from "@/services/orders.service";
import { useDeliverOrderMutation } from "@/features/admin/orders/mutations";
import { getOrderStatusLabel, getPaymentStatusLabel } from "@/features/admin/orders/status-labels";
import { deliveryLabel } from "@/features/admin/orders/delivery-label";
import { formatDate, formatPrice, formatNumber, formatPhoneNumber } from "@/lib/format";
import { getApiErrorMessage } from "@/services/api/api-error";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";

/** صفحهٔ مستقل سفارش، وضعیت مالی، زمان‌بندی و اطلاعات ارسال را از snapshot همان سفارش نمایش می‌دهد. */
export default function OrderDetailsPage() {
  const orderId = useParams<{orderId: string}>()?.orderId;
  const [confirming, setConfirming] = useState(false);
  const delivery = useDeliverOrderMutation();
  const query = useQuery({queryKey: ["admin", "orders", "detail", orderId], enabled: !!orderId, queryFn: () => getOrderById(orderId!)});
  if (query.isPending) return <div role="status" className="surface flex min-h-56 items-center justify-center gap-3"><Loader2 className="size-5 animate-spin" />در حال دریافت جزئیات سفارش…</div>;
  if (query.isError) return <div role="alert" className="surface space-y-4 p-6"><p>{getApiErrorMessage(query.error)}</p><Button disabled={query.isFetching} onClick={() => query.refetch()}>تلاش دوباره</Button></div>;
  const order = query.data;
  const canDeliver = order.paymentStatus === "paid" && !["delivered", "cancelled"].includes(order.status);
  const events = [
    {label: "ثبت سفارش", time: order.createdAt},
    {label: "تأیید پرداخت", time: order.paidAt},
    {label: "تحویل به مشتری", time: order.deliveredAt},
  ];
  /** بستن مودال فقط بعد از موفقیت mutation است؛ خطای شبکه امکان تلاش دوباره را حفظ می‌کند. */
  async function confirmDelivery() {
    try { await delivery.mutateAsync(String(order.id)); setConfirming(false); } catch { /* خطا در مودال نمایش داده می‌شود. */ }
  }
  return <section className="min-w-0 space-y-6" dir="rtl">
    <header className="flex flex-wrap items-center justify-between gap-4">
      <div><p className="section-eyebrow">مدیریت سفارش‌ها</p><h1 className="mt-2 text-2xl font-medium">سفارش {formatPhoneNumber(displayOrderNumber(order))}</h1></div>
      <Button asChild variant="outline"><Link href="/admin/orders"><ArrowRight className="size-4" />بازگشت به سفارش‌ها</Link></Button>
    </header>
    <div className="surface flex flex-wrap items-center justify-between gap-4 p-5">
      <div className="flex flex-wrap gap-2"><Badge variant="secondary">{getOrderStatusLabel(order.status)}</Badge><Badge variant={order.paymentStatus === "paid" ? "default" : "secondary"}>{getPaymentStatusLabel(order.paymentStatus)}</Badge></div>
      {canDeliver ? <Button onClick={() => {delivery.reset(); setConfirming(true);}}>ثبت اتمام تحویل</Button> : <span className="text-sm text-muted-foreground">{order.status === "delivered" ? "سفارش به مشتری تحویل داده شده است." : "ثبت تحویل پس از تأیید پرداخت امکان‌پذیر است."}</span>}
    </div>
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(280px,1fr)]">
      <div className="min-w-0 space-y-5">
        <div className="surface p-6">
          <h2 className="mb-5 flex items-center gap-2 font-medium"><CalendarDays className="size-5 text-forest" />برنامهٔ تحویل</h2>
          <p className="rounded-xl bg-forest/5 p-4 text-base font-medium text-forest">{deliveryLabel(order.delivery.deliveryDate, order.delivery.deliveryTime)}</p>
          <dl className="mt-5 space-y-4 text-sm"><div><dt className="text-muted-foreground">نشانی گیرنده</dt><dd className="mt-2 leading-8">{order.delivery.address}، پلاک {formatPhoneNumber(order.delivery.plaque)}{order.delivery.unit && "، واحد " + formatPhoneNumber(order.delivery.unit)}</dd></div><div className="flex justify-between gap-3"><dt className="text-muted-foreground">کد پستی</dt><dd>{formatPhoneNumber(order.delivery.postalCode)}</dd></div></dl>
          {order.delivery.note && <div className="mt-5 border-t pt-4 text-sm"><p className="text-muted-foreground">یادداشت مشتری</p><p className="mt-2 whitespace-pre-wrap leading-7">{order.delivery.note}</p></div>}
        </div>
        <div className="surface overflow-hidden">
          <h2 className="flex items-center gap-2 border-b p-5 font-medium"><Package className="size-5 text-forest" />اقلام سفارش <Badge variant="secondary">{formatNumber(order.itemsCount)} عدد</Badge></h2>
          <Table><TableHeader><TableRow><TableHead>محصول</TableHead><TableHead>رنگ</TableHead><TableHead>تعداد</TableHead><TableHead>قیمت واحد</TableHead><TableHead>جمع</TableHead></TableRow></TableHeader><TableBody>{order.items.map(item => <TableRow key={item.lineId}><TableCell><Link className="underline underline-offset-4" href={"/product/" + item.productId}>{item.name}</Link></TableCell><TableCell>{item.colorName}</TableCell><TableCell>{formatNumber(item.quantity)}</TableCell><TableCell className="whitespace-nowrap">{formatPrice(item.unitPrice)} تومان</TableCell><TableCell className="whitespace-nowrap">{formatPrice(item.totalPrice)} تومان</TableCell></TableRow>)}</TableBody></Table>
        </div>
      </div>
      <aside className="min-w-0 space-y-5">
        <div className="surface p-6"><h2 className="mb-5 flex items-center gap-2 font-medium"><UserRound className="size-5 text-forest" />اطلاعات خریدار</h2><p>{order.customer.fullName}</p><a className="mt-3 inline-block text-sm underline underline-offset-4" dir="ltr" href={"tel:" + order.customer.mobile}>{formatPhoneNumber(order.customer.mobile)}</a></div>
        <div className="surface space-y-4 p-6 text-sm"><h2 className="font-medium">خلاصهٔ مبلغ</h2><div className="flex justify-between gap-3"><span className="text-muted-foreground">جمع کالاها</span><span>{formatPrice(order.subtotal)} تومان</span></div><div className="flex justify-between gap-3"><span className="text-muted-foreground">ارسال</span><span>{order.shippingCost === 0 ? "رایگان" : formatPrice(order.shippingCost) + " تومان"}</span></div><div className="flex justify-between gap-3 border-t pt-4 font-medium"><span>مبلغ نهایی</span><span>{formatPrice(order.totalPrice)} تومان</span></div></div>
        <div className="surface p-6"><h2 className="mb-5 font-medium">روند سفارش</h2><ol className="space-y-5">{events.map(event => <li key={event.label} className="flex gap-3"><CheckCircle2 className={"mt-1 size-4 shrink-0 " + (event.time ? "text-forest" : "text-muted-foreground/40")} /><div><p className="text-sm">{event.label}</p><p className="mt-1 text-xs text-muted-foreground">{event.time ? formatDate(event.time) : "زمانی ثبت نشده"}</p></div></li>)}</ol></div>
      </aside>
    </div>
    <AlertDialog open={confirming} onOpenChange={open => {if (!delivery.isPending) setConfirming(open);}}>
      <AlertDialogContent dir="rtl"><AlertDialogHeader><AlertDialogTitle>سفارش تحویل داده شده است؟</AlertDialogTitle><AlertDialogDescription>با تأیید شما، وضعیت و زمان واقعی تحویل در سرور ثبت می‌شود.</AlertDialogDescription></AlertDialogHeader>
        {delivery.isError && <p role="alert" className="text-sm text-destructive">{getApiErrorMessage(delivery.error)}</p>}
        <AlertDialogFooter><AlertDialogCancel disabled={delivery.isPending}>انصراف</AlertDialogCancel><AlertDialogAction disabled={delivery.isPending} onClick={event => {event.preventDefault(); void confirmDelivery();}}>{delivery.isPending && <Loader2 className="size-4 animate-spin" />}{delivery.isPending ? "در حال ثبت…" : "تأیید تحویل"}</AlertDialogAction></AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </section>;
}
