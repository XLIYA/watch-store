"use client";

import { useSyncExternalStore } from "react";

const emptySubscribe = () => {
    return () => { };
};

export function useHydrated() {
    return useSyncExternalStore(
        emptySubscribe,
        () => true,
        () => false,
    );
}