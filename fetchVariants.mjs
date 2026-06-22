import { createStorefrontApiClient } from '@shopify/storefront-api-client';

const client = createStorefrontApiClient({
  storeDomain: 'ayitih.myshopify.com',
  apiVersion: '2026-04',
  publicAccessToken: 'e8ac0d07a121bfac19d0bb28071ebe99',
});

const query = `
  query {
    nodes(ids: [
      "gid://shopify/ProductVariant/43088077553741",
      "gid://shopify/ProductVariant/43088071098445",
      "gid://shopify/ProductVariant/43088068182093",
      "gid://shopify/ProductVariant/43081754935373",
      "gid://shopify/ProductVariant/43088054550605",
      "gid://shopify/ProductVariant/43088037085261",
      "gid://shopify/ProductVariant/43088045703245",
      "gid://shopify/ProductVariant/43088075685965"
    ]) {
      ... on ProductVariant {
        id
        sku
        price {
          amount
        }
        product {
          title
        }
      }
    }
  }
`;

try {
  const { data } = await client.request(query);
  console.log(JSON.stringify(data, null, 2));
} catch (e) {
  console.error(e);
}
