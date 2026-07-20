import { Component, inject, effect, ChangeDetectionStrategy } from '@angular/core';
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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StoryComponent {
  private seoService = inject(SeoService);
  private langService = inject(LanguageService);

  constructor() {
    effect(() => {
      const title = this.langService.translate('SEO_STORY_TITLE');
      const desc = this.langService.translate('SEO_STORY_DESC');

      this.seoService.updateMeta(title, desc);
      this.seoService.updateCanonical();
      this.seoService.updateJsonLd(null);
    });
  }
}
