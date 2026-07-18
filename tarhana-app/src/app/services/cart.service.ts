import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { CartItem, ShopifyProduct, ShopifyCart } from './shopify.types';
import { ShopifyService } from './shopify.service';
import { SHOPIFY_CONFIG } from '../shopify.config';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private shopifyService = inject(ShopifyService);
  private cartItems = signal<CartItem[]>([]);
  private isDrawerOpen = signal<boolean>(false);
  private shopifyCartId = signal<string | null>(null);
  private shopifyCheckoutUrl = signal<string | null>(null);

  // Queue to serialize all cart operations sequentially and prevent concurrent race conditions
  private cartOperationQueue: Promise<any> = Promise.resolve();

  constructor() {
    // Load cart from localStorage if available
    const savedCart = localStorage.getItem('ella_pantry_cart');
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        this.cartItems.set(parsed.items || []);
        this.shopifyCartId.set(parsed.cartId || null);
        this.shopifyCheckoutUrl.set(parsed.checkoutUrl || null);
      } catch (e) {
        console.error('Failed to parse saved cart', e);
      }
    }

    // Persist cart changes
    effect(() => {
      localStorage.setItem('ella_pantry_cart', JSON.stringify({
        items: this.cartItems(),
        cartId: this.shopifyCartId(),
        checkoutUrl: this.shopifyCheckoutUrl()
      }));
    });
  }

  items = this.cartItems.asReadonly();
  isOpen = this.isDrawerOpen.asReadonly();
  checkoutUrl = this.shopifyCheckoutUrl.asReadonly();

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

  private enqueueCartOperation<T>(operation: () => Promise<T>): Promise<T> {
    const nextPromise = this.cartOperationQueue.then(() => operation());
    this.cartOperationQueue = nextPromise.catch((err) => {
      console.error('Error during queued cart operation:', err);
    });
    return nextPromise;
  }

  private syncCartLines(cart: ShopifyCart) {
    this.cartItems.update(items => {
      return items.map(item => {
        const match = cart.lines.find(
          line => line.merchandise.id === item.variantId
        );
        if (match) {
          return { ...item, shopifyLineId: match.id };
        }
        return item;
      });
    });
  }

  async addItem(product: ShopifyProduct) {
    this.openDrawer();
    return this.enqueueCartOperation(async () => {
      const existingItem = this.cartItems().find(
        item => item.variantId === product.variantId
      );

      // If product is already in cart, just increment its quantity
      if (existingItem) {
        const targetQuantity = existingItem.quantity + 1;
        this.cartItems.update(items =>
          items.map(item =>
            item.variantId === product.variantId ? { ...item, quantity: targetQuantity } : item
          )
        );

        if (this.shopifyCartId() && existingItem.shopifyLineId) {
          const cart = await this.shopifyService.updateCartLine(
            this.shopifyCartId()!,
            existingItem.shopifyLineId,
            targetQuantity
          );
          if (cart) {
            this.shopifyCheckoutUrl.set(cart.checkoutUrl);
            this.syncCartLines(cart);
          }
        } else if (this.shopifyCartId()) {
          // If cart exists but line ID is missing, add it to the existing cart
          const cart = await this.shopifyService.addToCart(
            this.shopifyCartId()!,
            product.variantId,
            targetQuantity
          );
          if (cart) {
            this.shopifyCheckoutUrl.set(cart.checkoutUrl);
            this.syncCartLines(cart);
          }
        }
        return;
      }

      // New product
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

      this.cartItems.update(items => [...items, newItem]);

      if (!this.shopifyCartId()) {
        const cart = await this.shopifyService.createCart(
          product.variantId,
          1
        );
        if (cart) {
          this.shopifyCartId.set(cart.id);
          this.shopifyCheckoutUrl.set(cart.checkoutUrl);
          this.syncCartLines(cart);
        }
      } else {
        const cart = await this.shopifyService.addToCart(
          this.shopifyCartId()!,
          product.variantId,
          1
        );
        if (cart) {
          this.shopifyCheckoutUrl.set(cart.checkoutUrl);
          this.syncCartLines(cart);
        }
      }
    });
  }

  async removeItem(variantId: string) {
    return this.enqueueCartOperation(async () => {
      const itemToRemove = this.cartItems().find(item => item.variantId === variantId);
      this.cartItems.update(items => items.filter(item => item.variantId !== variantId));

      if (this.shopifyCartId() && itemToRemove?.shopifyLineId) {
        const cart = await this.shopifyService.removeFromCart(
          this.shopifyCartId()!,
          itemToRemove.shopifyLineId
        );
        if (cart) {
          this.shopifyCheckoutUrl.set(cart.checkoutUrl);
          this.syncCartLines(cart);
        }
      }
    });
  }

  async updateQuantity(variantId: string, quantity: number) {
    if (quantity <= 0) {
      await this.removeItem(variantId);
      return;
    }

    return this.enqueueCartOperation(async () => {
      const itemToUpdate = this.cartItems().find(item => item.variantId === variantId);
      this.cartItems.update(items =>
        items.map(item =>
          item.variantId === variantId ? { ...item, quantity } : item
        )
      );

      if (this.shopifyCartId() && itemToUpdate?.shopifyLineId) {
        const cart = await this.shopifyService.updateCartLine(
          this.shopifyCartId()!,
          itemToUpdate.shopifyLineId,
          quantity
        );
        if (cart) {
          this.shopifyCheckoutUrl.set(cart.checkoutUrl);
          this.syncCartLines(cart);
        }
      } else if (this.shopifyCartId() && itemToUpdate) {
        // If cart exists but line ID is missing, add it to the existing cart
        const cart = await this.shopifyService.addToCart(
          this.shopifyCartId()!,
          variantId,
          quantity
        );
        if (cart) {
          this.shopifyCheckoutUrl.set(cart.checkoutUrl);
          this.syncCartLines(cart);
        }
      }
    });
  }

  async getCheckoutUrl(): Promise<string> {
    if (this.cartItems().length === 0) {
      return '';
    }

    if (this.shopifyCheckoutUrl()) {
      return this.shopifyCheckoutUrl()!;
    }

    return this.enqueueCartOperation(async () => {
      // Re-check inside queue to avoid race conditions
      if (this.shopifyCheckoutUrl()) {
        return this.shopifyCheckoutUrl()!;
      }

      const lines = this.cartItems().map(item => ({
        variantId: item.variantId,
        quantity: item.quantity
      }));

      const cart = await this.shopifyService.createCart(lines);
      if (!cart) {
        return '';
      }

      this.shopifyCartId.set(cart.id);
      this.shopifyCheckoutUrl.set(cart.checkoutUrl);
      this.syncCartLines(cart);

      return cart.checkoutUrl;
    });
  }

  async applyDiscount(code: string): Promise<{ success: boolean; discountAmount?: number; errorMessage?: string }> {
    if (!code || !code.trim()) {
      return { success: false, errorMessage: 'Invalid discount code' };
    }

    const cleanCode = code.trim();

    // Check if Shopify is configured and we have an active cart ID
    const isShopifyConfigured = !!(SHOPIFY_CONFIG.domain && SHOPIFY_CONFIG.storefrontAccessToken);
    if (isShopifyConfigured && this.shopifyCartId()) {
      try {
        const cart = await this.shopifyService.applyDiscountCode(this.shopifyCartId()!, cleanCode);
        if (cart) {
          // Find the applied discount code status
          const discountObj = cart.discountCodes?.find(dc => dc.code.toUpperCase() === cleanCode.toUpperCase());
          if (discountObj && discountObj.applicable) {
            // Update the checkout URL
            this.shopifyCheckoutUrl.set(cart.checkoutUrl);

            const subtotalVal = Number(cart.cost.subtotalAmount?.amount || 0);
            const totalVal = Number(cart.cost.totalAmount?.amount || 0);
            const discountAmount = Math.max(0, subtotalVal - totalVal);

            return { success: true, discountAmount };
          } else {
            return { success: false, errorMessage: 'Invalid discount code' };
          }
        } else {
          return { success: false, errorMessage: 'Error applying discount code' };
        }
      } catch (error) {
        console.error('Error applying discount in CartService:', error);
        return { success: false, errorMessage: 'Error applying discount code' };
      }
    }

    // Local / Mock fallback path
    if (cleanCode.toUpperCase() === 'TARHANA20') {
      return { success: true, discountAmount: 20 };
    }

    return { success: false, errorMessage: 'Invalid discount code' };
  }

  clearCart() {
    this.cartItems.set([]);
    this.shopifyCartId.set(null);
    this.shopifyCheckoutUrl.set(null);
    localStorage.removeItem('ella_pantry_cart');
  }
}
