import { Injectable, signal, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ShopifyProduct, ShopifyCart } from './shopify.types';
import { SHOPIFY_CONFIG } from '../shopify.config';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ShopifyService {
  private http = inject(HttpClient);

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

  private get headers() {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': SHOPIFY_CONFIG.storefrontAccessToken,
    });
  }

  private get apiUrl() {
    return `https://${SHOPIFY_CONFIG.domain}/api/${SHOPIFY_CONFIG.apiVersion}/graphql.json`;
  }

  getProducts() {
    return this.products.asReadonly();
  }

  async fetchProducts() {
    if (!SHOPIFY_CONFIG.domain || !SHOPIFY_CONFIG.storefrontAccessToken) {
      console.warn('Shopify credentials missing, using mock products.');
      return this.products();
    }

    const query = `
      query getProducts {
        products(first: 10) {
          edges {
            node {
              id
              handle
              title
              description
              variants(first: 1) {
                edges {
                  node {
                    id
                    price {
                      amount
                      currencyCode
                    }
                  }
                }
              }
              images(first: 1) {
                edges {
                  node {
                    url
                  }
                }
              }
            }
          }
        }
      }
    `;

    try {
      const response: any = await firstValueFrom(
        this.http.post(this.apiUrl, { query }, { headers: this.headers })
      );

      if (response.data?.products?.edges) {
        const shopifyProducts: ShopifyProduct[] = response.data.products.edges.map((edge: any) => {
          const node = edge.node;
          const variant = node.variants.edges[0]?.node;
          return {
            id: node.id,
            handle: node.handle,
            title: node.title,
            description: node.description,
            price: parseFloat(variant?.price.amount || '0'),
            currency: variant?.price.currencyCode === 'SEK' ? 'kr' : variant?.price.currencyCode,
            image: node.images.edges[0]?.node.url,
            variantId: variant?.id,
            tags: [],
            weight: '',
            variantLabel: ''
          };
        });

        if (shopifyProducts.length > 0) {
          this.products.set(shopifyProducts);
        }
      }
    } catch (error) {
      console.error('Error fetching products from Shopify:', error);
    }

    return this.products();
  }

  private mapCart(rawCart: any): ShopifyCart {
    return {
      id: rawCart.id,
      checkoutUrl: rawCart.checkoutUrl,
      lines: rawCart.lines?.edges?.map((edge: any) => ({
        id: edge.node.id,
        quantity: edge.node.quantity,
        merchandise: {
          id: edge.node.merchandise.id,
          title: edge.node.merchandise.title,
          product: {
            title: edge.node.merchandise.product.title
          }
        }
      })) || [],
      cost: rawCart.cost
    };
  }

  async createCart(variantId: string, quantity: number): Promise<ShopifyCart | null> {
    if (!SHOPIFY_CONFIG.domain || !SHOPIFY_CONFIG.storefrontAccessToken) return null;

    const query = `
      mutation cartCreate($input: CartInput) {
        cartCreate(input: $input) {
          cart {
            id
            checkoutUrl
            lines(first: 10) {
              edges {
                node {
                  id
                  quantity
                  merchandise {
                    ... on ProductVariant {
                      id
                      title
                      product {
                        title
                      }
                    }
                  }
                }
              }
            }
            cost {
              totalAmount {
                amount
                currencyCode
              }
              subtotalAmount {
                amount
                currencyCode
              }
            }
          }
        }
      }
    `;

    const variables = {
      input: {
        lines: [
          {
            merchandiseId: variantId,
            quantity: quantity
          }
        ]
      }
    };

    try {
      const response: any = await firstValueFrom(
        this.http.post(this.apiUrl, { query, variables }, { headers: this.headers })
      );
      return response.data?.cartCreate?.cart ? this.mapCart(response.data.cartCreate.cart) : null;
    } catch (error) {
      console.error('Error creating cart on Shopify:', error);
      return null;
    }
  }

  async addToCart(cartId: string, variantId: string, quantity: number): Promise<ShopifyCart | null> {
    if (!SHOPIFY_CONFIG.domain || !SHOPIFY_CONFIG.storefrontAccessToken) return null;

    const query = `
      mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
        cartLinesAdd(cartId: $cartId, lines: $lines) {
          cart {
            id
            checkoutUrl
            lines(first: 10) {
              edges {
                node {
                  id
                  quantity
                  merchandise {
                    ... on ProductVariant {
                      id
                      title
                      product {
                        title
                      }
                    }
                  }
                }
              }
            }
            cost {
              totalAmount {
                amount
                currencyCode
              }
            }
          }
        }
      }
    `;

    const variables = {
      cartId,
      lines: [{ merchandiseId: variantId, quantity }]
    };

    try {
      const response: any = await firstValueFrom(
        this.http.post(this.apiUrl, { query, variables }, { headers: this.headers })
      );
      return response.data?.cartLinesAdd?.cart ? this.mapCart(response.data.cartLinesAdd.cart) : null;
    } catch (error) {
      console.error('Error adding to cart on Shopify:', error);
      return null;
    }
  }

  async updateCartLine(cartId: string, lineId: string, quantity: number): Promise<ShopifyCart | null> {
    if (!SHOPIFY_CONFIG.domain || !SHOPIFY_CONFIG.storefrontAccessToken) return null;

    const query = `
      mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
        cartLinesUpdate(cartId: $cartId, lines: $lines) {
          cart {
            id
            checkoutUrl
            cost {
              totalAmount {
                amount
                currencyCode
              }
            }
          }
        }
      }
    `;

    const variables = {
      cartId,
      lines: [{ id: lineId, quantity }]
    };

    try {
      const response: any = await firstValueFrom(
        this.http.post(this.apiUrl, { query, variables }, { headers: this.headers })
      );
      // Note: update mutation in this simple form doesn't return full lines by default in my mapCart if not requested
      // But we can still map the base properties.
      return response.data?.cartLinesUpdate?.cart ? this.mapCart(response.data.cartLinesUpdate.cart) : null;
    } catch (error) {
      console.error('Error updating cart line on Shopify:', error);
      return null;
    }
  }

  async removeFromCart(cartId: string, lineId: string): Promise<ShopifyCart | null> {
    if (!SHOPIFY_CONFIG.domain || !SHOPIFY_CONFIG.storefrontAccessToken) return null;

    const query = `
      mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
        cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
          cart {
            id
            checkoutUrl
            cost {
              totalAmount {
                amount
                currencyCode
              }
            }
          }
        }
      }
    `;

    const variables = {
      cartId,
      lineIds: [lineId]
    };

    try {
      const response: any = await firstValueFrom(
        this.http.post(this.apiUrl, { query, variables }, { headers: this.headers })
      );
      return response.data?.cartLinesRemove?.cart ? this.mapCart(response.data.cartLinesRemove.cart) : null;
    } catch (error) {
      console.error('Error removing from cart on Shopify:', error);
      return null;
    }
  }
}
