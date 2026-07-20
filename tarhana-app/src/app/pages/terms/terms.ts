import { Component, inject, effect, ChangeDetectionStrategy } from '@angular/core';
import { NavbarComponent } from '../../components/navbar/navbar';
import { FooterComponent } from '../../components/footer/footer';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { SeoService } from '../../services/seo.service';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-terms',
  standalone: true,
  imports: [NavbarComponent, FooterComponent, TranslatePipe],
  templateUrl: './terms.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TermsComponent {
  private seoService = inject(SeoService);
  private langService = inject(LanguageService);

  constructor() {
    effect(() => {
      const title = this.langService.translate('SEO_TERMS_TITLE');
      const desc = this.langService.translate('SEO_TERMS_DESC');

      this.seoService.updateMeta(title, desc);
      this.seoService.updateCanonical();
      this.seoService.updateJsonLd(null);
    });
  }
}
