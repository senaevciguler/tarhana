import { TestBed } from '@angular/core/testing';
import { AnalyticsService } from './analytics.service';
import { ShopifyProduct, CartItem } from './shopify.types';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let gtagSpy: jasmine.Spy;

  const mockProduct: ShopifyProduct = {
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

  const mockCartItems: CartItem[] = [
    {
      id: 'local-1',
      shopifyLineId: 'gid://shopify/CartLine/101',
      productId: 'gid://shopify/Product/1',
      variantId: 'gid://shopify/ProductVariant/101',
      title: 'Original Fermented Soup Mix',
      variantLabel: 'Original',
      price: 129,
      currency: 'kr',
      image: 'img1.jpg',
      quantity: 2
    }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AnalyticsService]
    });
    service = TestBed.inject(AnalyticsService);

    // Mock window.gtag
    (window as any).gtag = () => {};
    gtagSpy = spyOn(window as any, 'gtag');
  });

  afterEach(() => {
    // Clean up
    delete (window as any).gtag;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should track view_item event', () => {
    service.trackViewItem(mockProduct, 1);
    expect(gtagSpy).toHaveBeenCalledWith('event', 'view_item', {
      currency: 'kr',
      value: 129,
      items: [
        {
          item_id: 'gid://shopify/ProductVariant/101',
          item_name: 'Original Fermented Soup Mix',
          price: 129,
          quantity: 1,
          item_variant: 'Original'
        }
      ]
    });
  });

  it('should track add_to_cart event', () => {
    service.trackAddToCart(mockProduct, 2);
    expect(gtagSpy).toHaveBeenCalledWith('event', 'add_to_cart', {
      currency: 'kr',
      value: 258,
      items: [
        {
          item_id: 'gid://shopify/ProductVariant/101',
          item_name: 'Original Fermented Soup Mix',
          price: 129,
          quantity: 2,
          item_variant: 'Original'
        }
      ]
    });
  });

  it('should track begin_checkout event', () => {
    service.trackBeginCheckout(mockCartItems, 258, 'kr');
    expect(gtagSpy).toHaveBeenCalledWith('event', 'begin_checkout', {
      currency: 'kr',
      value: 258,
      items: [
        {
          item_id: 'gid://shopify/ProductVariant/101',
          item_name: 'Original Fermented Soup Mix',
          price: 129,
          quantity: 2,
          item_variant: 'Original'
        }
      ]
    });
  });

  it('should track purchase event', () => {
    service.trackPurchase(mockCartItems, 258, 'kr', 'TRH-TEST1234');
    expect(gtagSpy).toHaveBeenCalledWith('event', 'purchase', {
      transaction_id: 'TRH-TEST1234',
      currency: 'kr',
      value: 258,
      items: [
        {
          item_id: 'gid://shopify/ProductVariant/101',
          item_name: 'Original Fermented Soup Mix',
          price: 129,
          quantity: 2,
          item_variant: 'Original'
        }
      ]
    });
  });
});
