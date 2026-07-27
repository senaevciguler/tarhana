declare const WEB3FORMS_ACCESS_KEY: string;
declare const process: any;

function getContactFormKey(): string {
  // 1. Try build-time replaced WEB3FORMS_ACCESS_KEY variable
  try {
    if (typeof WEB3FORMS_ACCESS_KEY !== 'undefined' && WEB3FORMS_ACCESS_KEY !== "''" && WEB3FORMS_ACCESS_KEY !== '') {
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

  // 4. Default fallback key
  return '6ac83938-038a-497a-979b-beae95d59f73';
}

export const SHOPIFY_CONFIG = {
  domain: '73aav0-cb.myshopify.com',
  storefrontAccessToken: '6e415b543ceb69d369dc8e7a8d8170cb',
  apiVersion: '2024-01',
  enableCheckout: true,
  contactFormService: 'web3forms',
  contactFormKey: getContactFormKey()
};
