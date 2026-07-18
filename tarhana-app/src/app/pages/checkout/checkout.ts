import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from '../../components/navbar/navbar';
import { FooterComponent } from '../../components/footer/footer';
import { RouterLink } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { LanguageService } from '../../services/language.service';
import { CartService } from '../../services/cart.service';
import { ShopifyService } from '../../services/shopify.service';
import { ShippingService } from '../../services/shipping.service';
import { SHOPIFY_CONFIG } from '../../shopify.config';
import { inject } from '@angular/core';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    NavbarComponent,
    FooterComponent,
    RouterLink,
    ReactiveFormsModule,
    FormsModule,
    CommonModule,
    TranslatePipe,
  ],
  templateUrl: './checkout.component.html',
})
export class CheckoutComponent implements OnInit {
  langService = inject(LanguageService);
  cartService = inject(CartService);
  shopifyService = inject(ShopifyService);
  shippingService = inject(ShippingService);
  checkoutForm!: FormGroup;
  orderPlaced = false;
  orderReference = '';
  selectedPaymentMethod = 'card';
  promoCode = '';
  discount = 0;

  get shippingCost() {
    if (!this.checkoutForm) {
      return this.shippingService.calculateShipping(this.subtotal, 'Sweden', 'home');
    }
    const country = this.checkoutForm.get('shipping.country')?.value || 'Sweden';
    const deliveryMethod = this.checkoutForm.get('shipping.deliveryMethod')?.value || 'home';
    return this.shippingService.calculateShipping(this.subtotal, country, deliveryMethod);
  }

  // Pre-launch safety
  enableCheckout = SHOPIFY_CONFIG.enableCheckout;

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    console.log('Checkout loaded');
    this.initForm();
    console.log(this.checkoutForm);
  }

  initForm() {
    this.checkoutForm = this.fb.group({
      customer: this.fb.group({
        fullName: ['', [Validators.required, Validators.minLength(3)]],
        email: ['', [Validators.required, Validators.email]],
        phone: ['', [Validators.required]],
      }),
      shipping: this.fb.group({
        address: ['', [Validators.required]],
        postalCode: ['', [Validators.required]],
        city: ['', [Validators.required]],
        country: ['Sweden', [Validators.required]],
        deliveryMethod: ['home', [Validators.required]],
        deliveryNotes: [''],
      }),
      payment: this.fb.group({
        method: ['card'],
        card: this.fb.group({
          cardNumber: ['', [Validators.pattern('^[0-9]{16}$')]],
          expiry: ['', [Validators.pattern('^(0[1-9]|1[0-2])\\/([0-9]{2})$')]],
          cvc: ['', [Validators.pattern('^[0-9]{3,4}$')]],
          nameOnCard: [''],
        }),
        swish: this.fb.group({
          phone: ['', [Validators.pattern('^[0-9\\+\\-\\s]{8,15}$')]],
        }),
      }),
    });

    // Handle payment method changes for validation
    this.checkoutForm.get('payment.method')?.valueChanges.subscribe((method) => {
      this.selectedPaymentMethod = method;
      this.updatePaymentValidators(method);
    });
  }

  updatePaymentValidators(method: string) {
    const cardGroup = this.checkoutForm.get('payment.card') as FormGroup;
    const swishGroup = this.checkoutForm.get('payment.swish') as FormGroup;

    if (method === 'card') {
      cardGroup.get('cardNumber')?.setValidators([Validators.required, Validators.pattern('^[0-9 ]{16,19}$')]);
      cardGroup.get('expiry')?.setValidators([Validators.required, Validators.pattern('^(0[1-9]|1[0-2])\\/([0-9]{2})$')]);
      cardGroup.get('cvc')?.setValidators([Validators.required, Validators.pattern('^[0-9]{3,4}$')]);
      cardGroup.get('nameOnCard')?.setValidators([Validators.required]);
      swishGroup.get('phone')?.clearValidators();
    } else if (method === 'swish') {
      swishGroup.get('phone')?.setValidators([Validators.required, Validators.pattern('^[0-9\\+\\-\\s]{8,15}$')]);
      cardGroup.get('cardNumber')?.clearValidators();
      cardGroup.get('expiry')?.clearValidators();
      cardGroup.get('cvc')?.clearValidators();
      cardGroup.get('nameOnCard')?.clearValidators();
    } else {
      cardGroup.get('cardNumber')?.clearValidators();
      cardGroup.get('expiry')?.clearValidators();
      cardGroup.get('cvc')?.clearValidators();
      cardGroup.get('nameOnCard')?.clearValidators();
      swishGroup.get('phone')?.clearValidators();
    }

    cardGroup.get('cardNumber')?.updateValueAndValidity();
    cardGroup.get('expiry')?.updateValueAndValidity();
    cardGroup.get('cvc')?.updateValueAndValidity();
    cardGroup.get('nameOnCard')?.updateValueAndValidity();
    swishGroup.get('phone')?.updateValueAndValidity();
  }

  incrementQuantity(variantId: string, currentQuantity: number) {
    this.cartService.updateQuantity(variantId, currentQuantity + 1);
  }

  decrementQuantity(variantId: string, currentQuantity: number) {
    this.cartService.updateQuantity(variantId, currentQuantity - 1);
  }

  get subtotal() {
    return this.cartService.subtotal();
  }

  get total() {
    return this.subtotal + this.shippingCost - this.discount;
  }

  applyPromoCode() {
    if (this.promoCode.toUpperCase() === 'TARHANA20') {
      this.discount = 20;
    } else {
      this.discount = 0;
    }
  }

  selectPaymentMethod(method: string) {
    this.checkoutForm.get('payment.method')?.setValue(method);
  }

  async placeOrder() {
    console.log('PLACE ORDER CLICKED');
    if (this.enableCheckout) {
      console.log('Checkout başladı');
        const checkoutUrl = await this.cartService.getCheckoutUrl();
          console.log(checkoutUrl);
        if (checkoutUrl) {
            window.location.href = checkoutUrl;
        } else {
            console.error('Failed to get Shopify checkout URL');
            // Fallback to internal message if Shopify fails
            this.orderReference = 'ERR-SHOPIFY';
            this.orderPlaced = true;
        }
        return;
    }

    if (this.checkoutForm.valid) {
      this.orderReference = 'TRH-' + Math.random().toString(36).substr(2, 9).toUpperCase();
      this.orderPlaced = true;
      this.cartService.clearCart();
      window.scrollTo(0, 0);
    } else {
      this.markFormGroupTouched(this.checkoutForm);
    }
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched();
      if ((control as any).controls) {
        this.markFormGroupTouched(control as FormGroup);
      }
    });
  }

  getPaymentMethodLabel(method: string): string {
    switch (method) {
      case 'apple': return this.langService.translate('CHECKOUT_PAYMENT_APPLE');
      case 'swish': return this.langService.translate('CHECKOUT_PAYMENT_SWISH');
      case 'card': return this.langService.translate('CHECKOUT_PAYMENT_CARD');
      case 'klarna': return this.langService.translate('CHECKOUT_PAYMENT_KLARNA');
      default: return method;
    }
  }
}
