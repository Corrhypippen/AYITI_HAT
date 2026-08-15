'use strict';

/**
 * printfulVariants.js
 *
 * Maps frontend SKUs → Printful catalog variant configuration (variant_id, files, options).
 */

const DEFAULT_EMBROIDERY_FILES = [
  { id: 990835413, type: 'embroidery_front_large' },
  { id: 988714200, type: 'left' },
  { id: 988242900, type: 'right' }
];

const DEFAULT_EMBROIDERY_OPTIONS = [
  { id: 'embroidery_type', value: 'flat' },
  { id: 'thread_colors_front_large', value: ['#FFFFFF', '#CC3333', '#FFCC00'] },
  { id: 'thread_colors_left', value: ['#FFFFFF', '#CC3333'] },
  { id: 'thread_colors_right', value: ['#FFFFFF', '#CC3333'] }
];

const VARIANT_MAP = {
  // ── Structured Heritage Caps (Otto Cap 31-069 / 5-Panel Mid-Profile) ─────────
  '6359040_24383': {
    variant_id: 24383, // Crimson Red / Natural
    files: DEFAULT_EMBROIDERY_FILES,
    options: DEFAULT_EMBROIDERY_OPTIONS
  },
  '3124731_24384': {
    variant_id: 24384, // Royal Blue / Natural
    files: DEFAULT_EMBROIDERY_FILES,
    options: [
      { id: 'embroidery_type', value: 'flat' },
      { id: 'thread_colors_front_large', value: ['#FFFFFF', '#005397', '#FFCC00'] },
      { id: 'thread_colors_left', value: ['#FFFFFF', '#005397'] },
      { id: 'thread_colors_right', value: ['#FFFFFF', '#005397'] }
    ]
  },
  '7216013_24381': {
    variant_id: 24381, // Forest Classic / Natural
    files: DEFAULT_EMBROIDERY_FILES,
    options: [
      { id: 'embroidery_type', value: 'flat' },
      { id: 'thread_colors_front_large', value: ['#FFFFFF', '#01784E', '#FFCC00'] },
      { id: 'thread_colors_left', value: ['#FFFFFF', '#01784E'] },
      { id: 'thread_colors_right', value: ['#FFFFFF', '#01784E'] }
    ]
  },
  'heritage-forest-green': {
    variant_id: 24382,
    files: DEFAULT_EMBROIDERY_FILES,
    options: DEFAULT_EMBROIDERY_OPTIONS
  },

  // ── Unstructured Dad Caps (Yupoong 6245CM) ───────────────────────────────────
  'dad-hat-crimson': {
    variant_id: 24383,
    files: DEFAULT_EMBROIDERY_FILES,
    options: DEFAULT_EMBROIDERY_OPTIONS
  },
  'dad-hat-offwhite': {
    variant_id: 24380,
    files: DEFAULT_EMBROIDERY_FILES,
    options: DEFAULT_EMBROIDERY_OPTIONS
  },
  'dad-hat-noir': {
    variant_id: 24380,
    files: DEFAULT_EMBROIDERY_FILES,
    options: DEFAULT_EMBROIDERY_OPTIONS
  },

  // ── Snapback (Yupoong 6089M) ─────────────────────────────────────────────────
  'souverain-cream-black': {
    variant_id: 24380,
    files: DEFAULT_EMBROIDERY_FILES,
    options: DEFAULT_EMBROIDERY_OPTIONS
  }
};

/**
 * Resolve the Printful item configuration (variant_id, files, options) for a given SKU.
 *
 * @param {string} sku
 * @returns {{ variant_id: number, files: Array, options: Array }}
 */
function resolveItemConfig(sku) {
  if (sku in VARIANT_MAP) {
    const config = VARIANT_MAP[sku];
    if (config) return config;
  }

  // Fallback: parse numeric ID from suffix
  const parts = sku.split('_');
  const last = parts[parts.length - 1];
  const num = parseInt(last, 10);
  if (!isNaN(num) && num > 0) {
    return {
      variant_id: num,
      files: DEFAULT_EMBROIDERY_FILES,
      options: DEFAULT_EMBROIDERY_OPTIONS
    };
  }

  throw new Error(`Unknown SKU "${sku}". Add it to server/config/printfulVariants.js.`);
}

function resolveVariantId(sku) {
  return resolveItemConfig(sku).variant_id;
}

module.exports = VARIANT_MAP;
module.exports.resolveItemConfig  = resolveItemConfig;
module.exports.resolveVariantId   = resolveVariantId;
module.exports.resolveSyncVariantId = resolveVariantId;
