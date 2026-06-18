import { createStorefrontApiClient } from '@shopify/storefront-api-client';

export const shopifyClient = createStorefrontApiClient({
  storeDomain: import.meta.env.VITE_SHOPIFY_DOMAIN,
  apiVersion: '2026-04',
  publicAccessToken: import.meta.env.VITE_SHOPIFY_TOKEN,
});
