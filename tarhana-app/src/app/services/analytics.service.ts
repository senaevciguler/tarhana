import { Injectable } from '@angular/core';
import { ShopifyProduct, CartItem } from './shopify.types';

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  constructor() {}

  private getGtag(): (...args: any[]) => void {
    if (typeof window !== 'undefined' && window.gtag) {
      return window.gtag;
    }
    // Return a fallback logger in non-browser environments or if gtag isn't loaded
    return (...args: any[]) => {
      console.log('[GA4 Mock Event]', ...args);
    };
  }

  trackViewItem(product: ShopifyProduct, quantity: number = 1) {
    const value = product.price * quantity;
    const gtagFn = this.getGtag();
    gtagFn('event', 'view_item', {
      currency: product.currency || 'SEK',
      value: value,
      items: [
        {
          item_id: product.variantId || product.id,
          item_name: product.title,
          price: product.price,
          quantity: quantity,
          item_variant: product.variantLabel || undefined
        }
      ]
    });
  }

  trackAddToCart(product: ShopifyProduct, quantity: number = 1) {
    const value = product.price * quantity;
    const gtagFn = this.getGtag();
    gtagFn('event', 'add_to_cart', {
      currency: product.currency || 'SEK',
      value: value,
      items: [
        {
          item_id: product.variantId || product.id,
          item_name: product.title,
          price: product.price,
          quantity: quantity,
          item_variant: product.variantLabel || undefined
        }
      ]
    });
  }

  trackBeginCheckout(items: CartItem[], value: number, currency: string) {
    const gtagFn = this.getGtag();
    gtagFn('event', 'begin_checkout', {
      currency: currency || 'SEK',
      value: value,
      items: items.map(item => ({
        item_id: item.variantId || item.productId,
        item_name: item.title,
        price: item.price,
        quantity: item.quantity,
        item_variant: item.variantLabel || undefined
      }))
    });
  }

  trackPurchase(items: CartItem[], value: number, currency: string, transactionId: string) {
    const gtagFn = this.getGtag();
    gtagFn('event', 'purchase', {
      transaction_id: transactionId,
      currency: currency || 'SEK',
      value: value,
      items: items.map(item => ({
        item_id: item.variantId || item.productId,
        item_name: item.title,
        price: item.price,
        quantity: item.quantity,
        item_variant: item.variantLabel || undefined
      }))
    });
  }
}
