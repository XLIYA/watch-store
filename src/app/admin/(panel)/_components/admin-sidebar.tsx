"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import {
    Boxes,
    LogOut,
    PackageSearch,
    ReceiptText,
    Watch,
} from "lucide-react";

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

import { logoutAdmin } from "@/services/auth.service";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/services/api/api-error";

const adminMenuItems = [
    {
        title: "سفارش‌ها",
        href: "/admin/orders",
        icon: ReceiptText,
    },
    {
        title: "محصولات",
        href: "/admin/products",
        icon: Watch,
    },
    {
        title: "قیمت و موجودی",
        href: "/admin/inventory",
        icon: Boxes,
    },
];

export function AdminSidebar() {
    const pathname = usePathname();
    const router = useRouter();

    const logout = useMutation({
        mutationFn: logoutAdmin,
        onSuccess: () => router.replace("/admin/login"),
        onError: error => toast.error(getApiErrorMessage(error)),
    });
    const handleLogout = () => { if (!logout.isPending) logout.mutate(); };

    return (
        <Sidebar
            side="right"
            collapsible="icon"
            className="border-l border-sidebar-border"
        >
            <SidebarHeader className="border-b border-sidebar-border">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            size="lg"
                            asChild
                            tooltip="Watch Store"
                        >
                            <Link href="/admin">
                                <div className="flex size-10 items-center justify-center rounded-xl bg-gold text-ink">
                                    <PackageSearch className="size-4" />
                                </div>

                                <div className="grid flex-1 text-right text-sm leading-tight">
                                    <span className="truncate font-medium">
                                        Watch Store
                                    </span>

                                    <span className="truncate text-xs text-sidebar-foreground/60">
                                        پنل مدیریت
                                    </span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup className="gap-3 py-6">
                    <SidebarGroupLabel>
                        مدیریت فروشگاه
                    </SidebarGroupLabel>

                    <SidebarGroupContent>
                        <SidebarMenu>
                            {adminMenuItems.map((item) => {
                                const Icon = item.icon;

                                const isActive =
                                    pathname === item.href;

                                return (
                                    <SidebarMenuItem key={item.href}>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={isActive}
                                            tooltip={item.title}
                                        >
                                            <Link href={item.href}>
                                                <Icon />
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                );
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="border-t border-sidebar-border">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            tooltip="خروج از حساب"
                            onClick={handleLogout}
                            disabled={logout.isPending}
                        >
                            <LogOut />
                            <span>{logout.isPending ? "در حال خروج..." : "خروج از حساب"}</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
}
