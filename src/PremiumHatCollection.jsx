import { useEffect, useState } from 'react';
import { shopifyClient } from './shopifyClient';

export default function PremiumHatCollection() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. GraphQL Query to fetch Printful items synced to your Shopify catalog
  useEffect(() => {
    const fetchProductsQuery = `
      query GetProducts {
        products(first: 6) {
          edges {
            node {
              id
              title
              description
              images(first: 1) {
                edges {
                  node {
                    url
                  }
                }
              }
              variants(first: 1) {
                edges {
                  node {
                    id
                    price {
                      amount
                    }
                  }
                }
              }
            }
          }
        }
      }
    `;

    shopifyClient.request(fetchProductsQuery)
      .then(({ data }) => {
        setProducts(data.products.edges);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Storefront API fetch failing:", err);
        setLoading(false);
      });
  }, []);

  // 2. Modern Cart Mutation to create an instant checkout session redirect
  const handleInstantBuy = async (variantId) => {
    const createCartMutation = `
      mutation CreateCartWithItem($variantId: ID!) {
        cartCreate(input: { lines: [{ quantity: 1, merchandiseId: $variantId }] }) {
          cart {
            checkoutUrl
          }
        }
      }
    `;

    try {
      const { data } = await shopifyClient.request(createCartMutation, {
        variables: { variantId },
      });
      
      if (data?.cartCreate?.cart?.checkoutUrl) {
        // Safe programmatic redirection to secure Shopify payment layout
        window.location.href = data.cartCreate.cart.checkoutUrl;
      }
    } catch (error) {
      console.error("Cart generation redirect execution failed:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <p className="text-sm tracking-widest uppercase font-semibold text-neutral-500 animate-pulse">
          Loading Custom Merchandise...
        </p>
      </div>
    );
  }

  return (
    <main className="bg-neutral-50 min-h-screen py-20 px-6 sm:px-12">
      <div className="max-w-7xl mx-auto">
        
        {/* Editorial Collection Header */}
        <div className="max-w-xl mx-auto text-center mb-16">
          <span className="text-xs font-bold tracking-widest text-neutral-400 uppercase">Premium Release</span>
          <h1 className="text-4xl sm:text-5xl font-black text-neutral-900 tracking-tight mt-2 mb-4">
            The Heritage Cap Collection
          </h1>
          <div className="w-12 h-[2px] bg-neutral-900 mx-auto mb-4"></div>
          <p className="text-neutral-600 text-sm sm:text-base leading-relaxed">
            Intricately detailed continuous line-stitch embroidery mapping out culture and local flora. Fulfilled dynamically and safely globally through automated Printful pipelines.
          </p>
        </div>

        {/* 3-Column Product Grid Interface */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {products.map(({ node }) => {
            const primaryImageUrl = node.images.edges[0]?.node?.url;
            const variantId = node.variants.edges[0]?.node?.id;
            const priceAmount = node.variants.edges[0]?.node?.price?.amount;

            return (
              <div 
                key={node.id} 
                className="group bg-white border border-neutral-200/50 rounded-2xl p-4 flex flex-col justify-between transition-all duration-300 hover:shadow-md hover:-translate-y-1"
              >
                <div>
                  {/* Aspect Ratio Fitted Photo Block */}
                  <div className="w-full aspect-square bg-neutral-50 rounded-xl overflow-hidden flex items-center justify-center relative">
                    {primaryImageUrl ? (
                      <img 
                        src={primaryImageUrl} 
                        alt={node.title} 
                        className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500 ease-out"
                      />
                    ) : (
                      <span className="text-xs font-medium text-neutral-400">Rendering preview...</span>
                    )}
                  </div>

                  {/* Text Description Block */}
                  <div className="mt-5 px-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <h3 className="text-lg font-bold text-neutral-900 truncate">{node.title}</h3>
                      <span className="text-base font-bold text-neutral-900 shrink-0">
                        ${parseFloat(priceAmount).toFixed(2)}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500 mt-2 line-clamp-2 leading-relaxed">
                      {node.description || "Premium double-twill two-tone composition featuring custom detailed crown panels."}
                    </p>
                  </div>
                </div>

                {/* API Interactive Trigger Button */}
                <div className="mt-6">
                  <button
                    onClick={() => handleInstantBuy(variantId)}
                    className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-medium py-3 rounded-xl transition-colors text-xs tracking-wider uppercase cursor-pointer"
                  >
                    Purchase Item
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </main>
  );
}
