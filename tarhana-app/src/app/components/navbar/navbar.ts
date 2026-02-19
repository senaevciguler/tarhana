import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { DarkModeToggleComponent } from '../dark-mode-toggle/dark-mode-toggle';
import { LanguageService } from '../../services/language.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, DarkModeToggleComponent, TranslatePipe],
  templateUrl: './navbar.component.html',
})
export class NavbarComponent {
  private languageService = inject(LanguageService);

  switchLanguage(lang: 'sv' | 'en') {
    this.languageService.switchLanguage(lang);
  }

  getCurrentLang() {
    return this.languageService.getCurrentLang()();
  }
}
