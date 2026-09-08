import { createSlice } from "@reduxjs/toolkit";

import type { CartState } from "./cart.types";

const initialState: CartState = {
  items: [],
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {},
});

export default cartSlice.reducer;