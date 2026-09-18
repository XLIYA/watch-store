import {
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";

import type {
  CartItem,
  CartState,
} from "@/features/cart/cart.types";

interface AddCartItemPayload {
  productId: number;
  variantId: string;

  name: string;
  thumbnail: string;

  colorName: string;
  colorHex: string;

  unitPrice: number;

  quantity: number;
  maxQuantity: number;
}

interface SetItemQuantityPayload {
  lineId: string;
  quantity: number;
}

interface UpdateItemStockPayload {
  lineId: string;
  maxQuantity: number;
}

/*
 * هدف:
 * تعریف اطلاعات موردنیاز برای به‌روزرسانی قیمت یک Cart Item.
 *
 * محل استفاده:
 * در reducer مربوط به updateItemPrice و هنگام Sync شدن قیمت Checkout با Backend.
 *
 * نحوه کار:
 * lineId آیتم موردنظر را مشخص می‌کند و unitPrice قیمت معتبر جدید Backend است.
 */
interface UpdateItemPricePayload {
  lineId: string;
  unitPrice: number;
}

const initialState: CartState = {
  items: [],
};

const CART_EXPIRATION_TIME =
  24 * 60 * 60 * 1000;

const cartSlice = createSlice({
  name: "cart",

  initialState,

  reducers: {
    addItem: (
      state,
      action: PayloadAction<AddCartItemPayload>,
    ) => {
      const payload = action.payload;
      /*
       * هدف:
       * جلوگیری از ورود quantity و maxQuantity نامعتبر به Cart State.
       *
       * محل استفاده:
       * ابتدای reducer مربوط به addItem، قبل از پیدا کردن Cart Item موجود.
       *
       * نحوه کار:
       * ابتدا مقادیر اصلی payload بررسی می‌شوند تا NaN یا Infinity نباشند،
       * سپس به عدد صحیح تبدیل می‌شوند تا quantity اعشاری وارد Redux نشود.
       */
      if (!Number.isFinite(payload.quantity) || !Number.isFinite(payload.maxQuantity)) {
        return;
      }

      const normalizedQuantity = Math.floor(payload.quantity);
      const normalizedMaxQuantity = Math.floor(payload.maxQuantity);

      /*
       * هدف:
       * جلوگیری از اضافه‌شدن آیتم بدون تعداد یا موجودی معتبر.
       *
       * محل استفاده:
       * بعد از نرمال‌سازی quantity و maxQuantity داخل addItem.
       *
       * نحوه کار:
       * اگر مقدار نهایی quantity یا maxQuantity صفر یا منفی باشد،
       * هیچ تغییری در Cart State ایجاد نمی‌شود.
       */
      if (normalizedQuantity <= 0 || normalizedMaxQuantity <= 0) {
        return;
      }

      const lineId = `${payload.productId}:${payload.variantId}`;

      const existingItem =
        state.items.find(
          (item) =>
            item.lineId === lineId,
        );

      const now = Date.now();

      if (existingItem) {
        /*
         * هدف:
         * به‌روزرسانی اطلاعات نمایشی و قیمتی Cart Item با آخرین اطلاعات Product.
         *
         * محل استفاده:
         * زمانی که همان Product + Variant قبلاً داخل Cart وجود دارد
         * و کاربر دوباره آن را از ProductPurchasePanel به سبد اضافه می‌کند.
         *
         * نحوه کار:
         * اطلاعات جدیدی که ProductPurchasePanel در payload ارسال کرده
         * جایگزین Snapshot قدیمی Cart می‌شوند تا نام، تصویر، رنگ و قیمت قدیمی باقی نمانند.
         */
        existingItem.name = payload.name;
        existingItem.thumbnail = payload.thumbnail;
        existingItem.colorName = payload.colorName;
        existingItem.colorHex = payload.colorHex;
        existingItem.unitPrice = payload.unitPrice;

        /*
         * هدف:
         * همگام‌سازی سقف موجودی Variant داخل Cart با آخرین موجودی Product.
         *
         * محل استفاده:
         * در کنترل Quantity همین Cart Item.
         *
         * نحوه کار:
         * maxQuantity جدید جای مقدار قبلی قرار می‌گیرد و تعداد نهایی
         * هیچ‌وقت بیشتر از این سقف نمی‌شود.
         */
        existingItem.maxQuantity = normalizedMaxQuantity;

        existingItem.quantity = Math.min(
          existingItem.quantity + normalizedQuantity,
          normalizedMaxQuantity,
        );

        /*
         * هدف:
         * تمدید عمر Cart Item بعد از افزودن مجدد همان Variant.
         *
         * محل استفاده:
         * در سیستم Expiration بیست‌وچهارساعته Cart.
         *
         * نحوه کار:
         * زمان افزودن و زمان انقضا از لحظه آخرین Add To Cart دوباره محاسبه می‌شوند.
         */
        existingItem.addedAt = now;
        existingItem.expiresAt = now + CART_EXPIRATION_TIME;

        return;
      }

      const newItem: CartItem = {
        lineId,

        productId:
          payload.productId,

        variantId:
          payload.variantId,

        name:
          payload.name,

        thumbnail:
          payload.thumbnail,

        colorName:
          payload.colorName,

        colorHex:
          payload.colorHex,

        unitPrice:
          payload.unitPrice,

        quantity: Math.min(normalizedQuantity, normalizedMaxQuantity),

        maxQuantity: normalizedMaxQuantity,

        addedAt: now,

        expiresAt:
          now + CART_EXPIRATION_TIME,
      };

      state.items.push(newItem);
    },

    setItemQuantity: (
      state,
      action: PayloadAction<SetItemQuantityPayload>,
    ) => {
      const item =
        state.items.find(
          (cartItem) =>
            cartItem.lineId ===
            action.payload.lineId,
        );

      if (!item) {
        return;
      }

      /*
       * هدف:
       * جلوگیری از ثبت quantity اعشاری یا مقدار غیرعددی هنگام تغییر تعداد Cart Item.
       *
       * محل استفاده:
       * داخل setItemQuantity زمانی که کاربر تعداد را در Cart کم یا زیاد می‌کند.
       *
       * نحوه کار:
       * ابتدا مقدار ورودی از نظر finite بودن بررسی می‌شود و سپس با Math.floor
       * به عدد صحیح تبدیل می‌شود تا Redux همیشه quantity معتبر نگه دارد.
       */
      if (!Number.isFinite(action.payload.quantity)) {
        return;
      }

      const requestedQuantity = Math.floor(action.payload.quantity);

      /*
       * هدف:
       * جلوگیری از ثبت quantity صفر یا منفی در Cart.
       *
       * محل استفاده:
       * بعد از نرمال‌سازی مقدار داخل setItemQuantity.
       *
       * نحوه کار:
       * اگر مقدار نهایی کمتر یا مساوی صفر باشد، State تغییر نمی‌کند.
       * حذف کامل Item همچنان فقط از طریق removeItem انجام می‌شود.
       */
      if (requestedQuantity <= 0) {
        return;
      }

      item.quantity = Math.min(requestedQuantity, item.maxQuantity);
    },

    removeItem: (
      state,
      action: PayloadAction<string>,
    ) => {
      state.items =
        state.items.filter(
          (item) =>
            item.lineId !==
            action.payload,
        );
    },

    clearCart: (state) => {
      state.items = [];
    },

    updateItemStock: (state, action: PayloadAction<UpdateItemStockPayload>) => {
      /*
      * هدف:
      * جلوگیری از ورود موجودی اعشاری، NaN یا Infinity به Cart State.
      *
      * محل استفاده:
      * ابتدای updateItemStock هنگام Sync شدن موجودی جدید Backend با Cart.
      *
      * نحوه کار:
      * مقدار ابتدا از نظر finite بودن بررسی می‌شود و سپس به عدد صحیح غیرمنفی تبدیل می‌شود.
      */
      if (!Number.isFinite(action.payload.maxQuantity)) {
        return;
      }

      const newMaxQuantity = Math.max(0, Math.floor(action.payload.maxQuantity));

      /*
       * هدف:
       * جلوگیری از باقی‌ماندن Cart Item با quantity و maxQuantity برابر صفر.
       *
       * محل استفاده:
       * زمانی که موجودی یک Variant بعد از اضافه‌شدن به Cart به صفر می‌رسد.
       *
       * نحوه کار:
       * اگر موجودی جدید صفر باشد، کل Cart Item با همان lineId حذف می‌شود.
       */
      if (newMaxQuantity === 0) {
        state.items = state.items.filter((item) => item.lineId !== action.payload.lineId);
        return;
      }

      /*
       * هدف:
       * پیدا کردن Cart Item موردنظر برای به‌روزرسانی موجودی.
       *
       * محل استفاده:
       * بعد از اطمینان از اینکه موجودی جدید بیشتر از صفر است.
       *
       * نحوه کار:
       * Cart Item با lineId یکتا پیدا می‌شود تا maxQuantity و در صورت نیاز quantity اصلاح شوند.
       */
      const item = state.items.find((cartItem) => cartItem.lineId === action.payload.lineId);

      if (!item) {
        return;
      }

      item.maxQuantity = newMaxQuantity;

      /*
       * هدف:
       * جلوگیری از بیشتر بودن quantity فعلی Cart نسبت به موجودی جدید Backend.
       *
       * محل استفاده:
       * زمانی که موجودی کاهش پیدا کرده ولی هنوز صفر نشده است.
       *
       * نحوه کار:
       * اگر تعداد فعلی Cart از maxQuantity جدید بیشتر باشد، quantity تا سقف موجودی جدید کاهش پیدا می‌کند.
       */
      if (item.quantity > newMaxQuantity) {
        item.quantity = newMaxQuantity;
      }
    },

    /*
    * هدف:
    * همگام‌سازی قیمت ذخیره‌شده در Cart با آخرین قیمت معتبر Backend.
    *
    * محل استفاده:
    * زمانی که validateCheckoutStock تشخیص می‌دهد قیمت محصول از زمان Add To Cart تغییر کرده است.
    *
    * نحوه کار:
    * ابتدا قیمت جدید اعتبارسنجی می‌شود؛ سپس Cart Item با lineId پیدا شده
    * و فقط unitPrice آن با قیمت جدید جایگزین می‌شود.
    */
    updateItemPrice: (state, action: PayloadAction<UpdateItemPricePayload>) => {
      if (!Number.isFinite(action.payload.unitPrice)) {
        return;
      }

      const normalizedUnitPrice = Math.floor(action.payload.unitPrice);

      if (normalizedUnitPrice < 0) {
        return;
      }

      const item = state.items.find((cartItem) => cartItem.lineId === action.payload.lineId);

      if (!item) {
        return;
      }

      item.unitPrice = normalizedUnitPrice;
    },

    hydrateCart: (
      state,
      action: PayloadAction<CartItem[]>,
    ) => {
      state.items =
        action.payload;
    },

    removeExpiredItems: (
      state,
      action: PayloadAction<number>,
    ) => {
      const now =
        action.payload;

      state.items =
        state.items.filter(
          (item) =>
            item.expiresAt > now,
        );
    },
  },
});

export const {
  addItem,
  setItemQuantity,
  removeItem,
  clearCart,
  updateItemStock,
  updateItemPrice,
  hydrateCart,
  removeExpiredItems,
} = cartSlice.actions;

export default cartSlice.reducer;