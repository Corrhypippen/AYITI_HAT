import { useState, useEffect, useRef, useCallback } from 'react'
import { shopifyClient } from './shopifyClient'
import { 
  ShoppingBag, 
  ArrowRight, 
  X, 
  Plus, 
  Minus, 
  Check, 
  ShieldCheck, 
  Info,
  Maximize2,
  Sparkles,
  Award,
  Globe,
  ChevronRight,
  Star,
  Loader2,
  AlertTriangle,
  Menu
} from 'lucide-react'

// Extended product list containing the new dad hats and two-tone signature caps with multi-angle views
const STATIC_PRODUCTS = [
  {
    id: "haiti-embroidered-hat-red",
    variantId: "gid://shopify/ProductVariant/43088077553741",
    sku: "6359040_24383",
    category: "Structured",
    views: {
      front: "/427702c4-f19a-423f-9afd-e7f54c3c3e08.png",
      left: "/72988750-25ac-4fbc-853b-78c493ebfa04.png",
      right: "/3005bcb5-0375-4fbe-a078-8287c8a485a4.png"
    },
    name: "The Heritage Cap",
    accentName: "Crimson Accent",
    description: "Two-tone cream and red structured cap featuring premium embroidery intertwining the map of Haiti and the delicate Hibiscus flower. Side panel includes commemorative historical stadium details.",
    price: 30.00,
    colorway: "Cream / Crimson Red",
    hex: "#C8102E",
    accentBg: "bg-crimson",
    accentText: "text-crimson",
    hoverBorder: "hover:border-crimson",
    focusRing: "focus:ring-crimson",
    badge: "Limited Drop",
    features: [
      "High-density embroidery (12,000+ stitch count)",
      "Commemorative side panel graphics",
      "Structured 6-panel profile with premium ventilation",
      "Adjustable brass buckle enclosure",
      "Printed inner seam taping detailing 1804 independence"
    ],
    details: {
      map: "Gold & Crimson high-density outline of Hispaniola's western wing, celebrating the first free Black republic.",
      flora: "Delicately stitched Choublack (Hibiscus) representing resilience, beauty, and national pride.",
      side: "Embossed coordinates and milestone stadium markers celebrating athletic and cultural venues."
    }
  },
  {
    id: "haiti-embroidered-hat-blue",
    variantId: "gid://shopify/ProductVariant/43088071098445",
    sku: "3124731_24384",
    category: "Structured",
    views: {
      front: "/c9ab2d28-c8af-4dcb-b4be-2ba6a6dc06e6.png",
      left: "/3fe0d10c-cd10-410f-ab38-82c46c30ed1b.png",
      right: "/bc5fa623-3a73-4f37-8ea0-d49c73667320.png"
    },
    name: "The Heritage Cap",
    accentName: "Royal Accent",
    description: "Two-tone cream and blue structured cap showcasing the vibrant royal blue silhouette of Haiti's map woven with intricately stitched local flora.",
    price: 30.00,
    colorway: "Cream / Royal Blue",
    hex: "#002060",
    accentBg: "bg-royal",
    accentText: "text-royal",
    hoverBorder: "hover:border-royal",
    focusRing: "focus:ring-royal",
    badge: "Heritage Classic",
    features: [
      "High-density floral embroidery",
      "Royal Blue contrast bill & top button",
      "100% premium heavy cotton twill base",
      "Embroidered grommets for breathability",
      "Premium moisture-wicking sweatband"
    ],
    details: {
      map: "Royal blue high-relief map silhouette integrated with native ferns and blue palm leaf threadwork.",
      flora: "Intricate royal blue hibiscus floral petals weaving along the southern peninsula coastline.",
      side: "Commemorative 'L'Union Fait la Force' typography stitched in metallic silver threads."
    }
  },
  {
    id: "haiti-embroidered-hat-green",
    variantId: "gid://shopify/ProductVariant/43088068182093", // Snapback dark-green-natural
    category: "Structured",
    views: {
      front: "/5-panel-mid-profile-baseball-cap-dark-green-natural-front-6a0cdabf1506e.png",
      left: "/5-panel-mid-profile-baseball-cap-dark-green-natural-left-front-6a0cdabf13a30.png",
      right: "/5-panel-mid-profile-baseball-cap-dark-green-natural-right-front-6a0cdabf13b06.png"
    },
    name: "The Heritage Cap",
    accentName: "Forest Accent",
    description: "Two-tone cream and deep forest green structured cap highlighting clean tonal embroidery, cultural icons, and historical milestone dates on the side flank.",
    price: 30.00,
    colorway: "Cream / Forest Green",
    hex: "#18453B",
    accentBg: "bg-forest",
    accentText: "text-forest",
    hoverBorder: "hover:border-forest",
    focusRing: "focus:ring-forest",
    badge: "Editorial Choice",
    features: [
      "Tonal forest green satin embroidery",
      "Side flank historical milestone stitching",
      "Premium mid-profile structured crown",
      "Custom metal clasp with debossed emblem",
      "Sourced sustainably under ethical standards"
    ],
    details: {
      map: "Deep forest green map silhouette representing Haiti's lush, mountainous landscapes (Ayiti: 'Land of High Mountains').",
      flora: "Tonal forest leaf and palm silhouettes stitched alongside the map's border.",
      side: "Sovereign emblem coordinates and key historical revolutionary milestone dates."
    }
  },
  {
    id: "haiti-5panel-classic",
    variantId: "gid://shopify/ProductVariant/43081754935373",
    sku: "7216013_24381",
    category: "Structured",
    views: {
      front: "/haiti-5panel-front.jpg",
      left: "/5-panel-mid-profile-baseball-cap-dark-green-natural-left-front-6a0cdabf13a30.png",
      right: "/5-panel-mid-profile-baseball-cap-dark-green-natural-right-front-6a0cdabf13b06.png"
    },
    name: "The Heritage Cap",
    accentName: "Forest Classic",
    description: "Two-tone cream and forest green classic structured cap featuring high-density embroidery detailing the map of Haiti and local flora. Complete with commemorative side flank flag patch and icons.",
    price: 30.00,
    colorway: "Cream / Forest Classic",
    hex: "#18453B",
    accentBg: "bg-forest",
    accentText: "text-forest",
    hoverBorder: "hover:border-forest",
    focusRing: "focus:ring-forest",
    badge: "Classic Series",
    features: [
      "High-density floral map outline embroidery",
      "Haitian flag side patch and 1974 milestone graphics",
      "Structured mid-profile crown profile",
      "Forest green visor, button, and eyelets",
      "Premium adjustable snapback closure"
    ],
    details: {
      map: "Finely stitched outline of Haiti's historic borders in forest green.",
      flora: "Hibiscus blooms and leaves woven directly inside the map contour.",
      side: "Haitian bicolor flag and commemorative year markers celebrating national history."
    }
  },
  {
    id: "haiti-dad-hat-red",
    variantId: "gid://shopify/ProductVariant/43088054550605", // Dad hat cranberry
    category: "Unstructured",
    views: {
      front: "/0a79fa1a-0ca4-45ad-abac-f480f3685d96.png",
      left: "/799434a2-3358-41de-b07f-66b6c8296b97.png",
      right: "/8c9e7e49-39c8-45a6-9dd7-d98ce71bfc4f.png"
    },
    name: "The Liberté Dad Cap",
    accentName: "Crimson Red",
    description: "Classic unstructured crimson red cotton cap featuring premium royal blue and white embroidery of the Haitian map and choublack details. A relaxed fit with heritage pride.",
    price: 30.00,
    colorway: "Crimson / Blue-White Accent",
    hex: "#C8102E",
    accentBg: "bg-crimson",
    accentText: "text-crimson",
    hoverBorder: "hover:border-crimson",
    focusRing: "focus:ring-crimson",
    badge: "New Release",
    features: [
      "Unstructured low-profile 6-panel construction",
      "Royal Blue and White high-relief map embroidery",
      "100% washed cotton twill for a vintage look",
      "Self-fabric slide closure with brass buckle",
      "Breathable sewn eyelets"
    ],
    details: {
      map: "Vibrant royal blue and white stitched outline of Haiti's map, celebrating national colors.",
      flora: "Tonal white choublack flowers woven into the northern and southern coastlines.",
      side: "Clean, minimalist side flank styling."
    }
  },
  {
    id: "haiti-dad-hat-white",
    variantId: "gid://shopify/ProductVariant/43088037085261", // Dad hat white
    category: "Unstructured",
    views: {
      front: "/classic-dad-hat-white-front-6a1af20c4a149.jpg",
      left: "/classic-dad-hat-white-left-front-6a1af20c4abf1.jpg",
      right: "/classic-dad-hat-white-right-front-6a1af20c4a7a0.jpg"
    },
    name: "The Liberté Dad Cap",
    accentName: "Off-White",
    description: "Classic unstructured off-white cotton cap with bold black outline embroidery. Features commemorative 1804 independence markers and red flag emblem on the side flank.",
    price: 30.00,
    colorway: "Off-White / Black Accent",
    hex: "#FDFBF7",
    accentBg: "bg-neutral-400",
    accentText: "text-neutral-500",
    hoverBorder: "hover:border-neutral-400",
    focusRing: "focus:ring-neutral-400",
    badge: "New Release",
    features: [
      "Vintage washed cotton twill in natural off-white",
      "Bold black line embroidery detailing map and choublack flora",
      "Commemorative '1804' and stadium side flank graphics",
      "Unstructured relaxed fit with soft crown",
      "Brass buckle adjustment strap"
    ],
    details: {
      map: "Sharp black thread map outline, bringing high-contrast streetwear aesthetic.",
      flora: "Black stitched local hibiscus details sitting along the map's border.",
      side: "Crimson red stitched stadium emblem and '2026 / 1974 / 1804' commemorative text."
    }
  },
  {
    id: "haiti-dad-hat-black",
    variantId: "gid://shopify/ProductVariant/43088045703245", // Dad hat black
    category: "Unstructured",
    views: {
      front: "/classic-dad-hat-black-front-6a1af34543064.jpg",
      left: "/classic-dad-hat-black-left-front-6a1af34543c75.jpg",
      right: "/classic-dad-hat-black-right-front-6a1af34543710.jpg"
    },
    name: "The Liberté Dad Cap",
    accentName: "Noir",
    description: "Classic unstructured black cotton cap showcasing a vibrant red map and white flower embroidery. Complete with commemorative red side flank graphics.",
    price: 30.00,
    colorway: "Noir / Crimson Accent",
    hex: "#16171d",
    accentBg: "bg-neutral-900",
    accentText: "text-neutral-900",
    hoverBorder: "hover:border-neutral-900",
    focusRing: "focus:ring-neutral-900",
    badge: "New Release",
    features: [
      "Heavyweight black cotton twill vintage wash",
      "Vibrant crimson red map outline with contrast white choublack flowers",
      "Commemorative red side flank emblem and milestone markers",
      "Unstructured 6-panel configuration",
      "Adjustable slide strap"
    ],
    details: {
      map: "Bold crimson red stitched map silhouette standing raised against black twill.",
      flora: "Contrast white stitched hibiscus petals reflecting light and texture.",
      side: "Stitched side panel detailing the historic stadium coordinates and 1804 landmark text."
    }
  },
  {
    id: "haiti-5panel-souverain",
    variantId: "gid://shopify/ProductVariant/43088075685965", // Snapback black-natural
    category: "Structured",
    views: {
      front: "/5-panel-mid-profile-baseball-cap-black-natural-front-6a19e1a8d1649.jpg",
      left: "/5-panel-mid-profile-baseball-cap-black-natural-left-front-6a19e1a8d1cbd.jpg",
      right: "/5-panel-mid-profile-baseball-cap-black-natural-right-front-6a19e1a8d1ec3.jpg"
    },
    name: "The Souverain Cap",
    accentName: "Cream & Black",
    description: "Premium two-tone structured cap with a natural cream crown, black bill, and elegant gold/olive embroidery. Features the Haitian bicolor flag emblem stitched on the side flank.",
    price: 30.00,
    colorway: "Cream / Black / Gold",
    hex: "#D4AF37", // Gold
    accentBg: "bg-neutral-950",
    accentText: "text-neutral-950",
    hoverBorder: "hover:border-neutral-950",
    focusRing: "focus:ring-neutral-950",
    badge: "Signature Series",
    features: [
      "Two-tone structured mid-profile setup",
      "Stunning gold-olive map and choublack floral embroidery",
      "Haitian bicolor flag side patch in crimson and royal blue",
      "Black contrast bill, top button, and eyelets",
      "Premium snapback closure with brass eyelet details"
    ],
    details: {
      map: "Gold and olive outline map of Haiti, representing sovereignty, richness, and land prosperity.",
      flora: "Tonal gold choublack flowers woven into the map's western shores.",
      side: "Embroidered Haitian flag graphic on the side panel with high-contrast stitching."
    }
  }
]

// ── Focus trap helper ──────────────────────────────────────────────────────────
function useFocusTrap(isOpen) {
  const ref = useRef(null)
  useEffect(() => {
    if (!isOpen || !ref.current) return
    const el = ref.current
    const focusable = el.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    const previouslyFocused = document.activeElement
    first?.focus()
    const trap = (e) => {
      if (e.key !== 'Tab') return
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last?.focus() }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first?.focus() }
      }
    }
    el.addEventListener('keydown', trap)
    return () => {
      el.removeEventListener('keydown', trap)
      previouslyFocused?.focus()
    }
  }, [isOpen])
  return ref
}

function App() {
  // Dynamic products state (defaults to static metadata)
  const [products, setProducts] = useState(STATIC_PRODUCTS)

  // Loading / error states for Shopify fetch
  const [isLoading, setIsLoading] = useState(true)
  const [fetchError, setFetchError] = useState(null)

  // Checkout in-flight state
  const [isCheckingOut, setIsCheckingOut] = useState(false)

  // Cart state – hydrated from localStorage
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('ayiti_cart')
      return saved ? JSON.parse(saved) : []
    } catch { return [] }
  })
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  // Hero and Showcase view states
  const [activeHeroIndex, setActiveHeroIndex] = useState(6) // Set Souverain Cap as default hero
  const [heroView, setHeroView] = useState("front") // Hero position state: front / left / right
  const [hoveredCardId, setHoveredCardId] = useState(null)
  
  // Quick View Modal state
  const [quickViewProduct, setQuickViewProduct] = useState(null)
  const [quickViewPosition, setQuickViewPosition] = useState("front") // Modal position state: front / left / right
  
  // Card-specific active view angle trackers (maps product.id -> "front" | "left" | "right")
  const [productViews, setProductViews] = useState({
    "haiti-embroidered-hat-red": "front",
    "haiti-embroidered-hat-blue": "front",
    "haiti-embroidered-hat-green": "front",
    "haiti-5panel-classic": "front",
    "haiti-dad-hat-red": "front",
    "haiti-dad-hat-white": "front",
    "haiti-dad-hat-black": "front",
    "haiti-5panel-souverain": "front"
  })

  // Toast Notification state
  const [toast, setToast] = useState({ show: false, message: "" })

  // Interactive Embroidery Zoom state
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0, show: false })

  // Focus trap refs for modals
  const cartRef = useFocusTrap(isCartOpen)
  const quickViewRef = useFocusTrap(!!quickViewProduct)

  // Persist cart to localStorage whenever it changes
  useEffect(() => {
    try { localStorage.setItem('ayiti_cart', JSON.stringify(cart)) } catch {}
  }, [cart])

  // Close modals on ESC
  useEffect(() => {
    const handler = (e) => {
      if (e.key !== 'Escape') return
      if (quickViewProduct) { setQuickViewProduct(null); return }
      if (isCartOpen) setIsCartOpen(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isCartOpen, quickViewProduct])

  const triggerToast = (msg) => {
    setToast({ show: true, message: msg })
    setTimeout(() => {
      setToast({ show: false, message: "" })
    }, 3000)
  }

  // Fetch live price/description from Shopify using the hardcoded variantIds
  useEffect(() => {
    const variantIds = STATIC_PRODUCTS.map(p => p.variantId).filter(Boolean);
    if (variantIds.length === 0) { setIsLoading(false); return; }

    const fetchVariantsQuery = `
      query GetVariants($ids: [ID!]!) {
        nodes(ids: $ids) {
          ... on ProductVariant {
            id
            sku
            price {
              amount
            }
            product {
              title
              description
            }
          }
        }
      }
    `;

    shopifyClient.request(fetchVariantsQuery, { variables: { ids: variantIds } })
      .then(({ data }) => {
        if (data?.nodes?.length > 0) {
          const liveMap = {};
          data.nodes.forEach((node) => {
            if (node?.id) liveMap[node.id] = node;
          });
          const mapped = STATIC_PRODUCTS.map((staticProd) => {
            const live = liveMap[staticProd.variantId];
            if (live) {
              return {
                ...staticProd,
                variantId: staticProd.variantId,
                sku: live.sku || staticProd.sku,
                price: parseFloat(live.price?.amount || staticProd.price),
                description: live.product?.description || staticProd.description,
              };
            }
            return staticProd;
          });
          setProducts(mapped);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Storefront API variant fetch failed, using static catalog:", err);
        setFetchError("Could not load live pricing — showing catalog prices.");
        setIsLoading(false);
      });
  }, []);

  // Checkout mutation triggered when proceeding to Shopify checkout
  const handleCheckout = async () => {
    const lines = cart.map(item => {
      return item.variantId ? {
        quantity: item.quantity,
        merchandiseId: item.variantId
      } : null;
    }).filter(Boolean);

    if (lines.length === 0) {
      triggerToast("Sandbox Checkout: No active Shopify variant IDs found.");
      setTimeout(() => {
        setCart([]);
        setIsCartOpen(false);
      }, 2000);
      return;
    }

    setIsCheckingOut(true);
    triggerToast("Initiating secure checkout redirect...");

    const createCartMutation = `
      mutation CreateCart($lines: [CartLineInput!]!) {
        cartCreate(input: { lines: $lines }) {
          cart {
            checkoutUrl
          }
        }
      }
    `;

    try {
      const { data } = await shopifyClient.request(createCartMutation, {
        variables: { lines },
      });
      
      if (data?.cartCreate?.cart?.checkoutUrl) {
        window.location.href = data.cartCreate.cart.checkoutUrl;
      } else {
        triggerToast("Failed to retrieve checkout URL from Shopify.");
        setIsCheckingOut(false);
      }
    } catch (error) {
      console.error("Shopify Checkout mutation redirect failed:", error);
      triggerToast("Checkout failed. Check console for details.");
      setIsCheckingOut(false);
    }
  };

  // Cart operations
  const addToCart = (product) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === product.id)
      if (existing) {
        return prevCart.map((item) => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      }
      return [...prevCart, { ...product, quantity: 1 }]
    })
    triggerToast(`Added ${product.name} (${product.accentName}) to cart!`)
  }

  const updateQuantity = (id, delta) => {
    setCart((prevCart) => 
      prevCart.map((item) => {
        if (item.id === id) {
          const newQty = item.quantity + delta
          return newQty > 0 ? { ...item, quantity: newQty } : null
        }
        return item
      }).filter(Boolean)
    )
  }

  const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0)
  const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0)

  // Zoom handler for embroidery inspection box
  const handleZoomMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - left) / width) * 100
    const y = ((e.clientY - top) / height) * 100
    setZoomPos({ x, y, show: true })
  }

  const handleZoomMouseLeave = () => {
    setZoomPos({ x: 0, y: 0, show: false })
  }

  // Open Quick View and reset view position
  const openQuickView = (product) => {
    setQuickViewProduct(product)
    setQuickViewPosition("front")
  }

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 selection:bg-crimson selection:text-white flex flex-col font-sans overflow-x-hidden">
      
      {/* Top Banner */}
      <div className="bg-neutral-900 text-neutral-100 text-xs tracking-[0.15em] py-2.5 px-4 text-center font-medium uppercase relative z-30">
        <div className="container mx-auto flex items-center justify-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-cream animate-pulse" />
          <span>Free shipping on orders over $75</span>
          <span className="hidden md:inline mx-2">•</span>
          <span className="hidden md:inline">Printful High-Density Embroidery Series</span>
        </div>
      </div>

      {/* Navigation */}
      <header className="sticky top-0 z-20 bg-neutral-50/95 backdrop-blur-md border-b border-neutral-200/50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-neutral-900 hover:text-neutral-700 transition-colors p-2 -ml-2"
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Logo */}
          <a href="#" className="flex items-center gap-2.5 group">
            <span className="font-display font-black text-2xl tracking-tighter uppercase text-neutral-900 group-hover:text-neutral-700 transition-colors">
              AYITI<span className="text-crimson">.</span><span className="text-royal">H</span>
            </span>
            <span className="bg-neutral-900 text-white text-[9px] font-bold tracking-widest px-2 py-0.5 uppercase rounded-sm">
              Studio
            </span>
          </a>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold tracking-wider uppercase text-neutral-600">
            <a href="#collection" className="hover:text-neutral-900 hover:underline underline-offset-4 decoration-crimson decoration-2 transition-all">Collection</a>
            <a href="#symbolism" className="hover:text-neutral-900 hover:underline underline-offset-4 decoration-royal decoration-2 transition-all">Our Story</a>
            <a href="#craftsmanship" className="hover:text-neutral-900 hover:underline underline-offset-4 decoration-forest decoration-2 transition-all">Craftsmanship</a>
            <a href="#faq" className="hover:text-neutral-900 transition-colors">FAQ</a>
          </nav>

          {/* Cart Trigger */}
          <button 
            onClick={() => setIsCartOpen(true)}
            className="flex items-center gap-2.5 bg-neutral-900 hover:bg-neutral-800 text-white px-5 py-2.5 rounded-full text-xs font-bold tracking-widest uppercase transition-all duration-300 transform active:scale-95 shadow-md shadow-neutral-900/10 hover:shadow-lg"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden sm:inline">Cart</span>
            <span className="bg-cream text-neutral-900 font-black rounded-full w-5 h-5 flex items-center justify-center text-[10px] animate-bounce">
              {cartItemCount}
            </span>
          </button>
        </div>

        {/* Mobile Navigation Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-neutral-200 shadow-lg px-6 py-6 space-y-6">
            <nav className="flex flex-col space-y-4 text-sm font-semibold tracking-wider uppercase text-neutral-600">
              <a 
                href="#collection" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="hover:text-neutral-900 py-2 border-b border-neutral-100"
              >
                Collection
              </a>
              <a 
                href="#symbolism" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="hover:text-neutral-900 py-2 border-b border-neutral-100"
              >
                Our Story
              </a>
              <a 
                href="#craftsmanship" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="hover:text-neutral-900 py-2 border-b border-neutral-100"
              >
                Craftsmanship
              </a>
              <a 
                href="#faq" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="hover:text-neutral-900 py-2"
              >
                FAQ
              </a>
            </nav>
            <button 
              onClick={() => {
                setIsMobileMenuOpen(false);
                setIsCartOpen(true);
              }}
              className="w-full flex items-center justify-center gap-2.5 bg-neutral-900 hover:bg-neutral-800 text-white py-3.5 rounded-xl text-xs font-bold tracking-widest uppercase transition-all"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Cart ({cartItemCount})</span>
            </button>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-neutral-100 to-neutral-50 py-16 lg:py-24 border-b border-neutral-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-y-6 lg:gap-y-6 lg:gap-x-8 items-center">
            
            {/* Title / Header block */}
            <div className="col-span-1 lg:col-span-6 lg:col-start-1 lg:row-start-1 space-y-6 text-center lg:text-left z-10 order-1">
              <div className="inline-flex items-center gap-2 bg-neutral-200/60 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest text-neutral-700 uppercase">
                <span className="flex h-2 w-2 relative">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${products[activeHeroIndex]?.accentBg || ''}`}></span>
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${products[activeHeroIndex]?.accentBg || ''}`}></span>
                </span>
                <span>{products[activeHeroIndex]?.badge || ''}</span>
              </div>

              <h1 className="font-display font-black text-5xl sm:text-6xl xl:text-7xl uppercase text-neutral-900 leading-[0.9] tracking-tighter">
                CULTURE <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-neutral-950 via-neutral-700 to-neutral-950">
                  WEAVED
                </span> IN <br />
                EVERY FIBER<span className={products[activeHeroIndex]?.accentText || ''}>.</span>
              </h1>

              <p className="text-neutral-600 text-base sm:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed font-light">
                Celebrating Haitian resilience and heritage through premium, high-density embroidered streetwear. A headless Printful integration brings structural perfection and detailed Choublack (Hibiscus) floristry into physical form.
              </p>
            </div>

            {/* Right Large Hat Preview with interactive effects */}
            <div className="col-span-1 lg:col-span-6 lg:col-start-7 lg:row-start-1 lg:row-span-5 flex flex-col items-center justify-center relative min-h-[320px] sm:min-h-[400px] order-2 z-10">
              {/* Decorative background element */}
              <div className="absolute w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-neutral-200/40 mix-blend-multiply filter blur-2xl top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>

              {/* Image Frame */}
              <div className="relative w-full max-w-lg aspect-square bg-cream rounded-3xl border border-neutral-200/60 shadow-xl overflow-hidden group">
                <img
                  key={`hero-${activeHeroIndex}-${heroView}`}
                  src={products[activeHeroIndex]?.views?.[heroView] || ''}
                  alt={products[activeHeroIndex]?.name || ''}
                  fetchpriority="high"
                  className="w-full h-full object-contain p-8 transition-transform duration-700 ease-out hover:scale-105"
                />

                <span className="absolute bottom-4 left-4 bg-neutral-900/80 backdrop-blur-sm text-cream px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase">
                  {products[activeHeroIndex]?.colorway || ''} — {heroView}
                </span>

                <button 
                  onClick={() => products[activeHeroIndex] && openQuickView(products[activeHeroIndex])}
                  className="absolute top-4 right-4 bg-white hover:bg-neutral-100 text-neutral-900 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-transform duration-300 hover:scale-110 active:scale-95"
                  aria-label="Quick view this hat"
                >
                  <Maximize2 className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            </div>

            {/* Color & Angle selectors */}
            <div className="col-span-1 lg:col-span-6 lg:col-start-1 lg:row-start-2 flex flex-wrap items-center justify-center lg:justify-start gap-6 order-3 pt-2">
              {/* Variant swatches */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Hat:</span>
                <div className="flex flex-wrap items-center gap-2 bg-neutral-200/50 p-1.5 rounded-full border border-neutral-300/30">
                  {products.map((prod, index) => {
                    const isLightColor = prod.hex === '#FDFBF7' || prod.hex === '#D4AF37';
                    return (
                      <button
                        key={prod.id}
                        onClick={() => { setActiveHeroIndex(index); setHeroView("front"); }}
                        className={`w-7 h-7 rounded-full border-2 transition-all duration-300 flex items-center justify-center cursor-pointer ${
                          activeHeroIndex === index ? 'border-neutral-900 scale-110' : 'border-transparent opacity-70 hover:opacity-100'
                        }`}
                        style={{ backgroundColor: prod.hex }}
                        title={`${prod.name} (${prod.colorway})`}
                      >
                        {activeHeroIndex === index && (
                          <Check 
                            className={`w-3.5 h-3.5 ${
                              isLightColor ? 'text-neutral-900' : 'text-white'
                            }`} 
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Hero Position selectors */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Angle:</span>
                <div className="flex items-center gap-1 bg-neutral-200/50 p-1 rounded-lg border border-neutral-300/30">
                  {["front", "left", "right"].map((view) => (
                    <button
                      key={view}
                      onClick={() => setHeroView(view)}
                      className={`px-3 py-1 rounded-md text-[9px] font-bold tracking-widest uppercase transition-all duration-200 ${
                        heroView === view
                          ? "bg-neutral-900 text-white shadow-sm"
                          : "text-neutral-500 hover:text-neutral-900"
                      }`}
                    >
                      {view}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Variant Details Preview (1) */}
            <div className="col-span-1 lg:col-span-6 lg:col-start-1 lg:row-start-3 bg-cream/80 backdrop-blur-sm border border-neutral-200/60 p-5 rounded-xl max-w-lg mx-auto lg:mx-0 shadow-sm transition-all duration-300 order-4 w-full text-center lg:text-left">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-bold tracking-widest uppercase text-neutral-400 block mb-1">Active Colorway</span>
                  <span className="font-display font-extrabold text-lg block text-neutral-900">{products[activeHeroIndex]?.name || ''} — {products[activeHeroIndex]?.accentName || ''}</span>
                </div>
                {products[activeHeroIndex]?.sku && (
                  <div className="text-right">
                    <span className="text-[10px] font-bold tracking-widest uppercase text-neutral-400 block mb-1">SKU</span>
                    <span className="text-xs font-mono font-bold text-neutral-700 bg-neutral-200/60 px-2 py-0.5 rounded">{products[activeHeroIndex]?.sku}</span>
                  </div>
                )}
              </div>
              <p className="text-neutral-500 text-xs mt-2 leading-relaxed font-light">
                {products[activeHeroIndex]?.description || ''}
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="col-span-1 lg:col-span-6 lg:col-start-1 lg:row-start-4 flex items-center justify-center lg:justify-start gap-4 order-5 w-full">
              <a
                href="#collection"
                className="flex-1 sm:flex-initial text-center bg-neutral-900 hover:bg-neutral-800 text-white px-8 py-4 rounded-full text-xs font-bold tracking-widest uppercase transition-all duration-300 hover:shadow-xl hover:shadow-neutral-900/10 active:scale-95"
              >
                Explore Drop
              </a>
              <button
                onClick={() => products[activeHeroIndex] && addToCart(products[activeHeroIndex])}
                className="flex-1 sm:flex-initial bg-white hover:bg-neutral-100 text-neutral-900 border border-neutral-300 hover:border-neutral-400 px-8 py-4 rounded-full text-xs font-bold tracking-widest uppercase transition-all duration-300 active:scale-95 flex items-center justify-center gap-2"
              >
                <span>Buy Now</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Heritage Note */}
            <div className="col-span-1 lg:col-span-6 lg:col-start-1 lg:row-start-5 pt-6 border-t border-neutral-200/50 flex flex-wrap justify-center lg:justify-start gap-x-8 gap-y-3 text-xs text-neutral-500 font-medium tracking-wide order-6">
              <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-forest" /> 100% Premium Twill</span>
              <span className="flex items-center gap-1.5"><Award className="w-4 h-4 text-crimson" /> High-Density Stitched</span>
              <span className="flex items-center gap-1.5"><Globe className="w-4 h-4 text-royal" /> Haitian Heritage</span>
            </div>

          </div>
        </div>
      </section>

      {/* Product Showcase Section */}
      <section id="collection" className="py-20 lg:py-28 bg-neutral-50 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section Header */}
          <div className="max-w-3xl mx-auto text-center mb-16 space-y-4">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-400">THE REVOLUTIONARY THREAD</span>
            <h2 className="font-display font-black text-4xl sm:text-5xl uppercase tracking-tight text-neutral-900 leading-none">
              THE HERITAGE DROP
            </h2>
            <div className="h-1 w-16 bg-neutral-900 mx-auto rounded-full"></div>
            <p className="text-neutral-500 max-w-lg mx-auto font-light leading-relaxed">
              Explore our structured caps and newly released unstructured dad hats. Use the angle selector in each card to inspect the embroidery from different positions (Front, Left Front, Right Front).
            </p>
          </div>

          {/* Fetch error banner */}
          {fetchError && (
            <div className="mb-8 flex items-center gap-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-5 py-3 text-xs font-medium">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{fetchError}</span>
            </div>
          )}

          {/* Product Grid – skeleton while loading, real cards once loaded */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" aria-label="Loading products">
              {[...Array(7)].map((_, i) => (
                <div key={i} className="bg-white border border-neutral-200/60 rounded-2xl overflow-hidden shadow-sm flex flex-col">
                  <div className="aspect-square bg-neutral-200 animate-pulse" />
                  <div className="p-6 space-y-3">
                    <div className="h-3 w-1/2 bg-neutral-200 rounded animate-pulse" />
                    <div className="h-5 w-3/4 bg-neutral-200 rounded animate-pulse" />
                    <div className="h-3 w-full bg-neutral-200 rounded animate-pulse" />
                    <div className="h-10 w-full bg-neutral-200 rounded-xl animate-pulse mt-4" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => {
              // Current active view position for this card
              const currentView = productViews[product.id] || "front"
              const displayImage = product.views?.[currentView] || ""

              return (
                <div 
                  key={product.id}
                  onMouseEnter={() => setHoveredCardId(product.id)}
                  onMouseLeave={() => setHoveredCardId(null)}
                  className="group bg-white border border-neutral-200/60 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col h-full hover:-translate-y-1"
                >
                  {/* Image container */}
                  <div className="relative aspect-square bg-cream overflow-hidden border-b border-neutral-100 flex items-center justify-center p-6">
                    
                    {/* Badge */}
                    <span className="absolute top-4 left-4 z-10 bg-neutral-900 text-white text-[9px] font-bold tracking-widest px-2.5 py-1 uppercase rounded-sm">
                      {product.badge}
                    </span>

                    {/* Image */}
                    <img
                      key={displayImage}
                      src={displayImage}
                      alt={`${product.name} – ${product.accentName} (${product.colorway})`}
                      loading="eager"
                      className="w-full h-full object-contain p-4 transition-transform duration-700 ease-out group-hover:scale-105"
                    />

                    {/* Quick View overlay hover button */}
                    <div className="absolute inset-0 bg-neutral-900/10 opacity-0 group-hover:opacity-100 active:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none group-hover:pointer-events-auto">
                      <button 
                        onClick={() => openQuickView(product)}
                        className="bg-white hover:bg-neutral-100 text-neutral-900 text-xs font-bold tracking-widest uppercase px-5 py-3 rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 pointer-events-auto"
                      >
                        Quick Details
                      </button>
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs font-bold tracking-wider text-neutral-400 uppercase block">
                            {product.colorway}
                          </span>
                          {product.sku && (
                            <span className="text-[9px] font-mono text-neutral-400 block mt-0.5">
                              SKU: {product.sku}
                            </span>
                          )}
                        </div>
                        <span className="font-display font-black text-lg text-neutral-950">
                          ${product.price.toFixed(2)}
                        </span>
                      </div>

                      <h3 className="font-display font-black text-xl uppercase text-neutral-900 group-hover:text-neutral-700 transition-colors">
                        {product.name}
                      </h3>
                      
                      <p className="text-neutral-500 text-xs leading-relaxed font-light line-clamp-2">
                        {product.description}
                      </p>
                    </div>

                    <div className="space-y-4 pt-2">
                      {/* Position selectors instead of color swatches */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-lg border border-neutral-200/50">
                          {["front", "left", "right"].map((view) => (
                            <button
                              key={view}
                              onClick={() => setProductViews(prev => ({
                                ...prev,
                                [product.id]: view
                              }))}
                              className={`px-2.5 py-1 rounded-md text-[9px] font-extrabold tracking-wider uppercase transition-all duration-200 ${
                                currentView === view
                                  ? "bg-neutral-900 text-white shadow-sm"
                                  : "text-neutral-500 hover:text-neutral-900"
                              }`}
                            >
                              {view === "front" ? "Front" : view === "left" ? "Left" : "Right"}
                            </button>
                          ))}
                        </div>
                        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                          {product.category} Fit
                        </span>
                      </div>

                      {/* CTA Button */}
                      <button
                        onClick={() => addToCart(product)}
                        className={`w-full ${product.accentBg} hover:opacity-90 text-white font-bold text-xs tracking-widest uppercase py-3.5 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 transform active:scale-[0.98] shadow-sm`}
                      >
                        <ShoppingBag className="w-4 h-4" />
                        <span>Add To Cart</span>
                      </button>
                    </div>

                  </div>
                </div>
              )
            })}
          </div>
          )}{/* end isLoading ternary */}

        </div>
      </section>

      {/* Editorial Split-Screen Story Section */}
      <section id="symbolism" className="py-20 lg:py-28 bg-cream border-t border-b border-neutral-200/50 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-stretch">
            
            {/* Left Column: Symbolism & History */}
            <div className="flex flex-col justify-between space-y-8">
              
              <div className="space-y-4">
                <span className="text-xs font-black uppercase tracking-[0.25em] text-crimson">HERITAGE STORY</span>
                <h2 className="font-display font-black text-4xl sm:text-5xl uppercase tracking-tighter text-neutral-900 leading-none">
                  THE EMBLEMS OF <br />
                  OUR LIBERATION
                </h2>
                <div className="h-1 w-20 bg-crimson rounded-full"></div>
              </div>

              <p className="text-neutral-600 text-sm leading-relaxed font-light">
                Each motif stitched onto the Heritage Series and Liberté Dad Caps holds profound cultural significance. We weave history directly into contemporary streetwear to create pieces that speak of resistance, beauty, and national sovereignty.
              </p>

              {/* Vertical Card details */}
              <div className="space-y-6">
                
                {/* Detail 1 */}
                <div className="bg-white p-6 rounded-2xl border border-neutral-200/60 shadow-sm flex gap-4 transition-all hover:shadow-md">
                  <div className="w-10 h-10 rounded-full bg-crimson/10 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-crimson">01</span>
                  </div>
                  <div>
                    <h4 className="font-display font-extrabold text-neutral-900 text-base uppercase">The Map of Haiti (Ayiti)</h4>
                    <p className="text-neutral-500 text-xs mt-1 leading-normal font-light">
                      The high-density gold and colored outline maps the western section of Hispaniola. As the first independent Black republic on Earth (1804), the silhouette stands as a global emblem of ultimate liberty and revolutionary strength.
                    </p>
                  </div>
                </div>

                {/* Detail 2 */}
                <div className="bg-white p-6 rounded-2xl border border-neutral-200/60 shadow-sm flex gap-4 transition-all hover:shadow-md">
                  <div className="w-10 h-10 rounded-full bg-royal/10 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-royal">02</span>
                  </div>
                  <div>
                    <h4 className="font-display font-extrabold text-neutral-900 text-base uppercase">Choublack (The Hibiscus Flower)</h4>
                    <p className="text-neutral-500 text-xs mt-1 leading-normal font-light">
                      Woven intricately along the coastline is the delicate Choublack flower. Symbolizing natural beauty and vibrant life thriving amidst historical struggle, it represents the heart of the Haitian landscape.
                    </p>
                  </div>
                </div>

                {/* Detail 3 */}
                <div className="bg-white p-6 rounded-2xl border border-neutral-200/60 shadow-sm flex gap-4 transition-all hover:shadow-md">
                  <div className="w-10 h-10 rounded-full bg-forest/10 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-forest">03</span>
                  </div>
                  <div>
                    <h4 className="font-display font-extrabold text-neutral-900 text-base uppercase">Commemorative Side Panel</h4>
                    <p className="text-neutral-500 text-xs mt-1 leading-normal font-light">
                      The side flank features clean, tonal embroidery documenting coordinates and milestones that anchor the caps in historical contexts. Heavy duty thread-work keeps memories resilient.
                    </p>
                  </div>
                </div>

              </div>

            </div>

            {/* Right Column: Embroidery Quality & Craftsmanship */}
            <div id="craftsmanship" className="flex flex-col justify-between bg-neutral-950 text-neutral-100 p-8 sm:p-12 rounded-3xl shadow-2xl relative overflow-hidden scroll-mt-20">
              
              {/* Subtle background glow */}
              <div className="absolute w-60 h-60 rounded-full bg-forest/20 mix-blend-screen filter blur-3xl -top-12 -right-12"></div>
              
              <div className="space-y-4 z-10">
                <span className="text-xs font-bold uppercase tracking-[0.25em] text-forest-green text-green-400">THE FABRICATION</span>
                <h2 className="font-display font-black text-4xl sm:text-5xl uppercase tracking-tighter text-white leading-none">
                  12,000+ STITCHES.<br />
                  ZERO DEVIATION.
                </h2>
                <div className="h-1 w-20 bg-green-400 rounded-full"></div>
              </div>

              {/* Interactive Embroidery Texture Zoom */}
              <div className="my-8 z-10 space-y-3">
                <span className="text-[10px] font-bold tracking-widest text-neutral-400 uppercase block">Interactive Detail Zoom</span>
                
                <div 
                  className="relative aspect-video rounded-xl bg-neutral-900 overflow-hidden border border-neutral-800 cursor-crosshair"
                  onMouseMove={handleZoomMouseMove}
                  onMouseLeave={handleZoomMouseLeave}
                >
                  {/* Base Image */}
                  <img 
                    src="/5-panel-mid-profile-baseball-cap-black-natural-front-6a19e1a8d1649.jpg" 
                    alt="Embroidery Detail"
                    className="w-full h-full object-cover opacity-60" 
                  />

                  {/* Zoom Instructions */}
                  {!zoomPos.show && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-center p-4">
                      <p className="text-xs font-bold tracking-wider uppercase text-neutral-300 flex items-center gap-2">
                        <Info className="w-4 h-4" /> Hover to Inspect Stitch Density
                      </p>
                    </div>
                  )}

                  {/* Magnifying glass overlay */}
                  {zoomPos.show && (
                    <div 
                      className="absolute pointer-events-none border-2 border-white rounded-full w-36 h-36 shadow-2xl overflow-hidden bg-neutral-950"
                      style={{
                        left: `calc(${zoomPos.x}% - 72px)`,
                        top: `calc(${zoomPos.y}% - 72px)`,
                        backgroundImage: 'url(/5-panel-mid-profile-baseball-cap-black-natural-front-6a19e1a8d1649.jpg)',
                        backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`,
                        backgroundSize: '400% 400%',
                        backgroundRepeat: 'no-repeat'
                      }}
                    />
                  )}
                </div>
                <div className="flex items-center justify-between text-[10px] text-neutral-400 uppercase tracking-widest">
                  <span>Zoom Level: 4.0x</span>
                  <span>Authentic Thread Density Preview</span>
                </div>
              </div>

              <div className="space-y-6 z-10">
                <p className="text-neutral-400 text-sm leading-relaxed font-light">
                  Partnering with Printful API headless fulfillment, we guarantee premium quality in every single hat manufactured. Our system executes high-stitch counts that raise elements to capture the natural shadows.
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <div className="border border-neutral-800 p-4 rounded-xl">
                    <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest block">Thread Count</span>
                    <span className="text-xl font-display font-black text-white">12K - 14K</span>
                    <span className="text-[10px] text-neutral-500 block mt-1">Stitches per design</span>
                  </div>

                  <div className="border border-neutral-800 p-4 rounded-xl">
                    <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest block">Cap Profile</span>
                    <span className="text-xl font-display font-black text-white">Structured & Soft</span>
                    <span className="text-[10px] text-neutral-500 block mt-1">Structured 6-Panel / Washed Twill</span>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* Customer Trust / E-commerce Features */}
      <section className="py-16 bg-neutral-100 border-b border-neutral-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-neutral-200 flex items-center justify-center shrink-0 text-neutral-800">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-display font-black text-sm uppercase tracking-wide text-neutral-900">SECURE HEADLESS CHECKOUT</h4>
                <p className="text-xs text-neutral-500 leading-normal font-light">
                  Stripe-powered transactions processed securely via our automated backend routing to Printful API.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-neutral-200 flex items-center justify-center shrink-0 text-neutral-800">
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-display font-black text-sm uppercase tracking-wide text-neutral-900">ON-DEMAND PRODUCTION</h4>
                <p className="text-xs text-neutral-500 leading-normal font-light">
                  Each hat is embroidered only when ordered, minimizing ecological waste and maintaining rigorous QA.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-neutral-200 flex items-center justify-center shrink-0 text-neutral-800">
                <Globe className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-display font-black text-sm uppercase tracking-wide text-neutral-900">GLOBAL EXPRESS SHIPPING</h4>
                <p className="text-xs text-neutral-500 leading-normal font-light">
                  Direct tracking from the production facility straight to your door with full transparent logistics.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Rating Block */}
      <section className="py-12 bg-neutral-900 text-cream">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-4">
          <div className="flex justify-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 fill-cream text-cream" />
            ))}
          </div>
          <p className="font-display font-bold text-xl italic tracking-wide">
            "The raised stitching on these hats is like nothing I've seen in normal retail. The Choublack details pop and the cap holds its structure. Outstanding tribute to our heritage!"
          </p>

        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-neutral-50 scroll-mt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">HAVE QUESTIONS?</span>
            <h2 className="font-display font-black text-3xl uppercase text-neutral-900">Frequently Asked Questions</h2>
            <div className="h-0.5 w-12 bg-neutral-900 mx-auto"></div>
          </div>

          <div className="space-y-6">
            <div className="border-b border-neutral-200 pb-5">
              <h4 className="font-display font-extrabold text-sm uppercase text-neutral-900">What is the difference between Structured and Unstructured caps?</h4>
              <p className="text-neutral-500 text-xs mt-2 leading-relaxed font-light">
                Structured caps (like our Heritage and Souverain series) feature a buckram panel behind the front panels to maintain their shape even when off the head. Unstructured caps (like our Liberté Dad Hats) lack this support, offering a softer, lower-profile fit that conforms to your head shape.
              </p>
            </div>

            <div className="border-b border-neutral-200 pb-5">
              <h4 className="font-display font-extrabold text-sm uppercase text-neutral-900">How does the Printful fulfillment integration work?</h4>
              <p className="text-neutral-500 text-xs mt-2 leading-relaxed font-light">
                Once a transaction is finalized, our headless system securely sends the design configurations and order data straight to Printful's nearest embroidery hub via their developer API. The process ensures rapid creation, exact thread counts, and fast regional fulfillment.
              </p>
            </div>

            <div className="border-b border-neutral-200 pb-5">
              <h4 className="font-display font-extrabold text-sm uppercase text-neutral-900">Are the materials ethically sourced?</h4>
              <p className="text-neutral-500 text-xs mt-2 leading-relaxed font-light">
                Yes, our raw structural caps are produced under standard fair-labor guidelines. Every order utilizes high-quality polyester threads certified safe for the environment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-950 text-neutral-400 py-12 mt-auto border-t border-neutral-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            
            <div className="space-y-4">
              <span className="font-display font-black text-xl text-white tracking-tighter uppercase">
                AYITI<span className="text-crimson">.</span><span className="text-royal">H</span>
              </span>
              <p className="text-xs text-neutral-500 leading-normal font-light">
                Premium Haitian-inspired streetwear celebrating sovereignty, landscape, and identity through detailed high-density embroidery.
              </p>
            </div>

            <div className="space-y-3">
              <h5 className="font-display font-bold text-xs uppercase tracking-widest text-neutral-100">Shop Drop</h5>
              <ul className="text-xs space-y-2 font-light">
                <li><a href="#collection" className="hover:text-white transition-colors">The Souverain Cap</a></li>
                <li><a href="#collection" className="hover:text-white transition-colors">The Heritage Cap</a></li>
                <li><a href="#collection" className="hover:text-white transition-colors">The Liberté Dad Cap</a></li>
              </ul>
            </div>

            <div className="space-y-3">
              <h5 className="font-display font-bold text-xs uppercase tracking-widest text-neutral-100">Explore</h5>
              <ul className="text-xs space-y-2 font-light">
                <li><a href="#symbolism" className="hover:text-white transition-colors">Heritage Symbolism</a></li>
                <li><a href="#craftsmanship" className="hover:text-white transition-colors">Stitch Quality</a></li>
                <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>

            <div className="space-y-3">
              <h5 className="font-display font-bold text-xs uppercase tracking-widest text-neutral-100">Newsletter</h5>
              <p className="text-xs text-neutral-500 font-light leading-normal">
                Join our collective. Receive updates on new embroidery drafts and cultural designs.
              </p>
              <form className="flex" onSubmit={(e) => { e.preventDefault(); triggerToast("Signed up successfully!"); }}>
                <input 
                  type="email" 
                  placeholder="Enter email"
                  required
                  className="bg-neutral-900 text-white border border-neutral-800 px-3 py-2 rounded-l-md text-xs focus:outline-none focus:border-neutral-700 w-full"
                />
                <button type="submit" className="bg-white text-neutral-950 font-bold px-3 py-2 rounded-r-md text-xs hover:bg-neutral-200 transition-colors">
                  Join
                </button>
              </form>
            </div>

          </div>

          <div className="border-t border-neutral-900 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
            <div>
              &copy; {new Date().getFullYear()} AYITI Heritage. All rights reserved.
            </div>
            <div className="flex gap-6">
              <a href="#" className="hover:text-neutral-400">Privacy Policy</a>
              <a href="#" className="hover:text-neutral-400">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Toast Notification */}
      {toast.show && (
        <div className="fixed bottom-6 right-6 z-50 bg-neutral-900 text-white text-xs font-bold tracking-wider uppercase px-5 py-4 rounded-xl shadow-2xl border border-neutral-800 flex items-center gap-3 animate-slide-in">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-ping"></div>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Cart Drawer Panel (Sliding Modal) */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true" aria-label="Shopping cart">
          {/* Backdrop */}
          <div 
            onClick={() => setIsCartOpen(false)}
            className="absolute inset-0 bg-neutral-900/50 backdrop-blur-sm transition-opacity duration-300"
          />

          {/* Drawer content */}
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div ref={cartRef} className="w-screen max-w-md bg-white shadow-2xl flex flex-col h-full border-l border-neutral-200/50">
              
              {/* Header */}
              <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <ShoppingBag className="w-5 h-5 text-neutral-900" aria-hidden="true" />
                  <h3 className="font-display font-black text-lg uppercase tracking-tight text-neutral-900">Your Bag ({cartItemCount})</h3>
                </div>
                <button 
                  onClick={() => setIsCartOpen(false)}
                  className="text-neutral-400 hover:text-neutral-900 transition-colors p-1"
                  aria-label="Close cart"
                >
                  <X className="w-5 h-5" aria-hidden="true" />
                </button>
              </div>

              {/* Cart Item List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400">
                      <ShoppingBag className="w-8 h-8" />
                    </div>
                    <div className="space-y-1">
                      <h5 className="font-display font-bold uppercase text-neutral-900 text-sm">Bag is empty</h5>
                      <p className="text-neutral-500 text-xs leading-normal font-light">Add items from the collection to get started.</p>
                    </div>
                    <button 
                      onClick={() => setIsCartOpen(false)}
                      className="bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs tracking-widest uppercase px-6 py-3 rounded-full transition-all"
                    >
                      Shop Collection
                    </button>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={item.id} className="flex gap-4 border-b border-neutral-100 pb-5">
                      {/* Image frame */}
                      <div className="w-20 h-20 bg-cream border border-neutral-100 rounded-lg overflow-hidden shrink-0 flex items-center justify-center p-2">
                        <img src={item.views?.front || ''} alt={item.name} loading="lazy" className="object-contain w-full h-full" />
                      </div>
                      
                      {/* Description & Qty */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div className="space-y-0.5">
                          <div className="flex justify-between items-start">
                            <h4 className="font-display font-extrabold text-sm uppercase text-neutral-900 leading-tight">{item.name}</h4>
                            <span className="font-display font-black text-sm text-neutral-900">${(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                          <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">{item.colorway}</span>
                          {item.sku && (
                            <span className="text-[9px] font-mono text-neutral-400 block">SKU: {item.sku}</span>
                          )}
                        </div>

                        {/* Adjust Qty */}
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center border border-neutral-200 rounded-md overflow-hidden bg-neutral-50">
                            <button 
                              onClick={() => updateQuantity(item.id, -1)}
                              className="px-2.5 py-1.5 hover:bg-neutral-200 transition-colors text-neutral-600"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-3 text-xs font-bold text-neutral-900">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.id, 1)}
                              className="px-2.5 py-1.5 hover:bg-neutral-200 transition-colors text-neutral-600"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          
                          <button 
                            onClick={() => updateQuantity(item.id, -item.quantity)}
                            className="text-[10px] text-red-500 font-bold uppercase tracking-widest hover:underline"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Checkout details */}
              {cart.length > 0 && (
                <div className="p-6 border-t border-neutral-100 bg-neutral-50 space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-neutral-500">
                      <span>Subtotal</span>
                      <span className="font-bold text-neutral-800">${cartTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-neutral-500">
                      <span>Shipping</span>
                      <span>{cartTotal >= 75 ? "FREE" : "$4.99"}</span>
                    </div>
                    <div className="border-t border-neutral-200 my-2 pt-2 flex justify-between text-sm font-bold text-neutral-900 uppercase">
                      <span>Estimated Total</span>
                      <span className="font-display font-black text-base text-neutral-950">
                        ${(cartTotal + (cartTotal >= 75 ? 0 : 4.99)).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <button 
                    onClick={handleCheckout}
                    disabled={isCheckingOut}
                    className="w-full bg-neutral-900 hover:bg-neutral-800 disabled:opacity-70 disabled:cursor-not-allowed text-white font-bold text-xs tracking-widest uppercase py-4 rounded-xl transition-all duration-300 hover:shadow-lg flex items-center justify-center gap-2"
                    aria-label="Proceed to secure checkout"
                  >
                    {isCheckingOut ? (
                      <><Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /><span>Redirecting…</span></>
                    ) : (
                      <><span>Proceed To Secure Checkout</span><ArrowRight className="w-4 h-4" aria-hidden="true" /></>
                    )}
                  </button>
                  <p className="text-[9px] text-neutral-400 text-center font-light leading-normal">
                    Fulfillment handled via Headless Printful REST API connection. Secure SSL Encryption active.
                  </p>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* Quick View Details Modal */}
      {quickViewProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden" role="dialog" aria-modal="true" aria-label={`Quick view: ${quickViewProduct.name}`}>
          {/* Backdrop */}
          <div 
            onClick={() => setQuickViewProduct(null)}
            className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <div ref={quickViewRef} className="relative bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-neutral-200/50 overflow-y-auto max-h-[90vh] flex flex-col md:flex-row z-10 animate-scale-up">
            
            {/* Close Button */}
            <button 
              onClick={() => setQuickViewProduct(null)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-900 transition-colors p-2 z-20 bg-white/80 backdrop-blur-sm rounded-full border border-neutral-100"
              aria-label="Close quick view"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>

            {/* Left Image Side */}
            <div className="w-full md:w-1/2 bg-cream p-8 flex flex-col items-center justify-center relative min-h-[260px] md:min-h-[350px]">
              
              {/* Image */}
              <img 
                key={`qv-${quickViewProduct.id}-${quickViewPosition}`}
                src={quickViewProduct.views?.[quickViewPosition] || ''} 
                alt={`${quickViewProduct.name} – ${quickViewProduct.accentName}, ${quickViewPosition} view`}
                loading="eager"
                className="w-full max-h-[240px] md:max-h-[380px] object-contain"
              />
              
              {/* Position selector inside modal */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-neutral-900/90 backdrop-blur-sm px-3 py-1.5 rounded-full flex gap-2">
                {["front", "left", "right"].map((view) => (
                  <button
                    key={view}
                    onClick={() => setQuickViewPosition(view)}
                    className={`px-3 py-1 rounded-full text-[9px] font-bold tracking-widest uppercase transition-all duration-200 ${
                      quickViewPosition === view
                        ? "bg-white text-neutral-900 shadow-sm"
                        : "text-neutral-400 hover:text-white"
                    }`}
                  >
                    {view}
                  </button>
                ))}
              </div>

              <span className="absolute top-4 left-4 bg-neutral-950 text-white text-[10px] font-bold tracking-widest px-3 py-1 uppercase rounded-full">
                {quickViewProduct.colorway}
              </span>
            </div>

            {/* Right Information Side */}
            <div className="w-full md:w-1/2 p-8 md:p-10 flex flex-col justify-between space-y-6">
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold tracking-widest text-neutral-400 uppercase block">
                      {quickViewProduct.badge}
                    </span>
                    {quickViewProduct.sku && (
                      <span className="text-[9px] font-mono font-bold text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded">
                        SKU: {quickViewProduct.sku}
                      </span>
                    )}
                  </div>
                  <span className="font-display font-black text-xl text-neutral-950">
                    ${quickViewProduct.price.toFixed(2)}
                  </span>
                </div>

                <h3 className="font-display font-black text-2xl uppercase text-neutral-900">
                  {quickViewProduct.name}
                </h3>
                
                <p className="text-neutral-500 text-xs leading-relaxed font-light">
                  {quickViewProduct.description}
                </p>
              </div>

              {/* Key Features List */}
              <div className="space-y-3">
                <span className="text-[10px] font-bold tracking-widest text-neutral-400 uppercase block">Product Highlights</span>
                <ul className="text-xs text-neutral-600 space-y-2">
                  {quickViewProduct.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2 font-light">
                      <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Dynamic Symbolism details */}
              <div className="bg-neutral-50 border border-neutral-200/50 p-4 rounded-xl space-y-2">
                <span className="text-[9px] font-bold tracking-widest text-neutral-400 uppercase block">Stitched Symbolism</span>
                <div className="grid grid-cols-2 gap-3 text-[10px] text-neutral-600">
                  <div>
                    <span className="font-bold text-neutral-800 block">The Map outline</span>
                    <span className="font-light leading-tight">{quickViewProduct.details.map}</span>
                  </div>
                  <div>
                    <span className="font-bold text-neutral-800 block">The Choublack detail</span>
                    <span className="font-light leading-tight">{quickViewProduct.details.flora}</span>
                  </div>
                </div>
              </div>

              {/* Add to Cart Actions */}
              <div className="flex items-center gap-4">
                <button
                  onClick={() => {
                    addToCart(quickViewProduct)
                    setQuickViewProduct(null)
                  }}
                  className={`flex-1 ${quickViewProduct.accentBg} hover:opacity-90 text-white font-bold text-xs tracking-widest uppercase py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 transform active:scale-[0.98] shadow-sm`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add To Bag</span>
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  )
}

export default App
