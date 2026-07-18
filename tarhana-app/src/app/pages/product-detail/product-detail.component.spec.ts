import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductDetailComponent } from './product-detail.component';
import { provideRouter, ActivatedRoute, convertToParamMap } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { LanguageService } from '../../services/language.service';
import { ShopifyService } from '../../services/shopify.service';
import { CartService } from '../../services/cart.service';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { ShopifyProduct } from '../../services/shopify.types';

describe('ProductDetailComponent', () => {
  let component: ProductDetailComponent;
  let fixture: ComponentFixture<ProductDetailComponent>;
  let mockShopifyService: jasmine.SpyObj<ShopifyService>;
  let cartService: CartService;

  const mockProduct: ShopifyProduct = {
    id: 'gid://shopify/Product/1',
    handle: 'original-fermented-soup-mix',
    title: 'Original Fermented Soup Mix',
    description: 'A naturally fermented soup mix inspired by traditional tarhana.',
    price: 129,
    currency: 'kr',
    image: 'https://example.com/original.jpg',
    variantId: 'gid://shopify/ProductVariant/101',
    tags: ['Naturally fermented', 'No additives'],
    weight: '250g',
    variantLabel: 'Standard Pack',
    availableForSale: true,
    quantityAvailable: 15,
    compareAtPrice: 159,
    images: ['https://example.com/original.jpg', 'https://example.com/original-2.jpg'],
    variants: [
      {
        id: 'gid://shopify/ProductVariant/101',
        title: 'Standard Pack',
        price: 129,
        currency: 'kr',
        availableForSale: true,
        quantityAvailable: 15,
        compareAtPrice: 159
      },
      {
        id: 'gid://shopify/ProductVariant/102',
        title: 'Value Pack (500g)',
        price: 229,
        currency: 'kr',
        availableForSale: true,
        quantityAvailable: 5,
        compareAtPrice: 259
      },
      {
        id: 'gid://shopify/ProductVariant/103',
        title: 'Out Of Stock Pack',
        price: 49,
        currency: 'kr',
        availableForSale: false,
        quantityAvailable: 0,
        compareAtPrice: null
      }
    ]
  };

  beforeEach(async () => {
    mockShopifyService = jasmine.createSpyObj('ShopifyService', ['fetchProduct', 'createCart', 'addToCart', 'updateCartLine', 'removeFromCart']);
    mockShopifyService.fetchProduct.and.returnValue(Promise.resolve(mockProduct));

    await TestBed.configureTestingModule({
      imports: [ProductDetailComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(convertToParamMap({ handle: 'original-fermented-soup-mix' }))
          }
        },
        {
          provide: ShopifyService,
          useValue: mockShopifyService
        },
        {
          provide: LanguageService,
          useValue: {
            translate: (key: string) => key,
            language: signal('EN'),
            setLanguage: () => Promise.resolve()
          }
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductDetailComponent);
    component = fixture.componentInstance;
    cartService = TestBed.inject(CartService);
    spyOn(cartService, 'addItem').and.callThrough();

    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('should create and load product', () => {
    expect(component).toBeTruthy();
    expect(component.product()).toEqual(mockProduct);
    expect(component.loading()).toBeFalse();
  });

  it('should display product title, description and initial pricing info', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('#product-title')?.textContent).toContain('Original Fermented Soup Mix');
    expect(compiled.querySelector('#product-description')?.textContent).toContain('A naturally fermented soup mix inspired by traditional tarhana.');
    expect(compiled.querySelector('#product-price')?.textContent).toContain('129 kr');
    expect(compiled.querySelector('#product-compare-at-price')?.textContent).toContain('159 kr');
    expect(compiled.querySelector('#product-discount-badge')?.textContent).toContain('Save 19%');
  });

  it('should select alternate image on click', () => {
    component.selectImage('https://example.com/original-2.jpg');
    fixture.detectChanges();
    expect(component.selectedImage()).toBe('https://example.com/original-2.jpg');
  });

  it('should select alternate variant and update details', () => {
    const valueVariant = mockProduct.variants![1];
    component.selectVariant(valueVariant);
    fixture.detectChanges();

    expect(component.selectedVariant()).toEqual(valueVariant);
    expect(component.currentPrice()).toBe(229);
    expect(component.compareAtPrice()).toBe(259);
    expect(component.discountPercentage()).toBe(12); // (259 - 229) / 259 = 11.58% -> 12%
    expect(component.quantityAvailable()).toBe(5);
  });

  it('should correctly increment and decrement quantity limited by stock', () => {
    expect(component.quantity()).toBe(1);

    component.incrementQuantity();
    fixture.detectChanges();
    expect(component.quantity()).toBe(2);

    // Set variant with stock level 5
    component.selectVariant(mockProduct.variants![1]); // stock 5
    fixture.detectChanges();

    component.quantity.set(4);
    component.incrementQuantity();
    fixture.detectChanges();
    expect(component.quantity()).toBe(5);

    component.incrementQuantity(); // should not exceed 5
    fixture.detectChanges();
    expect(component.quantity()).toBe(5);

    component.decrementQuantity();
    fixture.detectChanges();
    expect(component.quantity()).toBe(4);
  });

  it('should disable add to cart and show out of stock when selected variant is unavailable', () => {
    const oosVariant = mockProduct.variants![2];
    component.selectVariant(oosVariant);
    fixture.detectChanges();

    expect(component.isAvailable()).toBeFalse();

    const compiled = fixture.nativeElement as HTMLElement;
    const button = compiled.querySelector('#product-add-to-cart-btn') as HTMLButtonElement;
    expect(button.disabled).toBeTrue();
  });

  it('should add correct product structure and quantity to cart', () => {
    component.quantity.set(3);
    component.addToCart();

    expect(cartService.addItem).toHaveBeenCalledTimes(3);
    expect(cartService.addItem).toHaveBeenCalledWith(jasmine.objectContaining({
      id: mockProduct.id,
      variantId: mockProduct.variants![0].id,
      price: 129
    }));
  });
});
