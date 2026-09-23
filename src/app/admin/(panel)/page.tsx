import { redirect } from "next/navigation";

export default function AdminPage() {
  // طبق صورت پروژه، سفارش‌ها صفحهٔ نخست ورود به پنل هستند.
  redirect("/admin/orders");
}
