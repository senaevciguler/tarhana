import { Component, inject, OnInit, effect, ChangeDetectionStrategy, signal } from '@angular/core';
import { NavbarComponent } from '../../components/navbar/navbar';
import { FooterComponent } from '../../components/footer/footer';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { ShopifyService } from '../../services/shopify.service';
import { CartService } from '../../services/cart.service';
import { LanguageService } from '../../services/language.service';
import { SeoService } from '../../services/seo.service';
import { ShopifyProduct } from '../../services/shopify.types';
import { AnalyticsService } from '../../services/analytics.service';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [NavbarComponent, FooterComponent, TranslatePipe],
  templateUrl: './products.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductsComponent implements OnInit  {

  shopifyService = inject(ShopifyService);
  cartService = inject(CartService);
  langService = inject(LanguageService);
  seoService = inject(SeoService);
  analyticsService = inject(AnalyticsService);

  products = this.shopifyService.getProducts();

  // Selected state per product handle
  selectedImages = signal<Record<string, string>>({});
  selectedVariants = signal<Record<string, any>>({});
  quantities = signal<Record<string, number>>({});

  constructor() {
    window.scrollTo(0, 0);
    effect(() => {
      const title = this.langService.translate('SEO_PRODUCTS_TITLE');
      const desc = this.langService.translate('SEO_PRODUCTS_DESC');

      this.seoService.updateMeta(title, desc);
      this.seoService.updateCanonical();

      // Dynamic ItemList JSON-LD Schema
      const productsList = this.products();
      if (productsList && productsList.length > 0) {
        const origin = typeof window !== 'undefined' ? window.location.origin : '';
        const itemListSchema = {
          "@context": "https://schema.org",
          "@type": "ItemList",
          "itemListElement": productsList.map((prod, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "url": `${origin}/products/${prod.handle}`
          }))
        };
        this.seoService.updateJsonLd(itemListSchema);
      } else {
        this.seoService.updateJsonLd(null);
      }
    });
  }

  async ngOnInit() {
    await this.shopifyService.fetchProducts();
    // Pre-initialize state for each product when they are loaded
    const loadedProducts = this.products();
    const initialImages: Record<string, string> = {};
    const initialVariants: Record<string, any> = {};
    const initialQuantities: Record<string, number> = {};

    for (const prod of loadedProducts) {
      initialImages[prod.handle] = prod.image;
      initialVariants[prod.handle] = prod.variants && prod.variants.length > 0 ? prod.variants[0] : null;
      initialQuantities[prod.handle] = 1;
    }

    this.selectedImages.set(initialImages);
    this.selectedVariants.set(initialVariants);
    this.quantities.set(initialQuantities);
  }

  getProductSubtitle(product: ShopifyProduct): string {
    return product.handle.includes('unsalted') ? 'PRODUCT_UNSALTED_SUBTITLE' : 'PRODUCT_ORIGINAL_SUBTITLE';
  }

  getSelectedImage(product: ShopifyProduct): string {
    return this.selectedImages()[product.handle] || product.image;
  }

  setSelectedImage(product: ShopifyProduct, image: string) {
    this.selectedImages.update(prev => ({ ...prev, [product.handle]: image }));
  }

  getSelectedVariant(product: ShopifyProduct): any {
    const variant = this.selectedVariants()[product.handle];
    if (variant) return variant;
    if (product.variants && product.variants.length > 0) {
      return product.variants[0];
    }
    return {
      id: product.variantId,
      title: product.variantLabel || 'Default Title',
      price: product.price,
      currency: product.currency,
      availableForSale: product.availableForSale,
      quantityAvailable: product.quantityAvailable,
      compareAtPrice: product.compareAtPrice
    };
  }

  setSelectedVariant(product: ShopifyProduct, variant: any) {
    this.selectedVariants.update(prev => ({ ...prev, [product.handle]: variant }));
    this.quantities.update(prev => ({ ...prev, [product.handle]: 1 }));
  }

  getQuantity(product: ShopifyProduct): number {
    return this.quantities()[product.handle] || 1;
  }

  incrementQuantity(product: ShopifyProduct) {
    const maxQty = this.getQuantityAvailable(product);
    const currentQty = this.getQuantity(product);
    if (currentQty < maxQty || maxQty === 0) {
      this.quantities.update(prev => ({ ...prev, [product.handle]: currentQty + 1 }));
    }
  }

  decrementQuantity(product: ShopifyProduct) {
    const currentQty = this.getQuantity(product);
    if (currentQty > 1) {
      this.quantities.update(prev => ({ ...prev, [product.handle]: currentQty - 1 }));
    }
  }

  isAvailable(product: ShopifyProduct): boolean {
    const variant = this.getSelectedVariant(product);
    if (variant) return variant.availableForSale && variant.quantityAvailable > 0;
    return product.availableForSale && product.quantityAvailable > 0;
  }

  getQuantityAvailable(product: ShopifyProduct): number {
    const variant = this.getSelectedVariant(product);
    if (variant) return variant.quantityAvailable;
    return product.quantityAvailable;
  }

  currentPrice(product: ShopifyProduct): number {
    const variant = this.getSelectedVariant(product);
    if (variant) return variant.price;
    return product.price;
  }

  compareAtPrice(product: ShopifyProduct): number | null {
    const variant = this.getSelectedVariant(product);
    if (variant) return variant.compareAtPrice ?? null;
    return product.compareAtPrice ?? null;
  }

  getDiscountPercentage(product: ShopifyProduct): number {
    const price = this.currentPrice(product);
    const compare = this.compareAtPrice(product);
    if (compare && compare > price) {
      return Math.round(((compare - price) / compare) * 100);
    }
    return 0;
  }

  isLowStock(product: ShopifyProduct): boolean {
    const qty = this.getQuantityAvailable(product);
    return this.isAvailable(product) && qty > 0 && qty < 10;
  }

  isDecrementDisabled(product: ShopifyProduct): boolean {
    return !this.isAvailable(product) || this.getQuantity(product) <= 1;
  }

  isIncrementDisabled(product: ShopifyProduct): boolean {
    const qty = this.getQuantity(product);
    const maxQty = this.getQuantityAvailable(product);
    return !this.isAvailable(product) || (maxQty > 0 && qty >= maxQty);
  }

  addToCart(product: ShopifyProduct) {
    const variant = this.getSelectedVariant(product);
    const qty = this.getQuantity(product);
    if (!variant || !this.isAvailable(product)) return;

    // Build the specific ShopifyProduct mapping with selected variant details
    const productToAdd: ShopifyProduct = {
      ...product,
      variantId: variant.id,
      price: variant.price,
      currency: variant.currency,
      variantLabel: variant.title,
      availableForSale: variant.availableForSale,
      quantityAvailable: variant.quantityAvailable,
      compareAtPrice: variant.compareAtPrice
    };

    this.cartService.addItem(productToAdd, qty);
    this.analyticsService.trackAddToCart(productToAdd, qty);
  }

  getOnlyLeftText(count: number): string {
    return this.langService.translate('PRODUCT_ONLY_LEFT').replace('{count}', count.toString());
  }
}
