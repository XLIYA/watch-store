"use client";

import { useState } from "react";

import {
    QueryClientProvider,
} from "@tanstack/react-query";

import {
    createQueryClient,
} from "@/lib/react-query/query-client";

interface QueryProviderProps {
    children: React.ReactNode;
}

/*
 * هدف:
 * در دسترس قرار دادن React Query برای تمام Client Componentهای پروژه.
 *
 * محل استفاده:
 * در RootLayout و در کنار StoreProvider مربوط به Redux.
 *
 * نحوه کار:
 * QueryClient فقط یک بار برای عمر این Provider ساخته می‌شود
 * و QueryClientProvider آن را در اختیار تمام فرزندان قرار می‌دهد.
 */
export function QueryProvider({
    children,
}: QueryProviderProps) {
    const [queryClient] = useState(
        () => createQueryClient(),
    );

    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
}