export interface ProductVariant {
  id: string;
  name: string;
  hex: string;
  quantity: number;
}

export interface Product {
  id: number;

  name: string;
  slug: string;
  brand: string;

  category: number;
  subcategory: number;

  thumbnail: string;
  images: string[];

  description: string;

  price: number;
  quantity: number;

  variants: ProductVariant[];

  soldCount: number;

  isHero: boolean;
  heroOrder: number | null;

  createdAt: number;
}