import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LanguageService } from '../../services/language.service';
import { CartService } from '../../services/cart.service';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { CartDrawerComponent } from '../cart-drawer/cart-drawer';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule, TranslatePipe, CartDrawerComponent],
  templateUrl: './navbar.component.html',
})
export class NavbarComponent {
  langService = inject(LanguageService);
  cartService = inject(CartService);

  setLanguage(lang: 'SV' | 'EN') {
    this.langService.setLanguage(lang);
  }

  toggleCart() {
    this.cartService.toggleDrawer();
  }
}
