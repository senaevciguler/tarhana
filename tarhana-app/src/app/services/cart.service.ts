import { Injectable, signal, computed, effect } from '@angular/core';
import { CartItem, ShopifyProduct } from './shopify.types';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private cartItems = signal<CartItem[]>([]);
  private isDrawerOpen = signal<boolean>(false);

  constructor() {
    // Load cart from localStorage if available
    const savedCart = localStorage.getItem('ella_pantry_cart');
    if (savedCart) {
      try {
        this.cartItems.set(JSON.parse(savedCart));
      } catch (e) {
        console.error('Failed to parse saved cart', e);
      }
    }

    // Persist cart changes
    effect(() => {
      localStorage.setItem('ella_pantry_cart', JSON.stringify(this.cartItems()));
    });
  }

  items = this.cartItems.asReadonly();
  isOpen = this.isDrawerOpen.asReadonly();

  itemCount = computed(() =>
    this.cartItems().reduce((count, item) => count + item.quantity, 0)
  );

  subtotal = computed(() =>
    this.cartItems().reduce((total, item) => total + (item.price * item.quantity), 0)
  );

  openDrawer() {
    this.isDrawerOpen.set(true);
  }

  closeDrawer() {
    this.isDrawerOpen.set(false);
  }

  toggleDrawer() {
    this.isDrawerOpen.update(open => !open);
  }

  addItem(product: ShopifyProduct) {
    this.cartItems.update(items => {
      const existingItem = items.find(item => item.variantId === product.variantId);

      if (existingItem) {
        return items.map(item =>
          item.variantId === product.variantId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      const newItem: CartItem = {
        id: Math.random().toString(36).substring(2, 9),
        productId: product.id,
        variantId: product.variantId,
        title: product.title,
        variantLabel: product.variantLabel,
        price: product.price,
        currency: product.currency,
        image: product.image,
        quantity: 1
      };

      return [...items, newItem];
    });

    this.openDrawer();
  }

  removeItem(variantId: string) {
    this.cartItems.update(items => items.filter(item => item.variantId !== variantId));
  }

  updateQuantity(variantId: string, quantity: number) {
    if (quantity <= 0) {
      this.removeItem(variantId);
      return;
    }

    this.cartItems.update(items =>
      items.map(item =>
        item.variantId === variantId ? { ...item, quantity } : item
      )
    );
  }

  clearCart() {
    this.cartItems.set([]);
  }
}
