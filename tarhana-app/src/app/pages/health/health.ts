import { Component, inject, effect } from '@angular/core';
import { NavbarComponent } from '../../components/navbar/navbar';
import { FooterComponent } from '../../components/footer/footer';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { SeoService } from '../../services/seo.service';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-health',
  standalone: true,
  imports: [NavbarComponent, FooterComponent, TranslatePipe],
  templateUrl: './health.component.html',
})
export class HealthComponent {
  private seoService = inject(SeoService);
  private langService = inject(LanguageService);

  constructor() {
    effect(() => {
      this.langService.language();
      this.seoService.updateMetaTags({
        title: this.langService.translate('SEO_HEALTH_TITLE'),
        description: this.langService.translate('SEO_HEALTH_DESC')
      });
    });
  }
}
