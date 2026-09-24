"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getOrderById } from "@/services/orders.service";
import { formatDate, formatPrice, formatNumber, formatPhoneNumber } from "@/lib/format";
import { getApiErrorMessage } from "@/services/api/api-error";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
/** ردیف سفارش به این صفحهٔ مستقل می‌رود؛ GET محافظت‌شده جزئیات را حتی پس از refresh از سرور دریافت می‌کند. */
export default function OrderDetailsPage(){
 const {orderId}=useParams<{orderId:string}>();
 const query=useQuery({queryKey:["admin","orders","detail",orderId],queryFn:()=>getOrderById(orderId)});
 if(query.isPending)return <p role="status">در حال دریافت سفارش…</p>;
 if(query.isError)return <div role="alert"><p>{getApiErrorMessage(query.error)}</p><Button onClick={()=>void query.refetch()}>تلاش دوباره</Button></div>;
 const order=query.data;
 return <section className="space-y-7"><div className="flex flex-wrap items-center justify-between gap-4"><div><h1 className="text-2xl font-medium">جزئیات سفارش {formatNumber(Number(order.id))}</h1><p className="mt-3 text-sm text-muted-foreground">{formatDate(order.createdAt)}</p></div><Button asChild variant="outline"><Link href="/admin/orders">بازگشت به سفارش‌ها</Link></Button></div><div className="grid gap-5 md:grid-cols-2"><div className="surface space-y-4 p-6"><h2 className="font-medium">خریدار</h2><p>{order.customer.fullName}</p><p>{formatPhoneNumber(order.customer.mobile)}</p><p className="text-sm">کد پستی: {formatPhoneNumber(order.delivery.postalCode)}</p></div><div className="surface space-y-4 p-6"><h2 className="font-medium">تحویل سفارش</h2><p className="text-sm leading-7">{order.delivery.address}، پلاک {order.delivery.plaque}{order.delivery.unit&&`، واحد ${order.delivery.unit}`}</p><p className="text-sm">{order.delivery.deliveryDate} · {order.delivery.deliveryTime}</p>{order.delivery.note&&<p className="text-sm">{order.delivery.note}</p>}</div></div><div className="surface overflow-hidden"><Table><TableHeader><TableRow><TableHead>محصول</TableHead><TableHead>رنگ</TableHead><TableHead>تعداد</TableHead><TableHead>قیمت واحد</TableHead><TableHead>جمع</TableHead></TableRow></TableHeader><TableBody>{order.items.map(item=><TableRow key={item.lineId}><TableCell><Link className="underline underline-offset-4" href={`/product/${item.productId}`}>{item.name}</Link></TableCell><TableCell>{item.colorName}</TableCell><TableCell>{formatNumber(item.quantity)}</TableCell><TableCell>{formatPrice(item.unitPrice)} تومان</TableCell><TableCell>{formatPrice(item.totalPrice)} تومان</TableCell></TableRow>)}</TableBody></Table></div><p className="text-left font-medium">مبلغ کل: {formatPrice(order.totalPrice)} تومان</p></section>;
}
