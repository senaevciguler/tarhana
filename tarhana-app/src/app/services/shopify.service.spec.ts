import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ShopifyService } from './shopify.service';
import { SHOPIFY_CONFIG } from '../shopify.config';

describe('ShopifyService', () => {
  let service: ShopifyService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ShopifyService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(ShopifyService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return mock products by default if shopify config is empty', async () => {
    const origDomain = SHOPIFY_CONFIG.domain;
    const origToken = SHOPIFY_CONFIG.storefrontAccessToken;
    SHOPIFY_CONFIG.domain = '';
    SHOPIFY_CONFIG.storefrontAccessToken = '';

    const products = await service.fetchProducts();
    expect(products.length).toBe(2);
    expect(products[0].images).toBeDefined();
    expect(products[0].variants).toBeDefined();
    expect(products[0].options).toBeDefined();
    expect(products[0].seo).toBeDefined();

    SHOPIFY_CONFIG.domain = origDomain;
    SHOPIFY_CONFIG.storefrontAccessToken = origToken;
  });

  it('should query correct fields and map response correctly in fetchProducts', async () => {
    const origDomain = SHOPIFY_CONFIG.domain;
    const origToken = SHOPIFY_CONFIG.storefrontAccessToken;
    SHOPIFY_CONFIG.domain = 'test-store.myshopify.com';
    SHOPIFY_CONFIG.storefrontAccessToken = 'test-token';

    const mockResponse = {
      data: {
        products: {
          edges: [
            {
              node: {
                id: 'gid://shopify/Product/1',
                handle: 'test-product',
                title: 'Test Product',
                description: 'Test description',
                featuredImage: { url: 'https://test.com/img.jpg' },
                images: { nodes: [{ url: 'https://test.com/img1.jpg' }, { url: 'https://test.com/img2.jpg' }] },
                options: [{ id: 'opt-1', name: 'Size', values: ['S', 'M'] }],
                seo: { title: 'SEO Title', description: 'SEO Description' },
                variants: {
                  edges: [
                    {
                      node: {
                        id: 'gid://shopify/ProductVariant/1',
                        title: 'Default Title',
                        availableForSale: true,
                        quantityAvailable: 10,
                        price: { amount: '99.0', currencyCode: 'SEK' },
                        compareAtPrice: { amount: '129.0' }
                      }
                    }
                  ]
                }
              }
            }
          ]
        }
      }
    };

    const promise = service.fetchProducts();

    const req = httpTestingController.expectOne(`https://test-store.myshopify.com/api/${SHOPIFY_CONFIG.apiVersion}/graphql.json`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body.query).toContain('seo');
    expect(req.request.body.query).toContain('options');
    expect(req.request.body.query).toContain('images');

    req.flush(mockResponse);

    const products = await promise;
    expect(products.length).toBe(1);
    const p = products[0];
    expect(p.id).toBe('gid://shopify/Product/1');
    expect(p.price).toBe(99);
    expect(p.currency).toBe('kr');
    expect(p.images).toEqual(['https://test.com/img1.jpg', 'https://test.com/img2.jpg']);
    expect(p.options).toEqual([{ id: 'opt-1', name: 'Size', values: ['S', 'M'] }]);
    expect(p.seo).toEqual({ title: 'SEO Title', description: 'SEO Description' });
    expect(p.variants?.length).toBe(1);
    expect(p.variants?.[0].quantityAvailable).toBe(10);
    expect(p.variants?.[0].compareAtPrice).toBe(129);

    SHOPIFY_CONFIG.domain = origDomain;
    SHOPIFY_CONFIG.storefrontAccessToken = origToken;
  });

  it('should query correct fields and map response correctly in fetchProduct', async () => {
    const origDomain = SHOPIFY_CONFIG.domain;
    const origToken = SHOPIFY_CONFIG.storefrontAccessToken;
    SHOPIFY_CONFIG.domain = 'test-store.myshopify.com';
    SHOPIFY_CONFIG.storefrontAccessToken = 'test-token';

    const mockResponse = {
      data: {
        product: {
          id: 'gid://shopify/Product/1',
          handle: 'test-product',
          title: 'Test Product',
          description: 'Test description',
          tags: ['tag1'],
          featuredImage: { url: 'https://test.com/img.jpg' },
          images: { nodes: [{ url: 'https://test.com/img1.jpg' }] },
          options: [{ id: 'opt-1', name: 'Size', values: ['S'] }],
          seo: { title: 'SEO Title', description: 'SEO Description' },
          variants: {
            nodes: [
              {
                id: 'gid://shopify/ProductVariant/1',
                title: 'Default Title',
                availableForSale: true,
                quantityAvailable: null,
                price: { amount: '99.0', currencyCode: 'SEK' },
                compareAtPrice: null
              }
            ]
          }
        }
      }
    };

    const promise = service.fetchProduct('test-product');

    const req = httpTestingController.expectOne(`https://test-store.myshopify.com/api/${SHOPIFY_CONFIG.apiVersion}/graphql.json`);
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);

    const product = await promise;
    expect(product).toBeTruthy();
    expect(product!.id).toBe('gid://shopify/Product/1');
    expect(product!.price).toBe(99);
    expect(product!.images).toEqual(['https://test.com/img1.jpg']);
    expect(product!.quantityAvailable).toBe(999);
    expect(product!.compareAtPrice).toBeNull();
    expect(product!.variants?.[0].quantityAvailable).toBe(999);

    SHOPIFY_CONFIG.domain = origDomain;
    SHOPIFY_CONFIG.storefrontAccessToken = origToken;
  });

  it('should query and map response correctly in applyDiscountCode', async () => {
    const origDomain = SHOPIFY_CONFIG.domain;
    const origToken = SHOPIFY_CONFIG.storefrontAccessToken;
    SHOPIFY_CONFIG.domain = 'test-store.myshopify.com';
    SHOPIFY_CONFIG.storefrontAccessToken = 'test-token';

    const mockResponse = {
      data: {
        cartDiscountCodesUpdate: {
          cart: {
            id: 'cart-1',
            checkoutUrl: 'https://checkout.com/cart-1',
            discountCodes: [
              { code: 'OFFER20', applicable: true }
            ],
            lines: { edges: [] },
            cost: {
              totalAmount: { amount: '80.0', currencyCode: 'SEK' },
              subtotalAmount: { amount: '100.0', currencyCode: 'SEK' }
            }
          },
          userErrors: []
        }
      }
    };

    const promise = service.applyDiscountCode('cart-1', 'OFFER20');

    const req = httpTestingController.expectOne(`https://test-store.myshopify.com/api/${SHOPIFY_CONFIG.apiVersion}/graphql.json`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body.query).toContain('cartDiscountCodesUpdate');
    req.flush(mockResponse);

    const cart = await promise;
    expect(cart).toBeTruthy();
    expect(cart!.id).toBe('cart-1');
    expect(cart!.checkoutUrl).toBe('https://checkout.com/cart-1');
    expect(cart!.discountCodes).toEqual([{ code: 'OFFER20', applicable: true }]);
    expect(cart!.cost.totalAmount.amount).toBe('80.0');
    expect(cart!.cost.subtotalAmount.amount).toBe('100.0');

    SHOPIFY_CONFIG.domain = origDomain;
    SHOPIFY_CONFIG.storefrontAccessToken = origToken;
  });
});
