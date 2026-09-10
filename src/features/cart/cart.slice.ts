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

      if (
        payload.quantity <= 0 ||
        payload.maxQuantity <= 0
      ) {
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
        existingItem.maxQuantity =
          payload.maxQuantity;

        existingItem.quantity =
          Math.min(
            existingItem.quantity +
            payload.quantity,
            payload.maxQuantity,
          );

        /*
         * افزودن مجدد همان Variant
         * عمر Cart Item را دوباره
         * ۲۴ ساعت می‌کند.
         */
        existingItem.addedAt = now;

        existingItem.expiresAt =
          now + CART_EXPIRATION_TIME;

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

        quantity: Math.min(
          payload.quantity,
          payload.maxQuantity,
        ),

        maxQuantity:
          payload.maxQuantity,

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

      const requestedQuantity =
        action.payload.quantity;

      if (requestedQuantity <= 0) {
        return;
      }

      item.quantity = Math.min(
        requestedQuantity,
        item.maxQuantity,
      );
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

    updateItemStock: (
      state,
      action: PayloadAction<UpdateItemStockPayload>,
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

      const newMaxQuantity =
        Math.max(
          0,
          action.payload.maxQuantity,
        );

      item.maxQuantity =
        newMaxQuantity;

      /*
       * اگر موجودی جدید کمتر از تعداد
       * فعلی سبد باشد، مقدار Cart نیز
       * اصلاح می‌شود.
       */
      if (
        item.quantity >
        newMaxQuantity
      ) {
        item.quantity =
          newMaxQuantity;
      }
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
  hydrateCart,
  removeExpiredItems,
} = cartSlice.actions;

export default cartSlice.reducer;