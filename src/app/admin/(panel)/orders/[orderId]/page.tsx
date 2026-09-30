"use client";
import { displayOrderNumber } from "../../../../../../shared/order-number";
import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getOrderById } from "@/services/orders.service";
import { useDeliverOrderMutation } from "@/features/admin/orders/mutations";
import { getOrderStatusLabel, getPaymentStatusLabel } from "@/features/admin/orders/status-labels";
import { formatDate, formatPrice, formatNumber, formatPhoneNumber } from "@/lib/format";
import { getApiErrorMessage } from "@/services/api/api-error";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";

/** جزئیات با GET بازیابی می‌شود؛ تأیید تحویل mutation مستقل دارد و زمان واقعی را سرور تعیین می‌کند. */
export default function OrderDetailsPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const [confirming, setConfirming] = useState(false);
  const delivery = useDeliverOrderMutation();
  const query = useQuery({ queryKey: ["admin", "orders", "detail", orderId], queryFn: () => getOrderById(orderId) });
  if (query.isPending) return <p role="status">در حال دریافت سفارش…</p>;
  if (query.isError) return <div role="alert"><p>{getApiErrorMessage(query.error)}</p><Button onClick={() => query.refetch()}>تلاش دوباره</Button></div>;
  const order = query.data;
  const canDeliver = order.paymentStatus === "paid" && !["delivered", "cancelled"].includes(order.status);
  async function confirmDelivery() {
    try { await delivery.mutateAsync(orderId); setConfirming(false); } catch { /* خطا در همان مودال باقی می‌ماند تا قابل تلاش مجدد باشد. */ }
  }
  return <section className="space-y-7">
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div><h1 className="text-2xl font-medium">جزئیات سفارش</h1><p dir="ltr" className="mt-2 break-all text-sm">{formatPhoneNumber(displayOrderNumber(order))}</p><p className="mt-3 text-sm text-muted-foreground">ثبت سفارش: {formatDate(order.createdAt)}</p></div>
      <Button asChild variant="outline"><Link href="/admin/orders">بازگشت به سفارش‌ها</Link></Button>
    </div>
    <div className="surface flex flex-wrap items-center gap-4 p-5">
      <Badge variant="secondary">{getOrderStatusLabel(order.status)}</Badge><Badge variant={order.paymentStatus === "paid" ? "default" : "secondary"}>{getPaymentStatusLabel(order.paymentStatus)}</Badge>
      {order.paidAt && <span className="text-xs">زمان پرداخت: {formatDate(order.paidAt)}</span>}
      {order.status === "delivered" ? <span className="text-sm">زمان تحویل واقعی: {order.deliveredAt ? formatDate(order.deliveredAt) : "برای این سفارش قدیمی ثبت نشده"}</span> : canDeliver ? <Button className="mr-auto" onClick={() => setConfirming(true)}>ثبت اتمام تحویل</Button> : <p className="text-xs text-muted-foreground">ثبت تحویل برای سفارش پرداخت‌نشده یا لغوشده فعال نیست.</p>}
    </div>
    <div className="grid gap-5 md:grid-cols-2">
      <div className="surface space-y-4 p-6"><h2 className="font-medium">خریدار</h2><p>{order.customer.fullName}</p><p>{formatPhoneNumber(order.customer.mobile)}</p><p className="text-sm">کد پستی: {formatPhoneNumber(order.delivery.postalCode)}</p></div>
      <div className="surface space-y-4 p-6"><h2 className="font-medium">اطلاعات تحویل</h2><p className="text-sm leading-7">{order.delivery.address}، پلاک {order.delivery.plaque}{order.delivery.unit && `، واحد ${order.delivery.unit}`}</p><p className="text-sm">زمان درخواستی: {order.delivery.deliveryDate} · {order.delivery.deliveryTime}</p>{order.delivery.note && <p className="text-sm">{order.delivery.note}</p>}</div>
    </div>
    <div className="surface overflow-hidden"><Table><TableHeader><TableRow><TableHead>محصول</TableHead><TableHead>رنگ</TableHead><TableHead>تعداد</TableHead><TableHead>قیمت واحد</TableHead><TableHead>جمع</TableHead></TableRow></TableHeader><TableBody>{order.items.map(item => <TableRow key={item.lineId}><TableCell><Link className="underline underline-offset-4" href={`/product/${item.productId}`}>{item.name}</Link></TableCell><TableCell>{item.colorName}</TableCell><TableCell>{formatNumber(item.quantity)}</TableCell><TableCell>{formatPrice(item.unitPrice)} تومان</TableCell><TableCell>{formatPrice(item.totalPrice)} تومان</TableCell></TableRow>)}</TableBody></Table></div>
    <p className="text-left font-medium">مبلغ کل: {formatPrice(order.totalPrice)} تومان</p>
    <AlertDialog open={confirming} onOpenChange={open => { if (!delivery.isPending) setConfirming(open); }}><AlertDialogContent dir="rtl"><AlertDialogHeader><AlertDialogTitle>سفارش تحویل داده شده است؟</AlertDialogTitle><AlertDialogDescription>با تأیید شما، وضعیت تحویل و زمان فعلی در سرور ثبت می‌شود.</AlertDialogDescription></AlertDialogHeader>{delivery.isError && <p role="alert" className="text-sm text-destructive">{getApiErrorMessage(delivery.error)}</p>}<AlertDialogFooter><AlertDialogCancel disabled={delivery.isPending}>انصراف</AlertDialogCancel><AlertDialogAction disabled={delivery.isPending} onClick={event => { event.preventDefault(); void confirmDelivery(); }}>{delivery.isPending ? "در حال ثبت…" : "تأیید تحویل"}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
  </section>;
}
