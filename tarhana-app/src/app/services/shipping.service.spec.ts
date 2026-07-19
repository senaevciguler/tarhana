import { TestBed } from '@angular/core/testing';
import { ShippingService } from './shipping.service';

describe('ShippingService', () => {
  let service: ShippingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ShippingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return flat shipping cost by default if no country-specific rate', () => {
    const cost = service.calculateShipping(100, 'France', 'home');
    expect(cost).toBe(49);
  });

  it('should return 0 shipping cost if free shipping threshold is met', () => {
    const cost = service.calculateShipping(550, 'Sweden', 'home');
    expect(cost).toBe(0);
  });

  it('should apply country-specific shipping rates', () => {
    // Norway is 99
    let cost = service.calculateShipping(100, 'Norway', 'home');
    expect(cost).toBe(99);

    // Case-insensitive matching
    cost = service.calculateShipping(100, 'norway', 'home');
    expect(cost).toBe(99);

    // Denmark is 79
    cost = service.calculateShipping(100, 'Denmark', 'home');
    expect(cost).toBe(79);
  });

  it('should support pickup (free/pickupRate) when deliveryMethod is pickup', () => {
    const cost = service.calculateShipping(100, 'Sweden', 'pickup');
    expect(cost).toBe(0);
  });

  it('should allow dynamic configuration updates', () => {
    service.updateConfig({
      defaultFlatRate: 35,
      freeShippingThreshold: 300,
      countryRates: { 'Germany': 120 },
      pickupRate: 10,
    });

    // Check flat rate (using country without explicit rate)
    expect(service.calculateShipping(100, 'France', 'home')).toBe(35);

    // Check free shipping threshold
    expect(service.calculateShipping(320, 'Sweden', 'home')).toBe(0);

    // Check new country rate
    expect(service.calculateShipping(100, 'Germany', 'home')).toBe(120);

    // Check updated pickup rate
    expect(service.calculateShipping(100, 'Sweden', 'pickup')).toBe(10);
  });

  it('should reset configuration correctly', () => {
    service.updateConfig({ defaultFlatRate: 10 });
    expect(service.calculateShipping(100, 'France', 'home')).toBe(10);

    service.resetConfig();
    expect(service.calculateShipping(100, 'France', 'home')).toBe(49);
  });
});
