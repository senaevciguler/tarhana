import { Component, inject, effect, ChangeDetectionStrategy, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar';
import { FooterComponent } from '../../components/footer/footer';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { SeoService } from '../../services/seo.service';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-health',
  standalone: true,
  imports: [NavbarComponent, FooterComponent, TranslatePipe, RouterLink],
  templateUrl: './health.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HealthComponent {
  private seoService = inject(SeoService);
  private langService = inject(LanguageService);

  // Signal to track the currently active/expanded FAQ item index
  activeFaqIndex = signal<number | null>(null);

  constructor() {
    effect(() => {
      const title = this.langService.translate('SEO_HEALTH_TITLE');
      const desc = this.langService.translate('SEO_HEALTH_DESC');

      this.seoService.updateMeta(title, desc);
      this.seoService.updateCanonical();
      this.seoService.updateJsonLd(null);
    });
  }

  toggleFaq(index: number): void {
    if (this.activeFaqIndex() === index) {
      this.activeFaqIndex.set(null);
    } else {
      this.activeFaqIndex.set(index);
    }
  }
}
