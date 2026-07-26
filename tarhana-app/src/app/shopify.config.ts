export const SHOPIFY_CONFIG = {
  domain: '73aav0-cb.myshopify.com', // e.g., 'your-store.myshopify.com'
  storefrontAccessToken: '6e415b543ceb69d369dc8e7a8d8170cb',
  apiVersion: '2024-01',
  enableCheckout: true, // Set to true to enable Shopify checkout redirection

  // Production-Ready Contact Form Configuration
  // To receive contact form emails at info@ellaspantry.se, obtain a free Web3Forms Access Key
  // at https://web3forms.com/ or a Formspree Form ID at https://formspree.io/ and configure below.
  contactFormService: 'mock', // Options: 'web3forms' | 'formspree' | 'mock'
  contactFormKey: '' // Paste your Web3Forms Access Key or Formspree Form ID here
};
