import { Component, inject, ChangeDetectionStrategy, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LanguageService } from '../../services/language.service';
import { CartService } from '../../services/cart.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { CartDrawerComponent } from '../cart-drawer/cart-drawer';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, TranslatePipe, CartDrawerComponent],
  templateUrl: './navbar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarComponent {
  langService = inject(LanguageService);
  cartService = inject(CartService);

  isMenuOpen = signal(false);

  setLanguage(lang: 'SV' | 'EN') {
    this.langService.setLanguage(lang);
  }

  toggleCart() {
    this.cartService.toggleDrawer();
  }

  toggleMenu() {
    this.isMenuOpen.update((v) => {
      const next = !v;
      if (typeof document !== 'undefined') {
        document.body.style.overflow = next ? 'hidden' : '';
      }
      return next;
    });
  }

  closeMenu() {
    this.isMenuOpen.set(false);
    if (typeof document !== 'undefined') {
      document.body.style.overflow = '';
    }
  }
}
