import type { CartItem } from "@/features/cart/cart.types";

export const CART_STORAGE_KEY =
    "watch-store-cart-v1";

/*
 * هدف:
 * اعتبارسنجی کامل Cart Itemهایی که از localStorage خوانده می‌شوند.
 *
 * محل استفاده:
 * داخل loadCartItems قبل از Hydrate شدن Cart در Redux.
 *
 * نحوه کار:
 * چون localStorage قابل دستکاری است، فقط بررسی Type کافی نیست.
 * این تابع علاوه بر Type، معتبر بودن شناسه‌ها، قیمت، تعداد، موجودی و زمان انقضا را نیز بررسی می‌کند.
 * هر Item نامعتبر قبل از ورود به Redux حذف می‌شود.
 */
function isCartItem(value: unknown): value is CartItem {
    if (typeof value !== "object" || value === null) {
        return false;
    }

    const item = value as Partial<CartItem>;

    /*
     * هدف:
     * بررسی اعتبار شناسه Product و Variant.
     *
     * محل استفاده:
     * در اعتبارسنجی Cart Item ذخیره‌شده در localStorage.
     *
     * نحوه کار:
     * productId باید عدد صحیح مثبت و variantId باید رشته غیرخالی باشد.
     */
    if (!Number.isInteger(item.productId) || Number(item.productId) <= 0 || typeof item.variantId !== "string" || item.variantId.trim() === "") {
        return false;
    }

    /*
     * هدف:
     * جلوگیری از ورود lineId جعلی یا ناسازگار با Product و Variant.
     *
     * محل استفاده:
     * هنگام Load شدن Cart از localStorage.
     *
     * نحوه کار:
     * lineId باید دقیقاً از ترکیب productId و variantId ساخته شده باشد.
     */
    const expectedLineId = `${item.productId}:${item.variantId}`;

    if (typeof item.lineId !== "string" || item.lineId !== expectedLineId) {
        return false;
    }

    /*
     * هدف:
     * بررسی اطلاعات متنی موردنیاز برای نمایش Cart Item.
     *
     * محل استفاده:
     * قبل از Hydrate شدن Item در Redux.
     *
     * نحوه کار:
     * نام، تصویر، نام رنگ و کد رنگ باید از نوع string باشند و نام محصول و رنگ خالی نباشند.
     */
    if (typeof item.name !== "string" || item.name.trim() === "" || typeof item.thumbnail !== "string" || typeof item.colorName !== "string" || item.colorName.trim() === "" || typeof item.colorHex !== "string") {
        return false;
    }

    /*
     * هدف:
     * جلوگیری از ورود قیمت منفی، NaN یا Infinity از localStorage.
     *
     * محل استفاده:
     * هنگام اعتبارسنجی Cart Item قبل از ورود به Redux.
     *
     * نحوه کار:
     * unitPrice باید یک عدد finite و صفر یا بزرگ‌تر باشد.
     */
    if (typeof item.unitPrice !== "number" || !Number.isFinite(item.unitPrice) || item.unitPrice < 0) {
        return false;
    }

    /*
     * هدف:
     * جلوگیری از ورود quantity یا maxQuantity اعشاری، صفر، منفی یا نامعتبر.
     *
     * محل استفاده:
     * هنگام Load شدن Cart از localStorage.
     *
     * نحوه کار:
     * هر دو مقدار باید عدد صحیح مثبت باشند و quantity نباید از maxQuantity بیشتر باشد.
     */
    if (!Number.isInteger(item.quantity) || !Number.isInteger(item.maxQuantity) || Number(item.quantity) <= 0 || Number(item.maxQuantity) <= 0 || Number(item.quantity) > Number(item.maxQuantity)) {
        return false;
    }

    /*
     * هدف:
     * بررسی معتبر بودن زمان ایجاد و انقضای Cart Item.
     *
     * محل استفاده:
     * قبل از اعمال Expiration در loadCartItems.
     *
     * نحوه کار:
     * هر دو زمان باید عدد finite مثبت باشند و expiresAt باید بعد از addedAt قرار داشته باشد.
     */
    if (typeof item.addedAt !== "number" || typeof item.expiresAt !== "number" || !Number.isFinite(item.addedAt) || !Number.isFinite(item.expiresAt) || item.addedAt <= 0 || item.expiresAt <= item.addedAt) {
        return false;
    }

    return true;
}

/*
 * هدف:
 * جلوگیری از ورود چند Cart Item با lineId یکسان به Redux.
 *
 * محل استفاده:
 * داخل loadCartItems بعد از اعتبارسنجی و حذف Itemهای منقضی‌شده.
 *
 * نحوه کار:
 * هر lineId فقط یک بار در Map نگهداری می‌شود.
 * اگر چند Item با یک lineId وجود داشته باشند، جدیدترین Item بر اساس addedAt نگه داشته می‌شود
 * و نسخه قدیمی‌تر یا تکراری حذف می‌شود.
 */
function removeDuplicateCartItems(items: CartItem[]): CartItem[] {
    const uniqueItems = new Map<string, CartItem>();

    for (const item of items) {
        const existingItem = uniqueItems.get(item.lineId);

        if (!existingItem || item.addedAt >= existingItem.addedAt) {
            uniqueItems.set(item.lineId, item);
        }
    }

    return Array.from(uniqueItems.values());
}

export function loadCartItems(): CartItem[] {
    /*
     * هدف:
     * جلوگیری از دسترسی به window و localStorage هنگام Render سمت Server.
     *
     * محل استفاده:
     * ابتدای loadCartItems قبل از هرگونه دسترسی به Browser Storage.
     *
     * نحوه کار:
     * اگر کد در محیط Server اجرا شود، window وجود ندارد و تابع بدون خطا
     * یک Cart خالی برمی‌گرداند. خواندن واقعی Cart فقط داخل Browser انجام می‌شود.
     */
    if (typeof window === "undefined") {
        return [];
    }

    try {
        const rawCart =
            window.localStorage.getItem(
                CART_STORAGE_KEY,
            );

        if (!rawCart) {
            return [];
        }

        const parsed: unknown =
            JSON.parse(rawCart);

        if (!Array.isArray(parsed)) {
            window.localStorage.removeItem(
                CART_STORAGE_KEY,
            );

            return [];
        }

        const now = Date.now();
        /*
         * هدف:
         * آماده‌سازی Cart سالم و بدون Item تکراری قبل از Hydrate شدن Redux.
         *
         * محل استفاده:
         * خروجی نهایی loadCartItems.
         *
         * نحوه کار:
         * ابتدا Itemهای نامعتبر و منقضی‌شده حذف می‌شوند،
         * سپس removeDuplicateCartItems تضمین می‌کند هر lineId فقط یک بار در Cart وجود داشته باشد.
         */
        const validItems = parsed.filter(isCartItem).filter((item) => item.expiresAt > now);

        return removeDuplicateCartItems(validItems);

    } catch {
        /*
         * هدف:
         * پاک‌کردن Cart خراب یا غیرقابل‌خواندن از localStorage.
         *
         * محل استفاده:
         * زمانی که JSON.parse یا خواندن Storage با خطا مواجه شود.
         *
         * نحوه کار:
         * چون در ابتدای تابع وجود window بررسی شده، در این نقطه با اطمینان
         * می‌توان Storage خراب را حذف کرد و یک Cart خالی برگرداند.
         */
        window.localStorage.removeItem(CART_STORAGE_KEY);

        return [];
    }
}

export function saveCartItems(items: CartItem[]) {
    /*
     * هدف:
     * جلوگیری از تلاش برای ذخیره Cart در localStorage هنگام اجرای سمت Server.
     *
     * محل استفاده:
     * ابتدای saveCartItems قبل از هرگونه دسترسی به Browser Storage.
     *
     * نحوه کار:
     * اگر window وجود نداشته باشد، تابع بدون انجام هیچ عملی متوقف می‌شود.
     * ذخیره‌سازی Cart فقط داخل Browser انجام خواهد شد.
     */
    if (typeof window === "undefined") {
        return;
    }

    try {
        if (items.length === 0) {
            window.localStorage.removeItem(
                CART_STORAGE_KEY,
            );

            return;
        }

        window.localStorage.setItem(
            CART_STORAGE_KEY,
            JSON.stringify(items),
        );
    } catch {
        /*
         * اگر Storage در مرورگر در دسترس نبود،
         * Cart داخل Redux همچنان کار می‌کند.
         */
    }
}