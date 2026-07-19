import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CheckoutComponent } from './checkout';
import { provideRouter } from '@angular/router';
import { LanguageService } from '../../services/language.service';
import { ShippingService } from '../../services/shipping.service';
import { signal } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { CartService } from '../../services/cart.service';

describe('CheckoutComponent', () => {
  let component: CheckoutComponent;
  let fixture: ComponentFixture<CheckoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CheckoutComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: LanguageService,
          useValue: {
            translate: (key: string) => {
              const mockTranslations: Record<string, string> = {
                'CHECKOUT_TITLE': 'Checkout',
                'CHECKOUT_COMING_SOON': 'Coming Soon',
                'CHECKOUT_PROMO_SUCCESS': 'Discount applied successfully!',
                'CHECKOUT_PROMO_INVALID': 'Invalid discount code',
                'CHECKOUT_PROMO_ERROR': 'Error applying discount code'
              };
              return mockTranslations[key] || key;
            },
            language: signal('EN'),
            setLanguage: () => Promise.resolve()
          }
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CheckoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render correct title based on checkout state', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    if (component.enableCheckout) {
      expect(compiled.querySelector('h1')?.textContent).toContain('Review your order');
    } else {
      expect(compiled.querySelector('h1')?.textContent).toContain('Coming Soon');
    }
  });

  it('should compute shippingCost based on form value of country and deliveryMethod', () => {
    const shippingService = TestBed.inject(ShippingService);
    spyOn(shippingService, 'calculateShipping').and.callThrough();

    // Trigger getter
    const cost = component.shippingCost;
    expect(shippingService.calculateShipping).toHaveBeenCalledWith(0, 'Sweden', 'home');
    expect(cost).toBe(49);

    // Change country to Norway
    component.checkoutForm.get('shipping.country')?.setValue('Norway');
    const costNorway = component.shippingCost;
    expect(shippingService.calculateShipping).toHaveBeenCalledWith(0, 'Norway', 'home');
    expect(costNorway).toBe(99);

    // Change deliveryMethod to pickup
    component.checkoutForm.get('shipping.deliveryMethod')?.setValue('pickup');
    const costPickup = component.shippingCost;
    expect(shippingService.calculateShipping).toHaveBeenCalledWith(0, 'Norway', 'pickup');
    expect(costPickup).toBe(0);
  });

  it('should update discount and total correctly when a valid discount code is applied', async () => {
    const cartService = TestBed.inject(CartService);
    const applyDiscountSpy = spyOn(cartService, 'applyDiscount').and.returnValue(
      Promise.resolve({ success: true, discountAmount: 25 })
    );

    component.promoCode = 'VALID25';
    await component.applyPromoCode();

    expect(applyDiscountSpy).toHaveBeenCalledWith('VALID25');
    expect(component.discount()).toBe(25);
    expect(component.promoSuccess()).toContain('Discount applied successfully!');
    expect(component.promoError()).toBe('');
  });

  it('should clear discount and display error message when an invalid discount code is applied', async () => {
    const cartService = TestBed.inject(CartService);
    const applyDiscountSpy = spyOn(cartService, 'applyDiscount').and.returnValue(
      Promise.resolve({ success: false, errorMessage: 'Invalid discount code' })
    );

    component.promoCode = 'WRONG';
    await component.applyPromoCode();

    expect(applyDiscountSpy).toHaveBeenCalledWith('WRONG');
    expect(component.discount()).toBe(0);
    expect(component.promoError()).toBe('Invalid discount code');
    expect(component.promoSuccess()).toBe('');
  });
});
