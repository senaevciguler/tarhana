import { TestBed } from '@angular/core/testing';
import { EmailTemplatesService, EmailOrderData, EmailShippingData, EmailDeliveryData } from './email-templates.service';

describe('EmailTemplatesService', () => {
  let service: EmailTemplatesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EmailTemplatesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should render order confirmation with complete details', () => {
    const data: EmailOrderData = {
      orderName: 'TRH-123456',
      customerName: 'Kalle',
      items: [{ title: 'Original Fermented Soup Mix', quantity: 2, price: '258 kr' }],
      subtotal: '258 kr',
      shipping: '49 kr',
      discount: '20 kr',
      total: '287 kr',
      shippingAddress: {
        name: 'Kalle Kula',
        street: 'Sveavägen 10',
        postalCode: '11122',
        city: 'Stockholm',
        country: 'Sweden'
      }
    };

    const rendered = service.renderOrderConfirmation(data);
    expect(rendered).toContain('TRH-123456');
    expect(rendered).toContain('Kalle');
    expect(rendered).toContain('Original Fermented Soup Mix');
    expect(rendered).toContain('Sveavägen 10');
    expect(rendered).toContain('Ella’s Pantry');
  });

  it('should render shipping confirmation', () => {
    const data: EmailShippingData = {
      orderName: 'TRH-123456',
      customerName: 'Kalle',
      items: [{ title: 'Original Fermented Soup Mix', quantity: 2 }],
      carrier: 'PostNord',
      trackingNumber: '123456789SE',
      trackingUrl: 'https://postnord.se/track?id=123456789SE'
    };

    const rendered = service.renderShippingConfirmation(data);
    expect(rendered).toContain('TRH-123456');
    expect(rendered).toContain('Kalle');
    expect(rendered).toContain('PostNord');
    expect(rendered).toContain('123456789SE');
  });

  it('should render delivery confirmation with appropriate message', () => {
    const data: EmailDeliveryData = {
      orderName: 'TRH-123456',
      customerName: 'Kalle',
      deliveryMethod: 'pickup'
    };

    const rendered = service.renderDeliveryConfirmation(data);
    expect(rendered).toContain('TRH-123456');
    expect(rendered).toContain('Kalle');
    expect(rendered).toContain('pickup point');
  });

  it('should render delivery confirmation for home delivery', () => {
    const data: EmailDeliveryData = {
      orderName: 'TRH-123456',
      customerName: 'Kalle',
      deliveryMethod: 'home'
    };

    const rendered = service.renderDeliveryConfirmation(data);
    expect(rendered).toContain('TRH-123456');
    expect(rendered).toContain('Kalle');
    expect(rendered).not.toContain('pickup point');
  });

  it('should provide liquid templates for Shopify notifications', () => {
    const orderLiquid = service.getShopifyLiquidTemplate('order_confirmation');
    expect(orderLiquid).toContain('{{ customer.first_name }}');
    expect(orderLiquid).toContain('{% for line in line_items %}');

    const shippingLiquid = service.getShopifyLiquidTemplate('shipping_confirmation');
    expect(shippingLiquid).toContain('{{ fulfillment.tracking_company }}');

    const deliveryLiquid = service.getShopifyLiquidTemplate('delivery_confirmation');
    expect(deliveryLiquid).toContain('{{ customer.first_name }}');
  });
});
