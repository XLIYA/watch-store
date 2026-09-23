import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "@/store/store";

const selectCartItems = (state: RootState) => state.cart.items;
// همهٔ نمایش‌های سبد از یک محاسبه استفاده می‌کنند؛ فقط با تغییر items دوباره محاسبه می‌شود.
export const selectCartTotals = createSelector([selectCartItems], (items) =>
  items.reduce(
    (totals, item) => ({
      totalQuantity: totals.totalQuantity + item.quantity,
      totalPrice: totals.totalPrice + item.unitPrice * item.quantity,
    }),
    { totalQuantity: 0, totalPrice: 0 },
  ),
);
