"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

import { AdminSidebar } from "@/app/admin/(panel)/_components/admin-sidebar";
import { useAdminSession } from "@/features/auth/use-admin-session";
import { getApiErrorMessage } from "@/services/api/api-error";
import { Button } from "@/components/ui/button";

export default function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const {
    data: session,
    isPending,
    isError,
    error,
    refetch,
  } = useAdminSession();
  const hasSession = session?.user.role === "admin";

  useEffect(() => {
    if (!isPending && !isError && !hasSession) {
      router.replace("/admin/login");
    }
  }, [isPending, isError, hasSession, router]);

  // قطع شبکه با خروج از حساب فرق دارد؛ فرصت retry می‌دهیم و cookie را حذف نمی‌کنیم.
  if (isError)
    return (
      <main className="p-8 text-center" role="alert">
        <p>{getApiErrorMessage(error)}</p>
        <Button className="mt-4" onClick={() => void refetch()}>
          تلاش دوباره
        </Button>
      </main>
    );
  if (isPending || !hasSession)
    return (
      <main className="p-8 text-center" role="status">
        در حال بررسی نشست مدیریت...
      </main>
    );

  return (
    <SidebarProvider dir="rtl" className="admin-shell">
      <AdminSidebar userName={session.user.name} />

      <SidebarInset>
        <header className="sticky top-0 z-20 flex h-20 items-center gap-3 border-b border-border bg-card/95 px-4 backdrop-blur lg:px-8">
          <SidebarTrigger />

          <div className="h-5 w-px bg-border" />

          <p className="text-sm text-muted-foreground">پنل مدیریت فروشگاه</p>
        </header>

        <main className="admin-content mx-auto w-full max-w-screen-2xl flex-1 p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
