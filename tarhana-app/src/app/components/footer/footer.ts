import { Component, signal, ChangeDetectionStrategy, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { HttpClient } from '@angular/common/http';
import { SHOPIFY_CONFIG } from '../../shopify.config';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, TranslatePipe, FormsModule],
  templateUrl: './footer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterComponent {
  private http = inject(HttpClient);
  private langService = inject(LanguageService); // Inject LanguageService for translations

  email = signal('');
  newsletterSuccess = signal(false);
  newsletterError = signal(false);
  newsletterSubmitting = signal(false);
  newsletterErrorMessage = signal<string | null>(null);

  subscribeNewsletter() {
    const emailVal = this.email().trim();
    const emailPattern = /^[a-zA-Z0-9._%+-]+&#64;[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    // Support standard email validation
    const standardEmailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!emailVal || (!emailPattern.test(emailVal) && !standardEmailPattern.test(emailVal))) {
      this.newsletterErrorMessage.set(null);
      this.newsletterError.set(true);
      this.newsletterSuccess.set(false);
      return;
    }

    this.newsletterErrorMessage.set(null);
    this.newsletterError.set(false);
    this.newsletterSubmitting.set(true);
    this.newsletterSuccess.set(false);

    const service = SHOPIFY_CONFIG.contactFormService;
    const key = SHOPIFY_CONFIG.contactFormKey;

    if (service === 'web3forms' && key) {
      const payload = {
        access_key: key,
        email: emailVal,
        subject: "New Newsletter Subscriber - Ella's Pantry",
        from_name: "Ella's Pantry Storefront",
        message: `A new visitor has subscribed to the newsletter: ${emailVal}`
      };
      this.http.post('https://api.web3forms.com/submit', payload).subscribe({
        next: (response: any) => {
          this.newsletterSubmitting.set(false);
          if (response && (response.success || response.status === 200)) {
            this.newsletterSuccess.set(true);
            this.email.set('');
          } else {
            this.newsletterError.set(true);
            if (response && response.message) {
              this.newsletterErrorMessage.set(response.message);
            }
          }
        },
        error: (err) => {
          console.error('Web3Forms newsletter subscription failed:', err);
          this.newsletterSubmitting.set(false);
          this.newsletterError.set(true);
          if (err && err.error && err.error.message) {
            this.newsletterErrorMessage.set(err.error.message);
          }
        }
      });
    } else if (service === 'formspree' && key) {
      const payload = {
        email: emailVal,
        message: `Newsletter subscription signup from Ella's Pantry Storefront: ${emailVal}`
      };
      this.http.post(`https://formspree.io/f/${key}`, payload).subscribe({
        next: (response: any) => {
          this.newsletterSubmitting.set(false);
          this.newsletterSuccess.set(true);
          this.email.set('');
        },
        error: (err) => {
          console.error('Formspree newsletter subscription failed:', err);
          this.newsletterSubmitting.set(false);
          this.newsletterError.set(true);
          if (err && err.error && err.error.error) {
            this.newsletterErrorMessage.set(err.error.error);
          }
        }
      });
    } else {
      // Unconfigured / Mock flow: block fake success and set error
      this.newsletterSubmitting.set(false);
      this.newsletterError.set(true);
      this.newsletterSuccess.set(false);
      const msg = this.langService.translate('FOOTER_NEWSLETTER_UNCONFIGURED');
      this.newsletterErrorMessage.set(msg);
      console.warn('Newsletter subscription blocked: Real email sending is unconfigured (mock mode active). To enable, paste your Web3Forms Access Key or Formspree Form ID in SHOPIFY_CONFIG.');
    }
  }
}
