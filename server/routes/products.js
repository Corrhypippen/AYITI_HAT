'use strict';

const express = require('express');
const router = express.Router();
const supabase = require('../db/supabase');

// Full catalog metadata for all 8 products in the AYITI Heritage collection
const PRODUCT_UI_METADATA = [
  {
    id: "haiti-embroidered-hat-red",
    sku: "6359040_24383",
    category: "Structured",
    views: {
      front: "/cream-crimson-red-front.png",
      left: "/cream-crimson-red-left.png",
      right: "/cream-crimson-red-right.png"
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
    sku: "3124731_24384",
    category: "Structured",
    views: {
      front: "/cream-royal-blue-front.png",
      left: "/cream-royal-blue-left.png",
      right: "/cream-royal-blue-right.png"
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
    sku: "heritage-forest-green",
    category: "Structured",
    views: {
      front: "/cream-forest-green-front.png",
      left: "/cream-forest-green-left.png",
      right: "/cream-forest-green-right.png"
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
    sku: "7216013_24381",
    category: "Structured",
    views: {
      front: "/cream-forest-classic-front.jpg",
      left: "/cream-forest-classic-left.png",
      right: "/cream-forest-classic-right.png"
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
    sku: "dad-hat-crimson",
    category: "Unstructured",
    views: {
      front: "/crimson-blue-white-accent-front.png",
      left: "/crimson-blue-white-accent-left.png",
      right: "/crimson-blue-white-accent-right.png"
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
    sku: "dad-hat-offwhite",
    category: "Unstructured",
    views: {
      front: "/off-white-black-accent-front.jpg",
      left: "/off-white-black-accent-left.jpg",
      right: "/off-white-black-accent-right.jpg"
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
    sku: "dad-hat-noir",
    category: "Unstructured",
    views: {
      front: "/noir-crimson-accent-front.jpg",
      left: "/noir-crimson-accent-left.jpg",
      right: "/noir-crimson-accent-right.jpg"
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
    sku: "souverain-cream-black",
    category: "Structured",
    views: {
      front: "/cream-black-gold-front.jpg",
      left: "/cream-black-gold-left.jpg",
      right: "/cream-black-gold-right.jpg"
    },
    name: "The Souverain Cap",
    accentName: "Cream & Black",
    description: "Premium two-tone structured cap with a natural cream crown, black bill, and elegant gold/olive embroidery. Features the Haitian bicolor flag emblem stitched on the side flank.",
    price: 30.00,
    colorway: "Cream / Black / Gold",
    hex: "#D4AF37",
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
];

/**
 * GET /api/products
 * Returns the full 8-product collection for AYITI Heritage.
 */
router.get('/', async (_req, res) => {
  try {
    // Optionally check if products are in Supabase cache
    const { data: cached } = await supabase.from('products_cache').select('*');
    if (cached && cached.length >= PRODUCT_UI_METADATA.length) {
      const merged = PRODUCT_UI_METADATA.map(p => {
        const c = cached.find(item => item.sku === p.sku);
        return c ? { ...p, price: Number(c.price) || p.price, in_stock: c.in_stock } : p;
      });
      return res.json(merged);
    }
  } catch (_) {}

  return res.json(PRODUCT_UI_METADATA);
});

module.exports = router;
