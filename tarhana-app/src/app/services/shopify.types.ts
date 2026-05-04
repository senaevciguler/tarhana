export interface ShopifyProduct {
  id: string;
  handle: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  image: string;
  variantId: string;
  tags: string[];
  weight: string;
  variantLabel: string;
}

export interface CartItem {
  id: string;
  productId: string;
  variantId: string;
  title: string;
  variantLabel: string;
  price: number;
  currency: string;
  image: string;
  quantity: number;
}
