import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LanguageService } from '../../services/language.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, TranslatePipe],
  templateUrl: './navbar.component.html',
})
export class NavbarComponent {
  private langService = inject(LanguageService);
  currentLang = this.langService.getCurrentLang();

  switchLanguage(lang: string) {
    this.langService.switchLanguage(lang);
  }
}
