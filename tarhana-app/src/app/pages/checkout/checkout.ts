import { Component, OnInit, inject } from '@angular/core';
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
  private fb = inject(FormBuilder);
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
          cardNumber: ['', [Validators.pattern('^[0-9 ]{16,19}$')]],
          expiry: ['', [Validators.pattern('^(0[1-9]|1[0-2])\\/([0-9]{2})$')]],
          cvc: ['', [Validators.pattern('^[0-9]{3,4}$')]],
          nameOnCard: [''],
        }),
        swish: this.fb.group({
          phone: ['', [Validators.pattern('^[0-9\\+\\-\\s]{8,15}$')]],
        }),
      }),
    });

    this.checkoutForm.get('payment.method')?.valueChanges.subscribe((method) => {
      this.selectedPaymentMethod = method;
    });
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
      this.orderReference = 'TRH-' + Math.random().toString(36).substring(2, 9).toUpperCase();
      this.orderPlaced = true;
      window.scrollTo(0, 0);
    } else {
      this.markFormGroupTouched(this.checkoutForm);
    }
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach((control) => {
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else {
        control.markAsTouched();
      }
    });
  }

  getPaymentMethodLabel(method: string): string {
    switch (method) {
      case 'apple':
        return 'Apple Pay';
      case 'swish':
        return 'Swish';
      case 'card':
        return 'Card Payment';
      case 'klarna':
        return 'Klarna';
      default:
        return method;
    }
  }
}
