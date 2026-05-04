import { Injectable, signal } from '@angular/core';
import { ShopifyProduct } from './shopify.types';

@Injectable({
  providedIn: 'root',
})
export class ShopifyService {
  // Mock data representing Shopify products
  private products = signal<ShopifyProduct[]>([
    {
      id: 'gid://shopify/Product/1',
      handle: 'original-fermented-soup-mix',
      title: 'PRODUCT_ORIGINAL_TITLE',
      description: 'PRODUCT_ORIGINAL_DESC',
      price: 129,
      currency: 'kr',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDjaTiPnsI61uxKff57YDNfgbjKDiWdMvFSHp0jX89oKuyxARwdGUeaFVPAWipDO8AZCXPFZTgCSDLtbRfoqGoiORYn7peqxl_PglDuZBacidPiGJCRC7ov0OphhkiXL6jhaNCyEH4zP-6VVMnatWTt8hpUOuwl3or9mNCE3KM9hCRenphP_WIu02VBMBbfOaCcNA0W-lpjMQIF85vKOllNwl7Ccdi6GD9XKP4icgl5SbtA84lV6wClevwqpw6fghO3Nlo36Evs4Wk',
      variantId: 'gid://shopify/ProductVariant/101',
      tags: ['PRODUCT_ORIGINAL_BADGE1', 'PRODUCT_ORIGINAL_BADGE2', 'PRODUCT_ORIGINAL_BADGE3'],
      weight: 'PRODUCT_ORIGINAL_WEIGHT',
      variantLabel: 'PRODUCT_ORIGINAL_VARIANT'
    },
    {
      id: 'gid://shopify/Product/2',
      handle: 'unsalted-fermented-soup-mix',
      title: 'PRODUCT_UNSALTED_TITLE',
      description: 'PRODUCT_UNSALTED_DESC',
      price: 129,
      currency: 'kr',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDjaTiPnsI61uxKff57YDNfgbjKDiWdMvFSHp0jX89oKuyxARwdGUeaFVPAWipDO8AZCXPFZTgCSDLtbRfoqGoiORYn7peqxl_PglDuZBacidPiGJCRC7ov0OphhkiXL6jhaNCyEH4zP-6VVMnatWTt8hpUOuwl3or9mNCE3KM9hCRenphP_WIu02VBMBbfOaCcNA0W-lpjMQIF85vKOllNwl7Ccdi6GD9XKP4icgl5SbtA84lV6wClevwqpw6fghO3Nlo36Evs4Wk',
      variantId: 'gid://shopify/ProductVariant/201',
      tags: ['PRODUCT_UNSALTED_BADGE1', 'PRODUCT_UNSALTED_BADGE2', 'PRODUCT_UNSALTED_BADGE3'],
      weight: 'PRODUCT_UNSALTED_WEIGHT',
      variantLabel: 'PRODUCT_UNSALTED_VARIANT'
    }
  ]);

  getProducts() {
    return this.products.asReadonly();
  }

  // Placeholder for future Shopify Storefront API integration
  async fetchProducts() {
    // In the future, this will use HttpClient to fetch from Shopify
    // const response = await firstValueFrom(this.http.post(SHOPIFY_API_URL, query, headers));
    // return response.data.products;
    return this.products();
  }

  async createCheckout(variantId: string, quantity: number) {
    // In the future, this will call Shopify to create a checkout and return the webUrl
    console.log(`Creating Shopify checkout for variant ${variantId} with quantity ${quantity}`);
    return 'https://ella-pantry.myshopify.com/checkout';
  }
}
