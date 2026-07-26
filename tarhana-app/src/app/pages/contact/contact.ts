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

    const name = this.contactForm.get('name')?.value;
    const email = this.contactForm.get('email')?.value;
    const message = this.contactForm.get('message')?.value;

    const service = SHOPIFY_CONFIG.contactFormService;
    const key = SHOPIFY_CONFIG.contactFormKey;

    if (service === 'web3forms' && key) {
      const payload = {
        access_key: key,
        name: name,
        email: email,
        message: message,
        subject: "New Contact Message - Ella's Pantry",
        from_name: "Ella's Pantry Storefront"
      };
      this.http.post('https://api.web3forms.com/submit', payload).subscribe({
        next: (response: any) => {
          this.isSubmitting.set(false);
          if (response && (response.success || response.status === 200)) {
            this.submitSuccess.set(true);
            this.contactForm.reset();
          } else {
            this.submitError.set(true);
          }
        },
        error: (err) => {
          console.error('Web3Forms submission failed:', err);
          this.isSubmitting.set(false);
          this.submitError.set(true);
        }
      });
    } else if (service === 'formspree' && key) {
      const payload = {
        name: name,
        email: email,
        message: message
      };
      this.http.post(`https://formspree.io/f/${key}`, payload).subscribe({
        next: (response: any) => {
          this.isSubmitting.set(false);
          this.submitSuccess.set(true);
          this.contactForm.reset();
        },
        error: (err) => {
          console.error('Formspree submission failed:', err);
          this.isSubmitting.set(false);
          this.submitError.set(true);
        }
      });
    } else {
      // Mock API submission for local development and testing
      setTimeout(() => {
        this.isSubmitting.set(false);
        this.submitSuccess.set(true);
        console.log('Contact form submitted successfully (mocked):', { name, email, message });
        this.contactForm.reset();
      }, 1200);
    }
  }

  private markAllTouched() {
    Object.values(this.contactForm.controls).forEach(control => {
      control.markAsTouched();
    });
  }
}
