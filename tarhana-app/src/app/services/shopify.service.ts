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
  image: '...',
  variantId: 'gid://shopify/ProductVariant/101',
  tags: [
    'PRODUCT_ORIGINAL_BADGE1',
    'PRODUCT_ORIGINAL_BADGE2',
    'PRODUCT_ORIGINAL_BADGE3'
  ],
  weight: 'PRODUCT_ORIGINAL_WEIGHT',
  variantLabel: 'PRODUCT_ORIGINAL_VARIANT',

  availableForSale: true,
  quantityAvailable: 5,
  compareAtPrice: 159
},
  {
  id: 'gid://shopify/Product/2',
  handle: 'unsalted-fermented-soup-mix',
  title: 'PRODUCT_UNSALTED_TITLE',
  description: 'PRODUCT_UNSALTED_DESC',
  price: 129,
  currency: 'kr',
  image: '...',
  variantId: 'gid://shopify/ProductVariant/201',
  tags: [
    'PRODUCT_UNSALTED_BADGE1',
    'PRODUCT_UNSALTED_BADGE2',
    'PRODUCT_UNSALTED_BADGE3'
  ],
  weight: 'PRODUCT_UNSALTED_WEIGHT',
  variantLabel: 'PRODUCT_UNSALTED_VARIANT',

  availableForSale: false,
  quantityAvailable: 0,
  compareAtPrice: null
},
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
      products(first: 20) {
        edges {
          node {
            id
            handle
            title
            description

            featuredImage {
              url
            }

            variants(first: 1) {
              edges {
                node {
                  id

                  availableForSale

                  quantityAvailable

                  price {
                    amount
                    currencyCode
                  }

                  compareAtPrice {
                    amount
                  }
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
      this.http.post(
        this.apiUrl,
        { query },
        { headers: this.headers }
      )
    );

    if (response.data?.products?.edges) {

      const shopifyProducts: ShopifyProduct[] =
        response.data.products.edges.map((edge: any) => {

          const node = edge.node;
          const variant = node.variants.edges[0]?.node;

          return {

            id: node.id,

            handle: node.handle,

            title: node.title,

            description: node.description,

            price: Number(variant?.price?.amount ?? 0),

            currency:
              variant?.price?.currencyCode === 'SEK'
                ? 'kr'
                : variant?.price?.currencyCode,

            image: node.featuredImage?.url ?? '',

            variantId: variant?.id,

            tags: [],

            weight: '',

            variantLabel: '',

            availableForSale:
              variant?.availableForSale ?? true,

            quantityAvailable:
              variant?.quantityAvailable !== undefined && variant?.quantityAvailable !== null
                ? variant.quantityAvailable
                : ((variant?.availableForSale ?? true) ? 999 : 0),

            compareAtPrice:
              variant?.compareAtPrice
                ? Number(variant.compareAtPrice.amount)
                : null

          };

        });

      this.products.set(shopifyProducts);
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

  if (!SHOPIFY_CONFIG.domain || !SHOPIFY_CONFIG.storefrontAccessToken) {
    console.log('Missing Shopify config');
    return null;
  }

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
        userErrors {
          field
          message
        }
      }
    }
  `;

  const variables = {
    input: {
      lines: [
        {
          merchandiseId: variantId,
          quantity
        }
      ]
    }
  };

  console.log('API URL:', this.apiUrl);
  console.log('Variant:', variantId);
  console.log('Token:', SHOPIFY_CONFIG.storefrontAccessToken);
  console.log('Variables:', variables);

  try {
    const response: any = await firstValueFrom(
      this.http.post(this.apiUrl, { query, variables }, { headers: this.headers })
    );

    console.log('FULL RESPONSE:', response);

    if (response.data?.cartCreate?.userErrors?.length) {
      console.log('USER ERRORS:', response.data.cartCreate.userErrors);
    }

    return response.data?.cartCreate?.cart
      ? this.mapCart(response.data.cartCreate.cart)
      : null;

  } catch (error: any) {
    console.error('HTTP ERROR:', error);
    console.error('Server response:', error.error);
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
  async fetchProduct(handle: string): Promise<ShopifyProduct | null> {

  if (!SHOPIFY_CONFIG.domain || !SHOPIFY_CONFIG.storefrontAccessToken) {
    return null;
  }

  const query = `
    query Product($handle: String!) {
      product(handle: $handle) {
        id
        handle
        title
        description
        tags

        featuredImage {
          url
        }

        variants(first: 1) {
          nodes {
            id
            title
            availableForSale
            quantityAvailable

            price {
              amount
              currencyCode
            }

            compareAtPrice {
              amount
            }
          }
        }
      }
    }
  `;

  const variables = {
    handle
  };

  try {

    const response: any = await firstValueFrom(
      this.http.post(
        this.apiUrl,
        {
          query,
          variables
        },
        {
          headers: this.headers
        }
      )
    );

    const product = response.data?.product;

    if (!product) {
      return null;
    }

    const variant = product.variants.nodes[0];

    return {
      id: product.id,
      handle: product.handle,
      title: product.title,
      description: product.description,

      price: Number(variant.price.amount),
      currency: variant.price.currencyCode,

      image: product.featuredImage?.url ?? '',

      variantId: variant.id,

      tags: product.tags,

      weight: '',
      variantLabel: variant.title,

      availableForSale: variant.availableForSale,
      quantityAvailable: variant.quantityAvailable !== undefined && variant.quantityAvailable !== null
        ? variant.quantityAvailable
        : (variant.availableForSale ? 999 : 0),

      compareAtPrice: variant.compareAtPrice
        ? Number(variant.compareAtPrice.amount)
        : null
    };

  } catch (error) {

    console.error('Error fetching product:', error);

    return null;
  }
}
}
