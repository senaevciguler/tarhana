import { Injectable, signal } from '@angular/core';

export interface ShippingConfig {
  defaultFlatRate: number;
  freeShippingThreshold: number | null;
  countryRates: Record<string, number>;
  pickupSupport: boolean;
  pickupRate: number;
}

@Injectable({
  providedIn: 'root',
})
export class ShippingService {
  private config = signal<ShippingConfig>({
    defaultFlatRate: 49,
    freeShippingThreshold: 500, // free shipping above 500 kr
    countryRates: {
      'Sweden': 49,
      'Norway': 99,
      'Denmark': 79,
    },
    pickupSupport: true,
    pickupRate: 0,
  });

  // Expose configuration as a readonly signal
  shippingConfig = this.config.asReadonly();

  /**
   * Update the entire configuration or a subset of it
   */
  updateConfig(newConfig: Partial<ShippingConfig>) {
    this.config.update((current) => ({
      ...current,
      ...newConfig,
      countryRates: {
        ...current.countryRates,
        ...(newConfig.countryRates || {}),
      },
    }));
  }

  /**
   * Reset the configuration to defaults
   */
  resetConfig() {
    this.config.set({
      defaultFlatRate: 49,
      freeShippingThreshold: 500,
      countryRates: {
        'Sweden': 49,
        'Norway': 99,
        'Denmark': 79,
      },
      pickupSupport: true,
      pickupRate: 0,
    });
  }

  /**
   * Calculate shipping cost based on rules
   *
   * @param subtotal Cart subtotal amount
   * @param country Destination country
   * @param deliveryMethod Chosen delivery method (e.g. 'home', 'pickup')
   */
  calculateShipping(subtotal: number, country: string, deliveryMethod: string): number {
    const currentConfig = this.config();

    // 1. Pickup support (Local/future pickup)
    if (deliveryMethod === 'pickup' && currentConfig.pickupSupport) {
      return currentConfig.pickupRate;
    }

    // 2. Free shipping threshold
    if (
      currentConfig.freeShippingThreshold !== null &&
      currentConfig.freeShippingThreshold !== undefined &&
      subtotal >= currentConfig.freeShippingThreshold
    ) {
      return 0;
    }

    // 3. Country-specific shipping
    if (country) {
      // Check for exact and case-insensitive match
      const matchedKey = Object.keys(currentConfig.countryRates).find(
        (key) => key.toLowerCase() === country.toLowerCase()
      );
      if (matchedKey) {
        return currentConfig.countryRates[matchedKey];
      }
    }

    // 4. Flat shipping (default fallback)
    return currentConfig.defaultFlatRate;
  }
}
