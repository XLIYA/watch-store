export interface Category {
  id: number;

  name: string;
  slug: string;

  icon: string;
  coverImage: string;

  featured: boolean;
  homeOrder: number;

  landingEnabled: boolean;
  landingOrder: number;
}

export interface Subcategory {
  id: number;

  name: string;
  slug: string;

  category: number;
}