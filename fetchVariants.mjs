// Fetch Printful store products and their catalog variant IDs
import 'dotenv/config';

const apiKey = process.env.PRINTFUL_API_KEY;
if (!apiKey) {
  console.error('PRINTFUL_API_KEY environment variable is required.');
  process.exit(1);
}

const authHeader = `Bearer ${apiKey}`;

async function main() {
  const storeRes = await fetch('https://api.printful.com/store/products', {
    headers: { Authorization: authHeader }
  });
  const storeData = await storeRes.json();
  const products = storeData.result || [];

  console.log(`Found ${products.length} store products:\n`);

  for (const p of products) {
    const catRes = await fetch(`https://api.printful.com/products/${p.id}`, {
      headers: { Authorization: authHeader }
    });
    const catData = await catRes.json();

    const variants = (catData.result?.variants || []).map(v => ({
      catalog_variant_id: v.id,
      name: v.name
    }));

    console.log(`--- ${p.name} (external_id: ${p.external_id}) ---`);
    console.log(`  Store product ID : ${p.id}`);
    if (variants.length > 0) {
      variants.forEach(v => console.log(`  variant_id: ${v.catalog_variant_id}  =>  ${v.name}`));
    }
    console.log('');
  }
}

main().catch(console.error);
