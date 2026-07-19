import { Component, inject, effect } from '@angular/core';
import { NavbarComponent } from '../../components/navbar/navbar';
import { FooterComponent } from '../../components/footer/footer';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { SeoService } from '../../services/seo.service';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-story',
  standalone: true,
  imports: [NavbarComponent, FooterComponent, RouterLink, TranslatePipe],
  templateUrl: './story.component.html',
})
export class StoryComponent {
  private seoService = inject(SeoService);
  private langService = inject(LanguageService);

  constructor() {
    effect(() => {
      this.langService.language();
      this.seoService.updateMetaTags({
        title: this.langService.translate('SEO_STORY_TITLE'),
        description: this.langService.translate('SEO_STORY_DESC')
      });
    });
  }
}
