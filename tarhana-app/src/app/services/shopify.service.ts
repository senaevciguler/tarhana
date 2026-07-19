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
      compareAtPrice: 159,
      images: ['...'],
      variants: [
        {
          id: 'gid://shopify/ProductVariant/101',
          title: 'PRODUCT_ORIGINAL_VARIANT',
          price: 129,
          currency: 'kr',
          availableForSale: true,
          quantityAvailable: 5,
          compareAtPrice: 159
        }
      ],
      options: [
        {
          id: 'gid://shopify/ProductOption/1',
          name: 'Title',
          values: ['Default Title']
        }
      ],
      seo: {
        title: 'Original Fermented Soup Mix | Ella\'s Pantry',
        description: 'Authentic fermented soup mix inspired by tarhana.'
      }
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
      compareAtPrice: null,
      images: ['...'],
      variants: [
        {
          id: 'gid://shopify/ProductVariant/201',
          title: 'PRODUCT_UNSALTED_VARIANT',
          price: 129,
          currency: 'kr',
          availableForSale: false,
          quantityAvailable: 0,
          compareAtPrice: null
        }
      ],
      options: [
        {
          id: 'gid://shopify/ProductOption/2',
          name: 'Title',
          values: ['Default Title']
        }
      ],
      seo: {
        title: 'Unsalted Fermented Soup Mix | Ella\'s Pantry',
        description: 'Unsalted fermented soup mix inspired by tarhana.'
      }
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

            images(first: 20) {
              nodes {
                url
              }
            }

            options {
              id
              name
              values
            }

            seo {
              title
              description
            }

            variants(first: 50) {
              edges {
                node {
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
          const variantsList = node.variants?.edges?.map((vEdge: any) => {
            const v = vEdge.node;
            return {
              id: v.id,
              title: v.title ?? '',
              price: Number(v.price?.amount ?? 0),
              currency: v.price?.currencyCode === 'SEK' ? 'kr' : (v.price?.currencyCode ?? ''),
              availableForSale: v.availableForSale ?? true,
              quantityAvailable: v.quantityAvailable !== undefined && v.quantityAvailable !== null
                ? v.quantityAvailable
                : ((v.availableForSale ?? true) ? 999 : 0),
              compareAtPrice: v.compareAtPrice ? Number(v.compareAtPrice.amount) : null
            };
          }) ?? [];

          const variant = variantsList[0];

          return {

            id: node.id,

            handle: node.handle,

            title: node.title,

            description: node.description,

            price: variant?.price ?? 0,

            currency: variant?.currency ?? '',

            image: node.featuredImage?.url ?? '',

            variantId: variant?.id ?? '',

            tags: [],

            weight: '',

            variantLabel: variant?.title ?? '',

            availableForSale: variant?.availableForSale ?? true,

            quantityAvailable: variant?.quantityAvailable ?? 0,

            compareAtPrice: variant?.compareAtPrice ?? null,

            images: node.images?.nodes?.map((img: any) => img.url) ?? [],

            variants: variantsList,

            options: node.options?.map((opt: any) => ({
              id: opt.id,
              name: opt.name,
              values: opt.values ?? []
            })) ?? [],

            seo: {
              title: node.seo?.title ?? null,
              description: node.seo?.description ?? null
            }

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
      discountCodes: rawCart.discountCodes?.map((dc: any) => ({
        code: dc.code,
        applicable: dc.applicable,
      })) || [],
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

  async createCart(
    variantIdOrLines: string | { variantId: string; quantity: number }[],
    quantity?: number
  ): Promise<ShopifyCart | null> {
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
            discountCodes {
              code
              applicable
            }
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

    const linesInput = Array.isArray(variantIdOrLines)
      ? variantIdOrLines.map((line) => ({
          merchandiseId: line.variantId,
          quantity: line.quantity,
        }))
      : [
          {
            merchandiseId: variantIdOrLines,
            quantity: quantity || 1,
          },
        ];

    const variables = {
      input: {
        lines: linesInput,
      },
    };

    console.log('API URL:', this.apiUrl);
    console.log('Variables:', variables);

    try {
      const response: any = await firstValueFrom(
        this.http.post(
          this.apiUrl,
          { query, variables },
          { headers: this.headers }
        )
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
      return null;
    }
  }

  async addToCart(
    cartId: string,
    variantId: string,
    quantity: number
  ): Promise<ShopifyCart | null> {
    if (!SHOPIFY_CONFIG.domain || !SHOPIFY_CONFIG.storefrontAccessToken) return null;

    const query = `
      mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
        cartLinesAdd(cartId: $cartId, lines: $lines) {
          cart {
            id
            checkoutUrl
            discountCodes {
              code
              applicable
            }
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
      cartId,
      lines: [{ merchandiseId: variantId, quantity }],
    };

    try {
      const response: any = await firstValueFrom(
        this.http.post(
          this.apiUrl,
          { query, variables },
          { headers: this.headers }
        )
      );
      return response.data?.cartLinesAdd?.cart
        ? this.mapCart(response.data.cartLinesAdd.cart)
        : null;
    } catch (error) {
      console.error('Error adding to cart on Shopify:', error);
      return null;
    }
  }

  async updateCartLine(
    cartId: string,
    lineId: string,
    quantity: number
  ): Promise<ShopifyCart | null> {
    if (!SHOPIFY_CONFIG.domain || !SHOPIFY_CONFIG.storefrontAccessToken) return null;

    const query = `
      mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
        cartLinesUpdate(cartId: $cartId, lines: $lines) {
          cart {
            id
            checkoutUrl
            discountCodes {
              code
              applicable
            }
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
      cartId,
      lines: [{ id: lineId, quantity }],
    };

    try {
      const response: any = await firstValueFrom(
        this.http.post(
          this.apiUrl,
          { query, variables },
          { headers: this.headers }
        )
      );
      return response.data?.cartLinesUpdate?.cart
        ? this.mapCart(response.data.cartLinesUpdate.cart)
        : null;
    } catch (error) {
      console.error('Error updating cart line on Shopify:', error);
      return null;
    }
  }

  async removeFromCart(
    cartId: string,
    lineId: string
  ): Promise<ShopifyCart | null> {
    if (!SHOPIFY_CONFIG.domain || !SHOPIFY_CONFIG.storefrontAccessToken) return null;

    const query = `
      mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
        cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
          cart {
            id
            checkoutUrl
            discountCodes {
              code
              applicable
            }
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
      cartId,
      lineIds: [lineId],
    };

    try {
      const response: any = await firstValueFrom(
        this.http.post(
          this.apiUrl,
          { query, variables },
          { headers: this.headers }
        )
      );
      return response.data?.cartLinesRemove?.cart
        ? this.mapCart(response.data.cartLinesRemove.cart)
        : null;
    } catch (error) {
      console.error('Error removing from cart on Shopify:', error);
      return null;
    }
  }

  async applyDiscount(
    cartId: string,
    discountCodes: string[]
  ): Promise<ShopifyCart | null> {
    if (!SHOPIFY_CONFIG.domain || !SHOPIFY_CONFIG.storefrontAccessToken) return null;

    const query = `
      mutation cartDiscountCodesUpdate($cartId: ID!, $discountCodes: [String!]) {
        cartDiscountCodesUpdate(cartId: $cartId, discountCodes: $discountCodes) {
          cart {
            id
            checkoutUrl
            discountCodes {
              code
              applicable
            }
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
      cartId,
      discountCodes,
    };

    try {
      const response: any = await firstValueFrom(
        this.http.post(
          this.apiUrl,
          { query, variables },
          { headers: this.headers }
        )
      );
      return response.data?.cartDiscountCodesUpdate?.cart
        ? this.mapCart(response.data.cartDiscountCodesUpdate.cart)
        : null;
    } catch (error) {
      console.error('Error applying discount to cart on Shopify:', error);
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

        images(first: 20) {
          nodes {
            url
          }
        }

        options {
          id
          name
          values
        }

        seo {
          title
          description
        }

        variants(first: 50) {
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

    const variantsList = product.variants?.nodes?.map((v: any) => ({
      id: v.id,
      title: v.title ?? '',
      price: Number(v.price?.amount ?? 0),
      currency: v.price?.currencyCode === 'SEK' ? 'kr' : (v.price?.currencyCode ?? ''),
      availableForSale: v.availableForSale ?? true,
      quantityAvailable: v.quantityAvailable !== undefined && v.quantityAvailable !== null
        ? v.quantityAvailable
        : ((v.availableForSale ?? true) ? 999 : 0),
      compareAtPrice: v.compareAtPrice ? Number(v.compareAtPrice.amount) : null
    })) ?? [];

    const variant = variantsList[0];

    return {
      id: product.id,
      handle: product.handle,
      title: product.title,
      description: product.description,

      price: variant?.price ?? 0,
      currency: variant?.currency ?? '',

      image: product.featuredImage?.url ?? '',

      variantId: variant?.id ?? '',

      tags: product.tags ?? [],

      weight: '',
      variantLabel: variant?.title ?? '',

      availableForSale: variant?.availableForSale ?? true,
      quantityAvailable: variant?.quantityAvailable ?? 0,

      compareAtPrice: variant?.compareAtPrice ?? null,

      images: product.images?.nodes?.map((img: any) => img.url) ?? [],

      variants: variantsList,

      options: product.options?.map((opt: any) => ({
        id: opt.id,
        name: opt.name,
        values: opt.values ?? []
      })) ?? [],

      seo: {
        title: product.seo?.title ?? null,
        description: product.seo?.description ?? null
      }
    };

  } catch (error) {

    console.error('Error fetching product:', error);

    return null;
  }
}
}
