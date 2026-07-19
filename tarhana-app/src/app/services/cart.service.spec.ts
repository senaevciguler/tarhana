import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { CartService } from './cart.service';
import { ShopifyService } from './shopify.service';
import { ShopifyProduct, ShopifyCart } from './shopify.types';

describe('CartService', () => {
  let service: CartService;
  let mockShopifyService: jasmine.SpyObj<ShopifyService>;

  const mockProduct1: ShopifyProduct = {
    id: 'gid://shopify/Product/1',
    handle: 'original-fermented-soup-mix',
    title: 'Original Fermented Soup Mix',
    description: 'Desc 1',
    price: 129,
    currency: 'kr',
    image: 'img1.jpg',
    variantId: 'gid://shopify/ProductVariant/101',
    tags: [],
    weight: '250g',
    variantLabel: 'Original',
    availableForSale: true,
    quantityAvailable: 5,
  };

  const mockProduct2: ShopifyProduct = {
    id: 'gid://shopify/Product/2',
    handle: 'unsalted-fermented-soup-mix',
    title: 'Unsalted Fermented Soup Mix',
    description: 'Desc 2',
    price: 129,
    currency: 'kr',
    image: 'img2.jpg',
    variantId: 'gid://shopify/ProductVariant/201',
    tags: [],
    weight: '250g',
    variantLabel: 'Unsalted',
    availableForSale: true,
    quantityAvailable: 10,
  };

  const mockCartResponse1: ShopifyCart = {
    id: 'gid://shopify/Cart/test-cart-id',
    checkoutUrl: 'https://checkout.shopify.com/1',
    lines: [
      {
        id: 'gid://shopify/CartLine/101',
        quantity: 1,
        merchandise: {
          id: 'gid://shopify/ProductVariant/101',
          title: 'Original',
          product: { title: 'Original Fermented Soup Mix' }
        }
      }
    ],
    cost: {
      totalAmount: { amount: '129.0', currencyCode: 'SEK' },
      subtotalAmount: { amount: '129.0', currencyCode: 'SEK' }
    }
  };

  const mockCartResponse2: ShopifyCart = {
    id: 'gid://shopify/Cart/test-cart-id',
    checkoutUrl: 'https://checkout.shopify.com/1',
    lines: [
      {
        id: 'gid://shopify/CartLine/101',
        quantity: 1,
        merchandise: {
          id: 'gid://shopify/ProductVariant/101',
          title: 'Original',
          product: { title: 'Original Fermented Soup Mix' }
        }
      },
      {
        id: 'gid://shopify/CartLine/201',
        quantity: 1,
        merchandise: {
          id: 'gid://shopify/ProductVariant/201',
          title: 'Unsalted',
          product: { title: 'Unsalted Fermented Soup Mix' }
        }
      }
    ],
    cost: {
      totalAmount: { amount: '258.0', currencyCode: 'SEK' },
      subtotalAmount: { amount: '258.0', currencyCode: 'SEK' }
    }
  };

  beforeEach(() => {
    localStorage.clear();
    const spy = jasmine.createSpyObj('ShopifyService', [
      'createCart',
      'addToCart',
      'updateCartLine',
      'removeFromCart',
      'applyDiscount'
    ]);

    TestBed.configureTestingModule({
      providers: [
        CartService,
        { provide: ShopifyService, useValue: spy }
      ]
    });

    service = TestBed.inject(CartService);
    mockShopifyService = TestBed.inject(ShopifyService) as jasmine.SpyObj<ShopifyService>;
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should create a cart on Shopify when the first item is added', fakeAsync(() => {
    mockShopifyService.createCart.and.returnValue(Promise.resolve(mockCartResponse1));

    service.addItem(mockProduct1);
    tick();

    expect(mockShopifyService.createCart).toHaveBeenCalledWith('gid://shopify/ProductVariant/101', 1);
    expect(service.items().length).toBe(1);
    expect(service.items()[0].shopifyLineId).toBe('gid://shopify/CartLine/101');
    expect(service.checkoutUrl()).toBe('https://checkout.shopify.com/1');
  }));

  it('should reuse the existing cart and append items instead of recreating it', fakeAsync(() => {
    mockShopifyService.createCart.and.returnValue(Promise.resolve(mockCartResponse1));
    mockShopifyService.addToCart.and.returnValue(Promise.resolve(mockCartResponse2));

    // Add first item
    service.addItem(mockProduct1);
    tick();

    expect(mockShopifyService.createCart).toHaveBeenCalledTimes(1);

    // Add second item
    service.addItem(mockProduct2);
    tick();

    expect(mockShopifyService.createCart).toHaveBeenCalledTimes(1); // Still 1, did not recreate
    expect(mockShopifyService.addToCart).toHaveBeenCalledWith(
      'gid://shopify/Cart/test-cart-id',
      'gid://shopify/ProductVariant/201',
      1
    );

    expect(service.items().length).toBe(2);
    expect(service.items()[0].shopifyLineId).toBe('gid://shopify/CartLine/101');
    expect(service.items()[1].shopifyLineId).toBe('gid://shopify/CartLine/201');
  }));

  it('should update quantity and synchronize line IDs correctly', fakeAsync(() => {
    mockShopifyService.createCart.and.returnValue(Promise.resolve(mockCartResponse1));
    service.addItem(mockProduct1);
    tick();

    const updatedResponse: ShopifyCart = {
      ...mockCartResponse1,
      lines: [
        {
          ...mockCartResponse1.lines[0],
          quantity: 3
        }
      ]
    };
    mockShopifyService.updateCartLine.and.returnValue(Promise.resolve(updatedResponse));

    service.updateQuantity('gid://shopify/ProductVariant/101', 3);
    tick();

    expect(mockShopifyService.updateCartLine).toHaveBeenCalledWith(
      'gid://shopify/Cart/test-cart-id',
      'gid://shopify/CartLine/101',
      3
    );
    expect(service.items()[0].quantity).toBe(3);
    expect(service.items()[0].shopifyLineId).toBe('gid://shopify/CartLine/101');
  }));

  it('should remove item from cart on Shopify and local state', fakeAsync(() => {
    mockShopifyService.createCart.and.returnValue(Promise.resolve(mockCartResponse1));
    service.addItem(mockProduct1);
    tick();

    const emptyCartResponse: ShopifyCart = {
      ...mockCartResponse1,
      lines: []
    };
    mockShopifyService.removeFromCart.and.returnValue(Promise.resolve(emptyCartResponse));

    service.removeItem('gid://shopify/ProductVariant/101');
    tick();

    expect(mockShopifyService.removeFromCart).toHaveBeenCalledWith(
      'gid://shopify/Cart/test-cart-id',
      'gid://shopify/CartLine/101'
    );
    expect(service.items().length).toBe(0);
  }));

  it('should fallback to mock validation of TARHANA20 when Shopify is not configured', fakeAsync(() => {
    // If shopify is not configured, applyDiscount returns true for TARHANA20
    let success: boolean = false;
    service.applyDiscount('TARHANA20').then(res => success = res);
    tick();

    expect(success).toBeTrue();
    expect(service.discountAmount()).toBe(20);

    // Any invalid code should return false
    let successInvalid: boolean = true;
    service.applyDiscount('INVALID').then(res => successInvalid = res);
    tick();

    expect(successInvalid).toBeFalse();
    expect(service.discountAmount()).toBe(0);
  }));

  it('should apply discount through Shopify and compute discount amount dynamically', fakeAsync(() => {
    mockShopifyService.createCart.and.returnValue(Promise.resolve(mockCartResponse1));
    service.addItem(mockProduct1);
    tick();

    const discountedCartResponse: ShopifyCart = {
      ...mockCartResponse1,
      discountCodes: [{ code: 'TARHANA20', applicable: true }],
      cost: {
        totalAmount: { amount: '109.0', currencyCode: 'SEK' },
        subtotalAmount: { amount: '129.0', currencyCode: 'SEK' }
      }
    };

    mockShopifyService.applyDiscount.and.returnValue(Promise.resolve(discountedCartResponse));

    let success: boolean = false;
    service.applyDiscount('TARHANA20').then(res => success = res);
    tick();

    expect(mockShopifyService.applyDiscount).toHaveBeenCalledWith('gid://shopify/Cart/test-cart-id', ['TARHANA20']);
    expect(success).toBeTrue();
    expect(service.discountAmount()).toBe(20); // 129.0 - 109.0
  }));
});
