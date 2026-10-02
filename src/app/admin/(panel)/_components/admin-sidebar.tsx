"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Boxes,
  ChartNoAxesCombined,
  LogOut,
  ReceiptText,
  Watch,
  ArrowUpLeft,
  CircleUserRound,
} from "lucide-react";
import { useLogoutMutation } from "@/features/auth/mutations";
import { toast } from "sonner";
import { BrandLogo } from "@/components/brand/brand-logo";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import { getApiErrorMessage } from "@/services/api/api-error";

const items = [
  { title: "داشبورد فروش", href: "/admin/dashboard", icon: ChartNoAxesCombined },
  { title: "سفارش‌ها", href: "/admin/orders", icon: ReceiptText },
  { title: "محصولات", href: "/admin/products", icon: Watch },
  { title: "قیمت و موجودی", href: "/admin/inventory", icon: Boxes },
];

/** سایدبار فقط ناوبری و خروج دارد؛ نام کاربر از layout دریافت می‌شود تا برای نمایش پروفایل درخواست نشست تکرار نشود. */
export function AdminSidebar({ userName }: { userName?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useLogoutMutation();
  return (
    <Sidebar
      side="right"
      collapsible="icon"
      variant="inset"
      className="border-0"
    >
      <SidebarHeader className="px-4 py-7 group-data-[collapsible=icon]:px-1">
        <BrandLogo
          href="/admin"
          className="[&>span>span:first-child]:text-base group-data-[collapsible=icon]:[&>span]:hidden group-data-[collapsible=icon]:gap-0"
        />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="px-4 group-data-[collapsible=icon]:px-1">
          <SidebarGroupLabel className="mb-4 text-[10px] tracking-widest">
            فضای مدیریت
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-2">
              {items.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    isActive={pathname === item.href}
                    className="h-12 rounded-lg px-4 text-sm data-[active=true]:bg-primary data-[active=true]:text-primary-foreground"
                  >
                    <Link
                      href={item.href}
                      aria-current={pathname === item.href ? "page" : undefined}
                    >
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <div className="mx-4 mt-auto border-t border-sidebar-border py-5 group-data-[collapsible=icon]:hidden">
          <Link
            href="/shop"
            className="flex items-center justify-between rounded-lg border border-sidebar-border bg-card p-4 text-xs"
          >
            مشاهدهٔ فروشگاه
            <ArrowUpLeft className="size-4" />
          </Link>
        </div>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border px-4 py-5 group-data-[collapsible=icon]:px-1">
        <div className="mb-4 flex items-center gap-3 group-data-[collapsible=icon]:hidden">
          <CircleUserRound className="size-8 text-muted-foreground" />
          <div>
            <p className="text-sm">{userName || "مدیر فروشگاه"}</p>
            <p className="mt-1 text-[10px] text-muted-foreground">
              مدیریت کاتالوگ و سفارش‌ها
            </p>
          </div>
        </div>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="خروج از حساب"
              disabled={logout.isPending}
              onClick={() => {
                if (!logout.isPending) logout.mutate(undefined, {onSuccess: () => router.replace("/admin/login"), onError: error => toast.error(getApiErrorMessage(error))});
              }}
            >
              <LogOut />
              <span>{logout.isPending ? "در حال خروج…" : "خروج از حساب"}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
