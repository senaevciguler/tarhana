import { Component, inject } from '@angular/core';
import { NavbarComponent } from '../../components/navbar/navbar';
import { FooterComponent } from '../../components/footer/footer';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { ShopifyService } from '../../services/shopify.service';
import { CartService } from '../../services/cart.service';
import { CommonModule } from '@angular/common';
import { ShopifyProduct } from '../../services/shopify.types';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [NavbarComponent, FooterComponent, TranslatePipe, CommonModule],
  templateUrl: './products.component.html',
})
export class ProductsComponent {
  shopifyService = inject(ShopifyService);
  cartService = inject(CartService);

  products = this.shopifyService.getProducts();

  addToCart(product: ShopifyProduct) {
    this.cartService.addItem(product);
  }
}
