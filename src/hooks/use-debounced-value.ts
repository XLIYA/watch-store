import {
    useEffect,
    useState,
} from "react";

/*
 * هدف:
 * ایجاد مقدار Debounce شده برای جلوگیری از اجرای عملیات
 * در هر بار فشردن کلید توسط کاربر.
 *
 * محل استفاده:
 * Search صفحات Admin Products و Admin Inventory
 * و هر Search مشابه دیگری در پروژه.
 *
 * نحوه کار:
 * هر بار value تغییر می‌کند Timer قبلی لغو می‌شود.
 * فقط اگر کاربر به مدت delay تایپ نکند، مقدار جدید
 * داخل debouncedValue قرار می‌گیرد.
 */
export function useDebouncedValue<T>(
    value: T,
    delay = 400,
) {
    const [
        debouncedValue,
        setDebouncedValue,
    ] = useState(value);

    useEffect(() => {
        const timeoutId =
            window.setTimeout(() => {
                setDebouncedValue(
                    value,
                );
            }, delay);

        return () => {
            window.clearTimeout(
                timeoutId,
            );
        };
    }, [
        value,
        delay,
    ]);

    return debouncedValue;
}