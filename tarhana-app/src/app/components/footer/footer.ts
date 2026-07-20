import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, TranslatePipe, FormsModule],
  templateUrl: './footer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterComponent {
  email = signal('');
  newsletterSuccess = signal(false);
  newsletterError = signal(false);

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
    this.newsletterSuccess.set(true);
    console.log('Newsletter subscription email:', emailVal);
    this.email.set('');
  }
}
