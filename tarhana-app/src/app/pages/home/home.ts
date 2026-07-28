import { Component, inject, effect, ChangeDetectionStrategy } from '@angular/core';
import { NavbarComponent } from '../../components/navbar/navbar';
import { FooterComponent } from '../../components/footer/footer';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { SeoService } from '../../services/seo.service';
import { LanguageService } from '../../services/language.service';
import { EllaCharacterComponent } from '../../components/ella-character/ella-character';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [NavbarComponent, FooterComponent, RouterLink, TranslatePipe, EllaCharacterComponent],
  templateUrl: './home.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  private seoService = inject(SeoService);
  private langService = inject(LanguageService);

  constructor() {
    effect(() => {
      const title = this.langService.translate('SEO_HOME_TITLE');
      const desc = this.langService.translate('SEO_HOME_DESC');

      this.seoService.updateMeta(title, desc);
      this.seoService.updateCanonical();
      this.seoService.updateJsonLd(null);
    });
  }
}
