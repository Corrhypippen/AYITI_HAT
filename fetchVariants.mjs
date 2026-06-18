import { createStorefrontApiClient } from '@shopify/storefront-api-client';

const client = createStorefrontApiClient({
  storeDomain: 'ayitiheritagehat.myshopify.com',
  apiVersion: '2026-04',
  publicAccessToken: 'e8ac0d07a121bfac19d0bb28071ebe99',
});

const query = `
  query {
    products(first: 20) {
      edges {
        node {
          title
          variants(first: 10) {
            edges {
              node {
                id
                title
                price { amount }
              }
            }
          }
        }
      }
    }
  }
`;

const { data } = await client.request(query);

data.products.edges.forEach(({ node: product }) => {
  console.log('\n=== ' + product.title + ' ===');
  product.variants.edges.forEach(({ node: v }) => {
    console.log('  Variant: ' + v.title);
    console.log('  ID:      ' + v.id);
    console.log('  Price:   $' + v.price.amount);
  });
});
