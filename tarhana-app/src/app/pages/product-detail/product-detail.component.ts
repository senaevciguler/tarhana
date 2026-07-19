import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';

import { NavbarComponent } from '../../components/navbar/navbar';
import { FooterComponent } from '../../components/footer/footer';
import { TranslatePipe } from '../../pipes/translate.pipe';

import { ShopifyService } from '../../services/shopify.service';
import { ShopifyProduct, ShopifyVariant } from '../../services/shopify.types';
import { CartService } from '../../services/cart.service';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NavbarComponent,
    FooterComponent,
    TranslatePipe
  ],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.scss'
})
export class ProductDetailComponent implements OnInit {

  private route = inject(ActivatedRoute);
  shopifyService = inject(ShopifyService);
  cartService = inject(CartService);
  langService = inject(LanguageService);

  product = signal<ShopifyProduct | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  // Gallery and options
  selectedImage = signal<string>('');
  selectedVariant = signal<ShopifyVariant | null>(null);
  quantity = signal<number>(1);

  // Derived properties
  currentPrice = computed(() => {
    const variant = this.selectedVariant();
    if (variant) return variant.price;
    return this.product()?.price ?? 0;
  });

  compareAtPrice = computed(() => {
    const variant = this.selectedVariant();
    if (variant) return variant.compareAtPrice;
    return this.product()?.compareAtPrice ?? null;
  });

  discountPercentage = computed(() => {
    const price = this.currentPrice();
    const compare = this.compareAtPrice();
    if (compare && compare > price) {
      return Math.round(((compare - price) / compare) * 100);
    }
    return 0;
  });

  isAvailable = computed(() => {
    const variant = this.selectedVariant();
    if (variant) return variant.availableForSale && variant.quantityAvailable > 0;
    const prod = this.product();
    return (prod?.availableForSale ?? false) && (prod?.quantityAvailable ?? 0) > 0;
  });

  quantityAvailable = computed(() => {
    const variant = this.selectedVariant();
    if (variant) return variant.quantityAvailable;
    return this.product()?.quantityAvailable ?? 0;
  });

  async ngOnInit() {
    this.route.paramMap.subscribe(async (params) => {
      const handle = params.get('handle');
      if (!handle) {
        this.error.set('No product selected.');
        this.loading.set(false);
        return;
      }

      this.loading.set(true);
      this.error.set(null);

      try {
        const prod = await this.shopifyService.fetchProduct(handle);
        if (prod) {
          this.product.set(prod);
          this.selectedImage.set(prod.image);

          if (prod.variants && prod.variants.length > 0) {
            this.selectedVariant.set(prod.variants[0]);
          } else {
            this.selectedVariant.set({
              id: prod.variantId,
              title: prod.variantLabel || 'Default',
              price: prod.price,
              currency: prod.currency,
              availableForSale: prod.availableForSale,
              quantityAvailable: prod.quantityAvailable,
              compareAtPrice: prod.compareAtPrice
            });
          }
        } else {
          this.error.set('Product not found.');
        }
      } catch (err) {
        console.error('Error fetching product details:', err);
        this.error.set('An error occurred while loading the product.');
      } finally {
        this.loading.set(false);
      }
    });
  }

  getOnlyLeftText(count: number): string {
    return this.langService.translate('PRODUCT_ONLY_LEFT').replace('{count}', count.toString());
  }

  selectVariant(variant: ShopifyVariant) {
    this.selectedVariant.set(variant);
    this.quantity.set(1); // Reset quantity on variant change
  }

  selectImage(img: string) {
    this.selectedImage.set(img);
  }

  incrementQuantity() {
    const maxQty = this.quantityAvailable();
    if (this.quantity() < maxQty || maxQty === 0) {
      this.quantity.update(q => q + 1);
    }
  }

  decrementQuantity() {
    if (this.quantity() > 1) {
      this.quantity.update(q => q - 1);
    }
  }

  addToCart() {
    const prod = this.product();
    const variant = this.selectedVariant();
    if (!prod || !variant || !this.isAvailable()) return;

    // Build the specific ShopifyProduct mapping with selected variant details
    const productToAdd: ShopifyProduct = {
      ...prod,
      variantId: variant.id,
      price: variant.price,
      currency: variant.currency,
      variantLabel: variant.title,
      availableForSale: variant.availableForSale,
      quantityAvailable: variant.quantityAvailable,
      compareAtPrice: variant.compareAtPrice
    };

    // Add selected quantity of items
    this.cartService.addItem(productToAdd, this.quantity());
  }
}
