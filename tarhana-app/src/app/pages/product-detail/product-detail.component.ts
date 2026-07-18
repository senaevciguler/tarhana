import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';

import { NavbarComponent } from '../../components/navbar/navbar';
import { FooterComponent } from '../../components/footer/footer';

import { ShopifyService } from '../../services/shopify.service';
import { ShopifyProduct } from '../../services/shopify.types';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NavbarComponent,
    FooterComponent
  ],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.scss'
})
export class ProductDetailComponent implements OnInit {

  private route = inject(ActivatedRoute);

  shopifyService = inject(ShopifyService);
  cartService = inject(CartService);

  product = signal<ShopifyProduct | null>(null);

  loading = signal(true);

  async ngOnInit() {

    const handle = this.route.snapshot.paramMap.get('handle');

    if (!handle) {
      this.loading.set(false);
      return;
    }

    const product = await this.shopifyService.fetchProduct(handle);

    this.product.set(product);

    this.loading.set(false);
  }

  addToCart() {

    const product = this.product();

    if (!product) {
      return;
    }

    this.cartService.addItem(product);
  }
}