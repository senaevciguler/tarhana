import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { CartItem, ShopifyProduct } from './shopify.types';
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

  async addItem(product: ShopifyProduct) {
  const existingItem = this.cartItems().find(
    item => item.variantId === product.variantId
  );

  // Ürün zaten sepetteyse sadece miktarı artır
  if (existingItem) {
    await this.updateQuantity(
      product.variantId,
      existingItem.quantity + 1
    );
    this.openDrawer();
    return;
  }

  // Yeni ürün
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

  // İlk ürün -> Shopify'da yeni cart oluştur
  if (!this.shopifyCartId()) {

    const cart = await this.shopifyService.createCart(
      product.variantId,
      1
    );

    if (cart) {
      this.shopifyCartId.set(cart.id);
      this.shopifyCheckoutUrl.set(cart.checkoutUrl);

      const firstLine = cart.lines[0];

      if (firstLine) {
        this.updateLineId(product.variantId, firstLine.id);
      }
    }

  } else {

    // Mevcut cart'a yeni ürün ekle
    const cart = await this.shopifyService.addToCart(
      this.shopifyCartId()!,
      product.variantId,
      1
    );

    if (cart) {
      this.shopifyCheckoutUrl.set(cart.checkoutUrl);

      // Shopify'ın döndürdüğü satırdan lineId'yi bul
      const addedLine = cart.lines.find(
        line => line.merchandise.id === product.variantId
      );

      if (addedLine) {
        this.updateLineId(product.variantId, addedLine.id);
      }
    }
  }

  this.openDrawer();
}

  private updateLineId(variantId: string, lineId: string) {
    this.cartItems.update(items => items.map(item =>
        item.variantId === variantId ? { ...item, shopifyLineId: lineId } : item
    ));
  }

  async removeItem(variantId: string) {
    const itemToRemove = this.cartItems().find(item => item.variantId === variantId);
    this.cartItems.update(items => items.filter(item => item.variantId !== variantId));

    if (this.shopifyCartId() && itemToRemove?.shopifyLineId) {
        const cart = await this.shopifyService.removeFromCart(this.shopifyCartId()!, itemToRemove.shopifyLineId);
        if (cart) {
            this.shopifyCheckoutUrl.set(cart.checkoutUrl);
        }
    } else {
        // If we don't have a line ID, we invalidate the checkout URL to force recreation
        this.shopifyCheckoutUrl.set(null);
    }
  }

  async updateQuantity(variantId: string, quantity: number) {
    if (quantity <= 0) {
      await this.removeItem(variantId);
      return;
    }

    const itemToUpdate = this.cartItems().find(item => item.variantId === variantId);
    this.cartItems.update(items =>
      items.map(item =>
        item.variantId === variantId ? { ...item, quantity } : item
      )
    );

    // Sync with Shopify if cart exists
    if (this.shopifyCartId() && itemToUpdate?.shopifyLineId) {
        const cart = await this.shopifyService.updateCartLine(this.shopifyCartId()!, itemToUpdate.shopifyLineId, quantity);
        if (cart) {
            this.shopifyCheckoutUrl.set(cart.checkoutUrl);
        }
    } else {
        // Force recreation if sync is lost
        this.shopifyCheckoutUrl.set(null);
    }
  }

 async getCheckoutUrl(): Promise<string> {

  // Sepet boşsa checkout yok
  if (this.cartItems().length === 0) {
    return '';
  }

  // Shopify checkout zaten oluşturulmuşsa tekrar oluşturma
  if (this.shopifyCheckoutUrl()) {
    return this.shopifyCheckoutUrl()!;
  }

  // Cart kaybolmuşsa yeniden oluştur
  const firstItem = this.cartItems()[0];

  const cart = await this.shopifyService.createCart(
    firstItem.variantId,
    firstItem.quantity
  );

  if (!cart) {
    return '';
  }

  this.shopifyCartId.set(cart.id);
  this.shopifyCheckoutUrl.set(cart.checkoutUrl);

  // İlk ürün dışındaki ürünleri ekle
  for (let i = 1; i < this.cartItems().length; i++) {
    await this.shopifyService.addToCart(
      cart.id,
      this.cartItems()[i].variantId,
      this.cartItems()[i].quantity
    );
  }

  return cart.checkoutUrl;
}

clearCart() {
  this.cartItems.set([]);
  this.shopifyCartId.set(null);
  this.shopifyCheckoutUrl.set(null);

  localStorage.removeItem('ella_pantry_cart');
}
}
