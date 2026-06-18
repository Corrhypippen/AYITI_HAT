# AYITI Heritage — Premium Haitian Embroidered Streetwear

A headless Shopify storefront built with **React** + **Vite** + **TailwindCSS**, showcasing a premium collection of high-density embroidered caps celebrating Haitian culture.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + Vite 8 |
| Styling | TailwindCSS 4 (via `@tailwindcss/vite`) |
| Commerce | Shopify Storefront API (GraphQL) |
| Icons | Lucide React |
| Fonts | Google Fonts — Inter + Outfit |

---

## Getting Started

### Prerequisites
- **Node.js** ≥ 18
- A **Shopify** store with the Storefront API enabled and a public access token

### 1. Clone & install
```bash
git clone <repo-url>
cd AYITI
npm install
```

### 2. Configure environment variables
Copy the example file and fill in your Shopify credentials:
```bash
cp .env.example .env
```

Open `.env` and set:
```env
VITE_SHOPIFY_DOMAIN=your-store.myshopify.com
VITE_SHOPIFY_TOKEN=your_storefront_public_access_token
```

> ⚠️ Never commit `.env` to source control. It is already listed in `.gitignore`.

### 3. Run the development server
```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

### 4. Expose to the internet (optional)
To share your dev build via a public URL:
```bash
npx localtunnel --port 3000
```

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server with HMR on port 3000 |
| `npm run build` | Build the production bundle to `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint across the codebase |

---

## Project Structure

```
AYITI/
├── public/                  # Static assets served at root (favicon, etc.)
├── HAT-position/            # Product hat images (all angles)
├── src/
│   ├── App.jsx              # Main application component (routing, state, UI)
│   ├── shopifyClient.js     # Shopify Storefront API client
│   ├── PremiumHatCollection.jsx  # Alternative collection component
│   ├── main.jsx             # React entry point
│   ├── index.css            # Tailwind + custom design tokens
│   └── App.css              # Minimal global styles
├── index.html               # HTML entry point with SEO meta tags
├── vite.config.js           # Vite configuration
├── .env                     # Local environment variables (not committed)
├── .env.example             # Template for required env variables
└── package.json
```

---

## Shopify Integration

The app uses the **Shopify Storefront API** for:
- Fetching live variant prices and descriptions on mount
- Creating a cart and redirecting to Shopify's hosted checkout

Variant IDs are pre-seeded in `STATIC_PRODUCTS` inside `App.jsx` as fallback catalog data. The UI degrades gracefully if the API is unavailable.

---

## Deployment

### Vercel (recommended)
1. Push your code to GitHub.
2. Import the repo in [Vercel](https://vercel.com).
3. Set your environment variables (`VITE_SHOPIFY_DOMAIN`, `VITE_SHOPIFY_TOKEN`) in the Vercel project settings.
4. Deploy — Vercel auto-detects Vite and runs `npm run build`.

### Netlify
1. Connect your repo in [Netlify](https://netlify.com).
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Add environment variables in **Site settings → Environment variables**.

### Manual
```bash
npm run build
# Upload the contents of dist/ to any static host (S3, Cloudflare Pages, etc.)
```

---

## Features

- 🎨 **Multi-angle product viewer** — Front, Left, Right views per hat
- 🛒 **Persistent cart** — Cart state saved to `localStorage` across page reloads
- ⚡ **Live Shopify pricing** — Prices & descriptions fetched on mount, with static fallback
- 🔐 **Secure checkout** — Shopify-hosted checkout via cart mutation redirect
- ♿ **Accessible modals** — Focus traps, ESC to close, ARIA labels
- 🖼️ **Skeleton loaders** — Pulsing placeholders while data loads
- 📱 **Fully responsive** — Mobile-first layout with TailwindCSS

---

## License

© 2025 AYITI Heritage. All rights reserved.
