import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CartService } from '../../services/cart.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { RouterLink } from '@angular/router';
import { EllaCharacterComponent } from '../ella-character/ella-character';

@Component({
  selector: 'app-cart-drawer',
  standalone: true,
  imports: [TranslatePipe, RouterLink, EllaCharacterComponent],
  templateUrl: './cart-drawer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CartDrawerComponent {
  cartService = inject(CartService);

  close() {
    this.cartService.closeDrawer();
  }

  updateQuantity(variantId: string, quantity: number) {
    this.cartService.updateQuantity(variantId, quantity);
  }

  removeItem(variantId: string) {
    this.cartService.removeItem(variantId);
  }
}
