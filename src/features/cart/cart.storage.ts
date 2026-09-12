import type { CartItem } from "@/features/cart/cart.types";

export const CART_STORAGE_KEY =
    "watch-store-cart-v1";

function isCartItem(
    value: unknown,
): value is CartItem {
    if (
        typeof value !== "object" ||
        value === null
    ) {
        return false;
    }

    const item =
        value as Partial<CartItem>;

    return (
        typeof item.lineId === "string" &&
        typeof item.productId === "number" &&
        typeof item.variantId === "string" &&
        typeof item.name === "string" &&
        typeof item.thumbnail === "string" &&
        typeof item.colorName === "string" &&
        typeof item.colorHex === "string" &&
        typeof item.unitPrice === "number" &&
        typeof item.quantity === "number" &&
        typeof item.maxQuantity === "number" &&
        typeof item.addedAt === "number" &&
        typeof item.expiresAt === "number"
    );
}

export function loadCartItems(): CartItem[] {
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

        return parsed
            .filter(isCartItem)
            .filter(
                (item) =>
                    item.expiresAt > now &&
                    item.quantity > 0 &&
                    item.maxQuantity > 0,
            )
            .map((item) => ({
                ...item,

                quantity: Math.min(
                    item.quantity,
                    item.maxQuantity,
                ),
            }));
    } catch {
        window.localStorage.removeItem(
            CART_STORAGE_KEY,
        );

        return [];
    }
}

export function saveCartItems(
    items: CartItem[],
) {
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