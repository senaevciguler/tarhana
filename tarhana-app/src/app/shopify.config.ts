declare const WEB3FORMS_ACCESS_KEY: string;
declare const process: any;

function getContactFormKey(): string {
  // 1. Try build-time replaced WEB3FORMS_ACCESS_KEY variable
  try {
    if (typeof WEB3FORMS_ACCESS_KEY !== 'undefined') {
      return WEB3FORMS_ACCESS_KEY;
    }
  } catch (e) {}

  // 2. Try process.env['WEB3FORMS_ACCESS_KEY'] (for Node, SSR or Jest testing)
  try {
    if (typeof process !== 'undefined' && process.env && process.env['WEB3FORMS_ACCESS_KEY']) {
      return process.env['WEB3FORMS_ACCESS_KEY'];
    }
  } catch (e) {}

  // 3. Try window.__env?.WEB3FORMS_ACCESS_KEY (for containerized runtime settings)
  try {
    if (typeof window !== 'undefined' && (window as any).__env && (window as any).__env.WEB3FORMS_ACCESS_KEY) {
      return (window as any).__env.WEB3FORMS_ACCESS_KEY;
    }
  } catch (e) {}

  return '';
}

export const SHOPIFY_CONFIG = {
  domain: '73aav0-cb.myshopify.com', // e.g., 'your-store.myshopify.com'
  storefrontAccessToken: '6e415b543ceb69d369dc8e7a8d8170cb',
  apiVersion: '2024-01',
  enableCheckout: true, // Set to true to enable Shopify checkout redirection

  // Production-Ready Contact Form Configuration
  // To receive contact form emails at info@ellaspantry.se, obtain a free Web3Forms Access Key
  // at https://web3forms.com/ or a Formspree Form ID at https://formspree.io/ and configure below.
  contactFormService: 'web3forms', // Options: 'web3forms' | 'formspree' | 'mock'
  contactFormKey: getContactFormKey() // Paste your Web3Forms Access Key or Formspree Form ID here, or provide it via environment variables
};
