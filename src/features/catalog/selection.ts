"use client";

import { useMemo, useSyncExternalStore } from "react";
import { toast } from "sonner";

export type SelectionKind = "favorites" | "compare";
export const selectionLimits = { favorites: 100, compare: 3 } as const;
const eventName = "watch-selection-change";
const storageKey = (kind: SelectionKind) => `watch-store:${kind}:v1`;
const memory: Partial<Record<SelectionKind, string>> = {};

/** فقط شناسه ذخیره می‌شود؛ صفحات انتخاب، قیمت و موجودی تازه را دوباره از API می‌گیرند. */
export function parseSelection(raw: string, kind: SelectionKind): number[] {
  try {
    const value: unknown = JSON.parse(raw);
    return Array.isArray(value)
      ? [
          ...new Set(
            value.filter(
              (id): id is number => Number.isSafeInteger(id) && id > 0,
            ),
          ),
        ].slice(0, selectionLimits[kind])
      : [];
  } catch {
    return [];
  }
}

/** snapshot رشته‌ای ثابت است؛ SSR خالی و رویداد storage هماهنگی بین تب‌ها را تضمین می‌کند. */
function read(kind: SelectionKind) {
  try {
    return memory[kind] ?? localStorage.getItem(storageKey(kind)) ?? "[]";
  } catch {
    return memory[kind] ?? "[]";
  }
}
function subscribe(callback: () => void) {
  window.addEventListener(eventName, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(eventName, callback);
    window.removeEventListener("storage", callback);
  };
}

/** کارت، صفحهٔ محصول و فهرست ذخیره‌شده از همین عملیات استفاده می‌کنند تا منطق انتخاب تکرار نشود. */
export function useProductSelection(kind: SelectionKind) {
  const raw = useSyncExternalStore(
    subscribe,
    () => read(kind),
    () => "[]",
  );
  const ids = useMemo(() => parseSelection(raw, kind), [raw, kind]);
  function write(next: number[]) {
    const value = JSON.stringify(next);
    try {
      localStorage.setItem(storageKey(kind), value);
      delete memory[kind];
    } catch {
      memory[kind] = value;
      toast.info(
        "انتخاب‌ها در این بازدید حفظ می‌شوند؛ ذخیره‌سازی مرورگر در دسترس نیست.",
      );
    }
    window.dispatchEvent(new Event(eventName));
  }
  function toggle(id: number) {
    const current = parseSelection(read(kind), kind);
    if (current.includes(id)) {
      write(current.filter((value) => value !== id));
      return;
    }
    if (current.length >= selectionLimits[kind]) {
      toast.info(
        kind === "compare"
          ? "برای مقایسهٔ مدل جدید، یکی از سه ساعت انتخاب‌شده را حذف کنید."
          : "فهرست علاقه‌مندی‌ها پر است.",
      );
      return;
    }
    write([...current, id]);
    toast.success(
      kind === "compare" ? "به مقایسه اضافه شد." : "در علاقه‌مندی‌ها ذخیره شد.",
    );
  }
  return {
    ids,
    toggle,
    remove: (id: number) =>
      write(parseSelection(read(kind), kind).filter((value) => value !== id)),
  };
}
