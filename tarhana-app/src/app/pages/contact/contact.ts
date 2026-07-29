import { Component, inject, effect, ChangeDetectionStrategy, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NavbarComponent } from '../../components/navbar/navbar';
import { FooterComponent } from '../../components/footer/footer';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { SeoService } from '../../services/seo.service';
import { LanguageService } from '../../services/language.service';
import { HttpClient } from '@angular/common/http';
import { SHOPIFY_CONFIG } from '../../shopify.config';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [NavbarComponent, FooterComponent, RouterLink, ReactiveFormsModule, TranslatePipe],
  templateUrl: './contact.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactComponent {
  private fb = inject(FormBuilder);
  private seoService = inject(SeoService);
  private langService = inject(LanguageService);
  private http = inject(HttpClient);

  contactForm: FormGroup;
  isSubmitting = signal(false);
  submitSuccess = signal(false);
  submitError = signal(false);
  submitErrorMessage = signal<string | null>(null);

  constructor() {
    this.contactForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      message: ['', [Validators.required, Validators.minLength(10)]],
    });

    effect(() => {
      const title = this.langService.translate('SEO_CONTACT_TITLE');
      const desc = this.langService.translate('SEO_CONTACT_DESC');

      this.seoService.updateMeta(title, desc);
      this.seoService.updateCanonical();
      this.seoService.updateJsonLd(null);
    });
  }

  onSubmit() {
    if (this.contactForm.invalid) {
      this.markAllTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.submitSuccess.set(false);
    this.submitError.set(false);
    this.submitErrorMessage.set(null);

    const name = this.contactForm.get('name')?.value;
    const email = this.contactForm.get('email')?.value;
    const message = this.contactForm.get('message')?.value;

    const key = SHOPIFY_CONFIG.contactFormKey;

    const payload = new FormData();
    payload.append('access_key', key);
    payload.append('name', name);
    payload.append('email', email);
    payload.append('message', message);
    payload.append('subject', "New Contact Message - Ella's Pantry");
    payload.append('from_name', "Ella's Pantry Storefront");

    this.http.post('https://api.web3forms.com/submit', payload).subscribe({
      next: (response: any) => {
        this.isSubmitting.set(false);
        if (response && (response.success || response.status === 200)) {
          this.submitSuccess.set(true);
          this.contactForm.reset();
        } else {
          this.submitError.set(true);
          if (response && response.message) {
            this.submitErrorMessage.set(response.message);
          } else {
            this.submitErrorMessage.set(this.langService.translate('CONTACT_ERROR_GENERIC'));
          }
        }
      },
      error: (err) => {
        console.error('Web3Forms submission failed:', err);
        this.isSubmitting.set(false);
        this.submitError.set(true);
        if (err && err.error && err.error.message) {
          this.submitErrorMessage.set(err.error.message);
        } else {
          this.submitErrorMessage.set(this.langService.translate('CONTACT_ERROR_UNAVAILABLE'));
        }
      }
    });
  }

  private markAllTouched() {
    Object.values(this.contactForm.controls).forEach(control => {
      control.markAsTouched();
    });
  }
}
