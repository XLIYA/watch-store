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

import { clearAdminTokens } from "@/services/auth.service";

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

    const handleLogout = () => {
        clearAdminTokens();

        router.replace("/admin/login");
    };

    return (
        <Sidebar
            side="right"
            collapsible="icon"
            className="border-l border-border"
        >
            <SidebarHeader className="border-b border-border">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            size="lg"
                            asChild
                            tooltip="Watch Store"
                        >
                            <Link href="/admin">
                                <div className="flex size-8 items-center justify-center border border-border">
                                    <PackageSearch className="size-4" />
                                </div>

                                <div className="grid flex-1 text-right text-sm leading-tight">
                                    <span className="truncate font-medium">
                                        Watch Store
                                    </span>

                                    <span className="truncate text-xs text-muted-foreground">
                                        پنل مدیریت
                                    </span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
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

            <SidebarFooter className="border-t border-border">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            tooltip="خروج از حساب"
                            onClick={handleLogout}
                        >
                            <LogOut />
                            <span>خروج از حساب</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
}