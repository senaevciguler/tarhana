import { Component, inject, effect, ChangeDetectionStrategy, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NavbarComponent } from '../../components/navbar/navbar';
import { FooterComponent } from '../../components/footer/footer';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { SeoService } from '../../services/seo.service';
import { LanguageService } from '../../services/language.service';

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

    // Mock API submission
    setTimeout(() => {
      this.isSubmitting.set(false);
      // Simulate successful response
      this.submitSuccess.set(true);
      console.log('Contact form submitted successfully:', this.contactForm.value);
      this.contactForm.reset();
    }, 1200);
  }

  private markAllTouched() {
    Object.values(this.contactForm.controls).forEach(control => {
      control.markAsTouched();
    });
  }
}
