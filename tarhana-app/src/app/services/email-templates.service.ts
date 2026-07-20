import { Injectable } from '@angular/core';

export interface EmailOrderData {
  orderName: string;
  customerName: string;
  items: Array<{ title: string; quantity: number; price: string }>;
  subtotal: string;
  shipping: string;
  discount?: string;
  total: string;
  shippingAddress: {
    name: string;
    street: string;
    postalCode: string;
    city: string;
    country: string;
  };
}

export interface EmailShippingData {
  orderName: string;
  customerName: string;
  items: Array<{ title: string; quantity: number }>;
  carrier: string;
  trackingNumber: string;
  trackingUrl: string;
}

export interface EmailDeliveryData {
  orderName: string;
  customerName: string;
  deliveryMethod: string; // 'home' or 'pickup'
}

@Injectable({
  providedIn: 'root',
})
export class EmailTemplatesService {
  /**
   * Returns a clean, premium CSS reset and base style block for our branded emails.
   */
  private getEmailStyles(): string {
    return `
      body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
      table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
      img { -ms-interpolation-mode: bicubic; }
      body { margin: 0; padding: 0; width: 100% !important; height: 100% !important; background-color: #F5F5F4; font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1C1917; }
      a { color: #23452E; text-decoration: none; }
      .email-container { max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border: 1px solid #E7E5E4; border-radius: 8px; overflow: hidden; margin-top: 40px; margin-bottom: 40px; }
      .header { background-color: #23452E; padding: 40px; text-align: center; color: #FFFFFF; }
      .logo { font-size: 36px; font-family: Georgia, serif; font-weight: bold; color: #FFFFFF; display: inline-block; margin-bottom: 8px; }
      .brand-name { font-size: 18px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 0; color: #F5F5F4; }
      .content { padding: 40px; }
      .title { font-size: 24px; font-weight: 400; line-height: 1.3; color: #1C1917; margin-top: 0; margin-bottom: 24px; letter-spacing: -0.02em; }
      .paragraph { font-size: 16px; line-height: 1.6; color: #44403C; margin-top: 0; margin-bottom: 20px; }
      .button-container { text-align: center; margin-top: 32px; margin-bottom: 32px; }
      .button { display: inline-block; padding: 16px 32px; background-color: #23452E; color: #FFFFFF !important; font-size: 14px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; border-radius: 9999px; text-align: center; }
      .order-table { width: 100%; border-collapse: collapse; margin-top: 24px; margin-bottom: 24px; }
      .order-table th { text-align: left; padding: 12px; border-bottom: 2px solid #E7E5E4; font-size: 14px; font-weight: 600; color: #78716C; text-transform: uppercase; letter-spacing: 0.05em; }
      .order-table td { padding: 16px 12px; border-bottom: 1px solid #E7E5E4; font-size: 15px; color: #44403C; }
      .summary-row td { border-bottom: none; padding-top: 8px; padding-bottom: 8px; }
      .summary-label { font-weight: 600; color: #78716C; text-align: right; }
      .summary-value { font-weight: 600; text-align: right; color: #1C1917; }
      .address-box { background-color: #FAFAF9; border: 1px solid #E7E5E4; border-radius: 6px; padding: 24px; margin-top: 24px; }
      .address-title { font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #78716C; margin-top: 0; margin-bottom: 12px; }
      .footer { background-color: #FAFAF9; padding: 32px; text-align: center; border-top: 1px solid #E7E5E4; font-size: 12px; color: #78716C; line-height: 1.5; }
    `;
  }

  /**
   * Prepare order confirmation email template.
   */
  renderOrderConfirmation(data: EmailOrderData): string {
    const itemsHtml = data.items
      .map(
        (item) => `
      <tr>
        <td style="font-weight: 500;">${item.title}</td>
        <td style="text-align: center;">${item.quantity}</td>
        <td style="text-align: right;">${item.price}</td>
      </tr>
    `
      )
      .join('');

    const discountHtml = data.discount
      ? `
      <tr class="summary-row">
        <td colspan="2" class="summary-label">Rabatt / Discount:</td>
        <td class="summary-value" style="color: #EA2A33;">-${data.discount}</td>
      </tr>
    `
      : '';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation - Ella’s Pantry</title>
        <style>${this.getEmailStyles()}</style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <span class="logo">E</span>
            <div class="brand-name">Ella’s Pantry</div>
          </div>
          <div class="content">
            <h1 class="title">Tack för din beställning, ${data.customerName}!</h1>
            <p class="paragraph">
              Vi har tagit emot din order <strong>${data.orderName}</strong> och påbörjat förberedelserna för att skicka dina naturligt fermenterade soppmixar.
            </p>
            <p class="paragraph">
              We have received your order <strong>${data.orderName}</strong> and are preparing your naturally fermented soup mixes for shipment.
            </p>

            <table class="order-table">
              <thead>
                <tr>
                  <th style="width: 60%;">Produkt / Item</th>
                  <th style="width: 15%; text-align: center;">Antal / Qty</th>
                  <th style="width: 25%; text-align: right;">Pris / Price</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
                <tr class="summary-row">
                  <td colspan="2" class="summary-label" style="padding-top: 16px;">Delsumma / Subtotal:</td>
                  <td class="summary-value" style="padding-top: 16px;">${data.subtotal}</td>
                </tr>
                <tr class="summary-row">
                  <td colspan="2" class="summary-label">Frakt / Shipping:</td>
                  <td class="summary-value">${data.shipping}</td>
                </tr>
                ${discountHtml}
                <tr class="summary-row">
                  <td colspan="2" class="summary-label" style="font-size: 16px; color: #1C1917;">Totalt / Total:</td>
                  <td class="summary-value" style="font-size: 16px; color: #23452E;">${data.total}</td>
                </tr>
              </tbody>
            </table>

            <div class="address-box">
              <div class="address-title">Leveransadress / Shipping Address</div>
              <p class="paragraph" style="margin: 0; font-size: 15px; line-height: 1.5; color: #44403C;">
                <strong>${data.shippingAddress.name}</strong><br>
                ${data.shippingAddress.street}<br>
                ${data.shippingAddress.postalCode} ${data.shippingAddress.city}<br>
                ${data.shippingAddress.country}
              </p>
            </div>

            <div class="button-container">
              <a href="https://ellaspantry.se/recipes" class="button">Utforska recept / Explore recipes</a>
            </div>
          </div>
          <div class="footer">
            <p style="margin: 0 0 8px 0; font-weight: 600; color: #1C1917;">Ella’s Pantry AB</p>
            <p style="margin: 0 0 16px 0;">Stockholm, Sweden | info@ellaspantry.se</p>
            <p style="margin: 0; font-size: 11px;">
              Du får detta e-postmeddelande för att du har genomfört ett köp hos Ella’s Pantry.<br>
              You are receiving this email because you made a purchase at Ella’s Pantry.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Prepare shipping confirmation email template.
   */
  renderShippingConfirmation(data: EmailShippingData): string {
    const itemsHtml = data.items
      .map(
        (item) => `
      <li style="margin-bottom: 8px; color: #44403C; font-size: 15px;">
        <strong>${item.quantity}x</strong> ${item.title}
      </li>
    `
      )
      .join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Shipping Confirmation - Ella’s Pantry</title>
        <style>${this.getEmailStyles()}</style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <span class="logo">E</span>
            <div class="brand-name">Ella’s Pantry</div>
          </div>
          <div class="content">
            <h1 class="title">Dina varor är på väg! / Your order is on its way!</h1>
            <p class="paragraph">
              Hej ${data.customerName}, goda nyheter! Din order <strong>${data.orderName}</strong> har skickats från vårt lager och är på väg till dig.
            </p>
            <p class="paragraph">
              Hi ${data.customerName}, great news! Your order <strong>${data.orderName}</strong> has been shipped from our warehouse and is on its way to you.
            </p>

            <div class="address-box">
              <div class="address-title" style="margin-bottom: 16px;">Fraktinformation / Delivery Info</div>
              <p class="paragraph" style="margin: 0 0 8px 0; font-size: 15px;">
                <strong>Speditör / Carrier:</strong> ${data.carrier}
              </p>
              <p class="paragraph" style="margin: 0; font-size: 15px;">
                <strong>Sändningsnummer / Tracking Number:</strong> <code>${data.trackingNumber}</code>
              </p>
            </div>

            <div class="button-container">
              <a href="${data.trackingUrl}" class="button">Spåra paket / Track shipment</a>
            </div>

            <h3 style="font-size: 16px; font-weight: 600; margin-top: 32px; margin-bottom: 12px; color: #1C1917; text-transform: uppercase; letter-spacing: 0.05em;">Skickade produkter / Shipped items</h3>
            <ul style="margin: 0; padding-left: 20px;">
              ${itemsHtml}
            </ul>
          </div>
          <div class="footer">
            <p style="margin: 0 0 8px 0; font-weight: 600; color: #1C1917;">Ella’s Pantry AB</p>
            <p style="margin: 0 0 16px 0;">Stockholm, Sweden | info@ellaspantry.se</p>
            <p style="margin: 0; font-size: 11px;">
              Du får detta e-postmeddelande för att du har genomfört ett köp hos Ella’s Pantry.<br>
              You are receiving this email because you made a purchase at Ella’s Pantry.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Prepare delivery confirmation email template.
   */
  renderDeliveryConfirmation(data: EmailDeliveryData): string {
    const pickupInstructions =
      data.deliveryMethod === 'pickup'
        ? `
      <p class="paragraph">
        Ditt paket har levererats till ditt valda ombud. Vänligen hämta ut det med din legitimation och det löpnummer du fått via SMS.
      </p>
      <p class="paragraph">
        Your package has been delivered to your pickup point. Please collect it using your ID and the pickup code received via SMS.
      </p>
    `
        : `
      <p class="paragraph">
        Ditt paket har levererats till din dörr eller din postlåda. Hoppas du ska njuta av dina goda, fermenterade soppor!
      </p>
      <p class="paragraph">
        Your package has been delivered to your door or mailbox. We hope you enjoy your delicious, fermented soup mixes!
      </p>
    `;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Delivery Confirmation - Ella’s Pantry</title>
        <style>${this.getEmailStyles()}</style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <span class="logo">E</span>
            <div class="brand-name">Ella’s Pantry</div>
          </div>
          <div class="content">
            <h1 class="title">Levererad! / Delivered!</h1>
            <p class="paragraph">
              Hej ${data.customerName}, din order <strong>${data.orderName}</strong> har levererats!
            </p>
            <p class="paragraph">
              Hi ${data.customerName}, your order <strong>${data.orderName}</strong> has been delivered!
            </p>

            <div class="address-box" style="border-left: 4px solid #23452E;">
              ${pickupInstructions}
            </div>

            <p class="paragraph" style="margin-top: 32px;">
              Behöver du inspiration? Kolla in våra handplockade, premium tarhana-recept på hemsidan!
            </p>
            <p class="paragraph">
              Need inspiration? Check out our handpicked, premium tarhana recipes on our website!
            </p>

            <div class="button-container">
              <a href="https://ellaspantry.se/recipes" class="button">Se Recept / View Recipes</a>
            </div>
          </div>
          <div class="footer">
            <p style="margin: 0 0 8px 0; font-weight: 600; color: #1C1917;">Ella’s Pantry AB</p>
            <p style="margin: 0 0 16px 0;">Stockholm, Sweden | info@ellaspantry.se</p>
            <p style="margin: 0; font-size: 11px;">
              Du får detta e-postmeddelande för att du har genomfört ett köp hos Ella’s Pantry.<br>
              You are receiving this email because you made a purchase at Ella’s Pantry.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Returns standard liquid template tags that can be directly pasted into Shopify Admin Notifications
   */
  getShopifyLiquidTemplate(type: 'order_confirmation' | 'shipping_confirmation' | 'delivery_confirmation'): string {
    switch (type) {
      case 'order_confirmation':
        return `
          <!-- Ella's Pantry Shopify Notification Liquid Template -->
          <style>${this.getEmailStyles()}</style>
          <div class="email-container">
            <div class="header">
              <span class="logo">E</span>
              <div class="brand-name">Ella’s Pantry</div>
            </div>
            <div class="content">
              <h1 class="title">Tack för din beställning, {{ customer.first_name }}!</h1>
              <p class="paragraph">
                Vi har tagit emot din order <strong>{{ order_name }}</strong> och påbörjat förberedelserna för att skicka dina naturligt fermenterade soppmixar.
              </p>

              <table class="order-table">
                <thead>
                  <tr>
                    <th style="width: 60%;">Produkt / Item</th>
                    <th style="width: 15%; text-align: center;">Antal / Qty</th>
                    <th style="width: 25%; text-align: right;">Pris / Price</th>
                  </tr>
                </thead>
                <tbody>
                  {% for line in line_items %}
                  <tr>
                    <td style="font-weight: 500;">{{ line.title }}</td>
                    <td style="text-align: center;">{{ line.quantity }}</td>
                    <td style="text-align: right;">{{ line.final_line_price | money }}</td>
                  </tr>
                  {% endfor %}
                  <tr class="summary-row">
                    <td colspan="2" class="summary-label" style="padding-top: 16px;">Delsumma / Subtotal:</td>
                    <td class="summary-value" style="padding-top: 16px;">{{ subtotal_price | money }}</td>
                  </tr>
                  <tr class="summary-row">
                    <td colspan="2" class="summary-label">Frakt / Shipping:</td>
                    <td class="summary-value">{{ shipping_price | money }}</td>
                  </tr>
                  {% if total_discounts > 0 %}
                  <tr class="summary-row">
                    <td colspan="2" class="summary-label">Rabatt / Discount:</td>
                    <td class="summary-value" style="color: #EA2A33;">-{{ total_discounts | money }}</td>
                  </tr>
                  {% endif %}
                  <tr class="summary-row">
                    <td colspan="2" class="summary-label" style="font-size: 16px; color: #1C1917;">Totalt / Total:</td>
                    <td class="summary-value" style="font-size: 16px; color: #23452E;">{{ total_price | money }}</td>
                  </tr>
                </tbody>
              </table>

              {% if shipping_address %}
              <div class="address-box">
                <div class="address-title">Leveransadress / Shipping Address</div>
                <p class="paragraph" style="margin: 0; font-size: 15px; line-height: 1.5; color: #44403C;">
                  <strong>{{ shipping_address.name }}</strong><br>
                  {{ shipping_address.street }}<br>
                  {{ shipping_address.zip }} {{ shipping_address.city }}<br>
                  {{ shipping_address.country }}
                </p>
              </div>
              {% endif %}

              <div class="button-container">
                <a href="{{ shop.url }}/recipes" class="button">Utforska recept / Explore recipes</a>
              </div>
            </div>
            <div class="footer">
              <p style="margin: 0 0 8px 0; font-weight: 600; color: #1C1917;">{{ shop.name }}</p>
              <p style="margin: 0 0 16px 0;">{{ shop.domain }} | info@ellaspantry.se</p>
            </div>
          </div>
        `;
      case 'shipping_confirmation':
        return `
          <!-- Ella's Pantry Shopify Notification Liquid Template -->
          <style>${this.getEmailStyles()}</style>
          <div class="email-container">
            <div class="header">
              <span class="logo">E</span>
              <div class="brand-name">Ella’s Pantry</div>
            </div>
            <div class="content">
              <h1 class="title">Dina varor är på väg! / Your order is on its way!</h1>
              <p class="paragraph">
                Hej {{ customer.first_name }}, goda nyheter! Din order <strong>{{ order_name }}</strong> har skickats från vårt lager och är på väg till dig.
              </p>

              <div class="address-box">
                <div class="address-title" style="margin-bottom: 16px;">Fraktinformation / Delivery Info</div>
                <p class="paragraph" style="margin: 0 0 8px 0; font-size: 15px;">
                  <strong>Speditör / Carrier:</strong> {{ fulfillment.tracking_company }}
                </p>
                <p class="paragraph" style="margin: 0; font-size: 15px;">
                  <strong>Sändningsnummer / Tracking Number:</strong> <code>{{ fulfillment.tracking_number }}</code>
                </p>
              </div>

              <div class="button-container">
                <a href="{{ fulfillment.tracking_url }}" class="button">Spåra paket / Track shipment</a>
              </div>

              <h3 style="font-size: 16px; font-weight: 600; margin-top: 32px; margin-bottom: 12px; color: #1C1917; text-transform: uppercase; letter-spacing: 0.05em;">Skickade produkter / Shipped items</h3>
              <ul style="margin: 0; padding-left: 20px;">
                {% for line in fulfillment.fulfillment_line_items %}
                <li style="margin-bottom: 8px; color: #44403C; font-size: 15px;">
                  <strong>{{ line.quantity }}x</strong> {{ line.line_item.title }}
                </li>
                {% endfor %}
              </ul>
            </div>
            <div class="footer">
              <p style="margin: 0 0 8px 0; font-weight: 600; color: #1C1917;">{{ shop.name }}</p>
              <p style="margin: 0 0 16px 0;">{{ shop.domain }} | info@ellaspantry.se</p>
            </div>
          </div>
        `;
      case 'delivery_confirmation':
        return `
          <!-- Ella's Pantry Shopify Notification Liquid Template -->
          <style>${this.getEmailStyles()}</style>
          <div class="email-container">
            <div class="header">
              <span class="logo">E</span>
              <div class="brand-name">Ella’s Pantry</div>
            </div>
            <div class="content">
              <h1 class="title">Levererad! / Delivered!</h1>
              <p class="paragraph">
                Hej {{ customer.first_name }}, din order <strong>{{ order_name }}</strong> har levererats!
              </p>

              <div class="address-box" style="border-left: 4px solid #23452E;">
                <p class="paragraph">
                  Ditt paket har levererats! Hoppas du ska njuta av dina goda, fermenterade soppor!
                </p>
              </div>

              <div class="button-container">
                <a href="{{ shop.url }}/recipes" class="button">Se Recept / View Recipes</a>
              </div>
            </div>
            <div class="footer">
              <p style="margin: 0 0 8px 0; font-weight: 600; color: #1C1917;">{{ shop.name }}</p>
              <p style="margin: 0 0 16px 0;">{{ shop.domain }} | info@ellaspantry.se</p>
            </div>
          </div>
        `;
    }
  }
}
