import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductsComponent } from './products';
import { provideRouter } from '@angular/router';
import { ShopifyService } from '../../services/shopify.service';
import { LanguageService } from '../../services/language.service';
import { signal } from '@angular/core';
import { ShopifyProduct } from '../../services/shopify.types';

describe('ProductsComponent', () => {
  let component: ProductsComponent;
  let fixture: ComponentFixture<ProductsComponent>;
  let mockProductsSignal = signal<ShopifyProduct[]>([]);

  const mockShopifyService = {
    getProducts: () => mockProductsSignal,
    fetchProducts: () => Promise.resolve([])
  };

  const mockLanguageService = {
    translate: (key: string) => {
      const mockTranslations: Record<string, string> = {
        'PRODUCT_OUT_OF_STOCK': 'Out of stock',
        'PRODUCT_ONLY_LEFT': 'Only {count} left',
        'PRODUCT_ADD_TO_CART': 'Add to cart'
      };
      return mockTranslations[key] || key;
    },
    language: signal('EN'),
    setLanguage: () => Promise.resolve()
  };

  beforeEach(async () => {
    mockProductsSignal.set([
      {
        id: 'gid://shopify/Product/1',
        handle: 'original-fermented-soup-mix',
        title: 'Original Fermented Soup Mix',
        description: 'Warm, savory and gently tangy.',
        price: 120,
        currency: 'kr',
        image: 'original.jpg',
        variantId: 'gid://shopify/ProductVariant/101',
        tags: ['Fermented'],
        weight: '250g',
        variantLabel: 'With salt',
        availableForSale: true,
        quantityAvailable: 50,
        compareAtPrice: 150
      },
      {
        id: 'gid://shopify/Product/2',
        handle: 'low-stock-product',
        title: 'Low Stock Soup Mix',
        description: 'Soft flavor.',
        price: 129,
        currency: 'kr',
        image: 'low-stock.jpg',
        variantId: 'gid://shopify/ProductVariant/102',
        tags: ['Low Stock'],
        weight: '250g',
        variantLabel: 'Low Stock',
        availableForSale: true,
        quantityAvailable: 5,
        compareAtPrice: null
      },
      {
        id: 'gid://shopify/Product/3',
        handle: 'out-of-stock-product',
        title: 'Out of Stock Soup Mix',
        description: 'Out of stock.',
        price: 129,
        currency: 'kr',
        image: 'out-of-stock.jpg',
        variantId: 'gid://shopify/ProductVariant/103',
        tags: ['Out of Stock'],
        weight: '250g',
        variantLabel: 'Out of stock',
        availableForSale: false,
        quantityAvailable: 0,
        compareAtPrice: null
      }
    ]);

    await TestBed.configureTestingModule({
      imports: [ProductsComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        { provide: ShopifyService, useValue: mockShopifyService },
        { provide: LanguageService, useValue: mockLanguageService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should calculate discount percentage correctly', () => {
    const discountedProduct = mockProductsSignal()[0];
    const percentage = component.getDiscountPercentage(discountedProduct);
    expect(percentage).toBe(20); // (150 - 120) / 150 * 100 = 20%

    const nonDiscountedProduct = mockProductsSignal()[1];
    expect(component.getDiscountPercentage(nonDiscountedProduct)).toBe(0);
  });

  it('should format getOnlyLeftText correctly', () => {
    expect(component.getOnlyLeftText(5)).toBe('Only 5 left');
    expect(component.getOnlyLeftText(1)).toBe('Only 1 left');
  });

  it('should render compare-at price and discount percentage badge for discounted products', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    // Check first card has compare-at price and discount badge
    const firstCard = compiled.querySelector('#product-card-original-fermented-soup-mix');
    expect(firstCard).toBeTruthy();

    const compareAtText = firstCard?.querySelector('.line-through')?.textContent;
    expect(compareAtText).toContain('150 kr');

    const discountBadge = firstCard?.querySelector('.bg-primary')?.textContent;
    expect(discountBadge).toContain('-20%');
  });

  it('should show only left message when quantity available is below 10', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    const secondCard = compiled.querySelector('#product-card-low-stock-product');
    expect(secondCard).toBeTruthy();

    const lowStockAlert = secondCard?.querySelector('.text-amber-600')?.textContent;
    expect(lowStockAlert).toContain('Only 5 left');
  });

  it('should show out of stock badge and disable Add to Cart button when product is unavailable', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    const thirdCard = compiled.querySelector('#product-card-out-of-stock-product');
    expect(thirdCard).toBeTruthy();

    const outOfStockAlert = thirdCard?.querySelector('.text-rose-600')?.textContent;
    expect(outOfStockAlert).toContain('Out of stock');

    const button = thirdCard?.querySelector('button') as HTMLButtonElement;
    expect(button).toBeTruthy();
    expect(button.disabled).toBeTrue();
    expect(button.textContent).toContain('Out of stock');
  });
});
