import { Component, inject, OnInit } from '@angular/core';
import { NavbarComponent } from '../../components/navbar/navbar';
import { FooterComponent } from '../../components/footer/footer';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { ShopifyService } from '../../services/shopify.service';
import { CartService } from '../../services/cart.service';
import { LanguageService } from '../../services/language.service';
import { CommonModule } from '@angular/common';
import { ShopifyProduct } from '../../services/shopify.types';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [NavbarComponent, FooterComponent, TranslatePipe, CommonModule, RouterLink],
  templateUrl: './products.component.html',
})
export class ProductsComponent implements OnInit  {

  shopifyService = inject(ShopifyService);
  cartService = inject(CartService);
  langService = inject(LanguageService);

  products = this.shopifyService.getProducts();

  async ngOnInit() {
    await this.shopifyService.fetchProducts();
  }

  addToCart(product: ShopifyProduct) {
    this.cartService.addItem(product);
  }

  getDiscountPercentage(product: ShopifyProduct): number {
    if (!product.compareAtPrice || product.compareAtPrice <= product.price) {
      return 0;
    }
    return Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100);
  }

  getOnlyLeftText(count: number): string {
    return this.langService.translate('PRODUCT_ONLY_LEFT').replace('{count}', count.toString());
  }
}
