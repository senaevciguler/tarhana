import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { CartItem, ShopifyProduct, ShopifyCart } from './shopify.types';
import { ShopifyService } from './shopify.service';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private shopifyService = inject(ShopifyService);
  private cartItems = signal<CartItem[]>([]);
  private isDrawerOpen = signal<boolean>(false);
  private shopifyCartId = signal<string | null>(null);
  private shopifyCheckoutUrl = signal<string | null>(null);
  private discountAmountSignal = signal<number>(0);

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
        this.discountAmountSignal.set(parsed.discountAmount || 0);
      } catch (e) {
        console.error('Failed to parse saved cart', e);
      }
    }

    // Persist cart changes
    effect(() => {
      localStorage.setItem('ella_pantry_cart', JSON.stringify({
        items: this.cartItems(),
        cartId: this.shopifyCartId(),
        checkoutUrl: this.shopifyCheckoutUrl(),
        discountAmount: this.discountAmountSignal()
      }));
    });
  }

  items = this.cartItems.asReadonly();
  discountAmount = this.discountAmountSignal.asReadonly();
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

  private handleCartResponse(cart: ShopifyCart | null) {
    if (!cart) return;
    this.shopifyCheckoutUrl.set(cart.checkoutUrl);
    this.syncCartLines(cart);

    // Update discount amount if there's any active, applicable discount code in the cart
    const applicableDiscount = cart.discountCodes?.filter(dc => dc.applicable);
    if (applicableDiscount && applicableDiscount.length > 0) {
      const subTotalAmount = Number(cart.cost?.subtotalAmount?.amount ?? 0);
      const totalAmount = Number(cart.cost?.totalAmount?.amount ?? 0);
      const diff = subTotalAmount - totalAmount;
      this.discountAmountSignal.set(diff > 0 ? diff : 0);
    } else {
      this.discountAmountSignal.set(0);
    }
  }

  async applyDiscount(code: string): Promise<boolean> {
    if (!code) {
      this.discountAmountSignal.set(0);
      return false;
    }

    if (!this.shopifyCartId() && this.cartItems().length > 0) {
      // If we don't have a Shopify cart yet, let's try to get or create one
      await this.getCheckoutUrl();
    }

    if (this.shopifyCartId()) {
      const cart = await this.shopifyService.applyDiscount(
        this.shopifyCartId()!,
        [code]
      );
      if (cart) {
        this.handleCartResponse(cart);
        // Check if the discount was successfully applied
        const hasApplicableDiscount = cart.discountCodes?.some(
          dc => dc.code.toUpperCase() === code.toUpperCase() && dc.applicable
        );
        return !!hasApplicableDiscount;
      }
    }

    // Fallback to local mock validation of 'TARHANA20' (20 kr discount) when Shopify is not configured
    if (code.toUpperCase() === 'TARHANA20') {
      this.discountAmountSignal.set(20);
      return true;
    } else {
      this.discountAmountSignal.set(0);
      return false;
    }
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
            this.handleCartResponse(cart);
          }
        } else if (this.shopifyCartId()) {
          // If cart exists but line ID is missing, add it to the existing cart
          const cart = await this.shopifyService.addToCart(
            this.shopifyCartId()!,
            product.variantId,
            targetQuantity
          );
          if (cart) {
            this.handleCartResponse(cart);
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
          this.handleCartResponse(cart);
        }
      } else {
        const cart = await this.shopifyService.addToCart(
          this.shopifyCartId()!,
          product.variantId,
          1
        );
        if (cart) {
          this.handleCartResponse(cart);
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
          this.handleCartResponse(cart);
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
          this.handleCartResponse(cart);
        }
      } else if (this.shopifyCartId() && itemToUpdate) {
        // If cart exists but line ID is missing, add it to the existing cart
        const cart = await this.shopifyService.addToCart(
          this.shopifyCartId()!,
          variantId,
          quantity
        );
        if (cart) {
          this.handleCartResponse(cart);
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
      this.handleCartResponse(cart);

      return cart.checkoutUrl;
    });
  }

  clearCart() {
    this.cartItems.set([]);
    this.shopifyCartId.set(null);
    this.shopifyCheckoutUrl.set(null);
    this.discountAmountSignal.set(0);
    localStorage.removeItem('ella_pantry_cart');
  }
}
