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
  checkoutForm!: FormGroup;
  orderPlaced = false;
  orderReference = '';
  selectedPaymentMethod = 'card';
  quantity = 1;
  pricePerItem = 129;
  shippingCost = 49;
  promoCode = '';
  discount = 0;

  product = {
    name: 'The Classic Tarhana',
    variant: 'Original / 500g',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDjaTiPnsI61uxKff57YDNfgbjKDiWdMvFSHp0jX89oKuyxARwdGUeaFVPAWipDO8AZCXPFZTgCSDLtbRfoqGoiORYn7peqxl_PglDuZBacidPiGJCRC7ov0OphhkiXL6jhaNCyEH4zP-6VVMnatWTt8hpUOuwl3or9mNCE3KM9hCRenphP_WIu02VBMBbfOaCcNA0W-lpjMQIF85vKOllNwl7Ccdi6GD9XKP4icgl5SbtA84lV6wClevwqpw6fghO3Nlo36Evs4Wk',
  };

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.initForm();
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

  incrementQuantity() {
    this.quantity++;
  }

  decrementQuantity() {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  get subtotal() {
    return this.quantity * this.pricePerItem;
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

  placeOrder() {
    if (this.checkoutForm.valid) {
      this.orderReference = 'TRH-' + Math.random().toString(36).substr(2, 9).toUpperCase();
      this.orderPlaced = true;
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
      case 'apple':
        return 'CHECKOUT.APPLE_PAY';
      case 'swish':
        return 'CHECKOUT.SWISH';
      case 'card':
        return 'CHECKOUT.CARD';
      case 'klarna':
        return 'CHECKOUT.KLARNA';
      default:
        return method;
    }
  }
}
