import { Component, inject, effect } from '@angular/core';
import { NavbarComponent } from '../../components/navbar/navbar';
import { FooterComponent } from '../../components/footer/footer';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { SeoService } from '../../services/seo.service';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [NavbarComponent, FooterComponent, RouterLink, TranslatePipe],
  templateUrl: './home.component.html',
})
export class HomeComponent {
  private seoService = inject(SeoService);
  private langService = inject(LanguageService);

  constructor() {
    effect(() => {
      // Trigger update when language changes
      this.langService.language();
      this.seoService.updateMetaTags({
        title: this.langService.translate('SEO_HOME_TITLE'),
        description: this.langService.translate('SEO_HOME_DESC'),
        image: '/assets/hero-tarhana-soup.png'
      });
    });
  }
}
