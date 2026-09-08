export interface CartItem {
  lineId: string;

  productId: number;
  variantId: string;

  name: string;
  thumbnail: string;

  colorName: string;
  colorHex: string;

  unitPrice: number;

  quantity: number;
  maxQuantity: number;

  addedAt: number;
  expiresAt: number;
}

export interface CartState {
  items: CartItem[];
}