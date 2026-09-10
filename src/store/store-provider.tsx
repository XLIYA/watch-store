"use client";

import {
    useEffect,
    useState,
} from "react";

import { Provider } from "react-redux";

import {
    hydrateCart,
    removeExpiredItems,
} from "@/features/cart/cart.slice";

import {
    loadCartItems,
    saveCartItems,
} from "@/features/cart/cart.storage";

import {
    makeStore,
    type AppStore,
} from "@/store/store";

interface StoreProviderProps {
    children: React.ReactNode;
}

export function StoreProvider({
    children,
}: StoreProviderProps) {
    const [store] = useState<AppStore>(
        () => makeStore(),
    );

    useEffect(() => {
        /*
         * localStorage فقط در Client خوانده می‌شود
         * تا SSR/Hydration به مشکل نخورد.
         */
        const storedItems =
            loadCartItems();

        store.dispatch(
            hydrateCart(storedItems),
        );

        /*
         * اگر آیتم منقضی در Storage بوده،
         * نسخه پاک‌سازی‌شده را ذخیره می‌کنیم.
         */
        saveCartItems(
            store.getState().cart.items,
        );

        /*
         * بعد از Hydrate، هر تغییر Redux
         * در localStorage ذخیره می‌شود.
         */
        const unsubscribe =
            store.subscribe(() => {
                const items =
                    store.getState().cart.items;

                saveCartItems(items);
            });

        /*
         * اگر صفحه برای مدت طولانی باز بماند،
         * آیتم‌های منقضی را هر یک دقیقه
         * پاک می‌کنیم.
         */
        const expirationInterval =
            window.setInterval(() => {
                store.dispatch(
                    removeExpiredItems(
                        Date.now(),
                    ),
                );
            }, 60_000);

        return () => {
            unsubscribe();

            window.clearInterval(
                expirationInterval,
            );
        };
    }, [store]);

    return (
        <Provider store={store}>
            {children}
        </Provider>
    );
}