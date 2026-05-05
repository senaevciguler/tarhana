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
  id: string; // Internal unique ID
  shopifyLineId?: string; // Shopify cart line ID
  productId: string;
  variantId: string;
  title: string;
  variantLabel: string;
  price: number;
  currency: string;
  image: string;
  quantity: number;
}

export interface ShopifyCart {
  id: string;
  checkoutUrl: string;
  lines: {
    id: string;
    quantity: number;
    merchandise: {
      id: string;
      title: string;
      product: {
        title: string;
      }
    }
  }[];
  cost: {
    totalAmount: {
      amount: string;
      currencyCode: string;
    };
    subtotalAmount: {
      amount: string;
      currencyCode: string;
    };
  };
}
