import { Component, signal, ChangeDetectionStrategy, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { HttpClient } from '@angular/common/http';
import { SHOPIFY_CONFIG } from '../../shopify.config';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, TranslatePipe, FormsModule],
  templateUrl: './footer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterComponent {
  private http = inject(HttpClient);

  email = signal('');
  newsletterSuccess = signal(false);
  newsletterError = signal(false);
  newsletterSubmitting = signal(false);

  subscribeNewsletter() {
    const emailVal = this.email().trim();
    const emailPattern = /^[a-zA-Z0-9._%+-]+&#64;[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    // Support standard email validation
    const standardEmailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!emailVal || (!emailPattern.test(emailVal) && !standardEmailPattern.test(emailVal))) {
      this.newsletterError.set(true);
      this.newsletterSuccess.set(false);
      return;
    }

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
          }
        },
        error: (err) => {
          console.error('Web3Forms newsletter subscription failed:', err);
          this.newsletterSubmitting.set(false);
          this.newsletterError.set(true);
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
        }
      });
    } else {
      // Mock API submission for local development and testing
      setTimeout(() => {
        this.newsletterSubmitting.set(false);
        this.newsletterSuccess.set(true);
        console.log('Newsletter subscription email (mocked):', emailVal);
        this.email.set('');
      }, 1000);
    }
  }
}
