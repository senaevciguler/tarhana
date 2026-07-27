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

    const key = SHOPIFY_CONFIG.contactFormKey;

    const payload = new FormData();
    payload.append('access_key', key);
    payload.append('email', emailVal);
    payload.append('subject', "New Newsletter Subscriber - Ella's Pantry");
    payload.append('from_name', "Ella's Pantry Storefront");
    payload.append('message', `A new visitor has subscribed to the newsletter: ${emailVal}`);

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
          } else {
            this.newsletterErrorMessage.set(this.langService.translate('FOOTER_NEWSLETTER_ERROR'));
          }
        }
      },
      error: (err) => {
        console.error('Web3Forms newsletter subscription failed:', err);
        this.newsletterSubmitting.set(false);
        this.newsletterError.set(true);
        if (err && err.error && err.error.message) {
          this.newsletterErrorMessage.set(err.error.message);
        } else {
          this.newsletterErrorMessage.set(this.langService.translate('CONTACT_ERROR_UNAVAILABLE'));
        }
      }
    });
  }
}
