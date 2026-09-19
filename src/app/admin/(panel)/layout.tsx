"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar";

import { AdminSidebar } from "@/app/admin/(panel)/_components/admin-sidebar";
import { useHydrated } from "@/hooks/use-hydrated";
import { hasAdminSession } from "@/services/auth.service";

export default function AdminPanelLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const isHydrated = useHydrated();

    const hasSession =
        isHydrated && hasAdminSession();

    useEffect(() => {
        if (
            isHydrated &&
            !hasSession
        ) {
            router.replace("/admin/login");
        }
    }, [
        isHydrated,
        hasSession,
        router,
    ]);

    if (
        !isHydrated ||
        !hasSession
    ) {
        return null;
    }

    return (
        <SidebarProvider>
            <AdminSidebar />

            <SidebarInset>
                <header className="flex h-16 items-center gap-3 border-b border-border px-4 lg:px-6">
                    <SidebarTrigger />

                    <div className="h-5 w-px bg-border" />

                    <p className="text-sm text-muted-foreground">
                        پنل مدیریت فروشگاه
                    </p>
                </header>

                <main className="flex-1 p-4 md:p-6 lg:p-8">
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}