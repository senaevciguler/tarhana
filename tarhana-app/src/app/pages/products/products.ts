import { Component, inject, OnInit, effect } from '@angular/core';
import { NavbarComponent } from '../../components/navbar/navbar';
import { FooterComponent } from '../../components/footer/footer';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { ShopifyService } from '../../services/shopify.service';
import { CartService } from '../../services/cart.service';
import { LanguageService } from '../../services/language.service';
import { SeoService } from '../../services/seo.service';
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
  private seoService = inject(SeoService);

  products = this.shopifyService.getProducts();

  constructor() {
    effect(() => {
      // Re-run whenever language or products change
      this.langService.language();
      const productList = this.products();

      const schema = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "itemListElement": productList.map((p, idx) => ({
          "@type": "ListItem",
          "position": idx + 1,
          "item": {
            "@type": "Product",
            "name": this.langService.translate(p.title),
            "description": this.langService.translate(p.description),
            "image": p.image,
            "offers": {
              "@type": "Offer",
              "priceCurrency": "SEK",
              "price": p.price.toString(),
              "availability": p.availableForSale ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
            },
            "brand": {
              "@type": "Brand",
              "name": "Ella’s Pantry"
            }
          }
        }))
      };

      this.seoService.updateMetaTags({
        title: this.langService.translate('SEO_PRODUCTS_TITLE'),
        description: this.langService.translate('SEO_PRODUCTS_DESC'),
        schema
      });
    });
  }

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
