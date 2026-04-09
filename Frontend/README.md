# Divine-Kart Frontend ⚛️

The React + Vite frontend for the Divine-Kart spiritual e-commerce platform. A fully responsive SPA with a Blinkit-style UI for browsing and purchasing puja items.

---

## ✨ Features

- **Home** — Promotional banners, category grid, AI-driven product rows (Trending, Recommended)
- **Category** — Filter panel (Price Range, Brand, Scent, Type), full-width product grid, sort options
- **Product Detail** — Image thumbnail strip, star ratings, delivery info, Add to Cart, Related Sacred Items
- **Shopping Cart** — Price Details panel (MRP / Discount / Delivery), Save for Later, Proceed to Checkout
- **Checkout** — 3-step stepper (Address → Payment → Summary), Razorpay payment, Order Summary with SSL badge
- **Orders** — Account sidebar, order cards with Track Order / View Details, delivery status chips
- **Profile** — Saved addresses (add / edit / delete), account stats
- **Auth** — OTP-based login via phone or email, Forgot Password flow
- **AI Chat** — Floating chat widget for product discovery
- **Admin Panel** — Subdomain-routed (`admin.*`): Dashboard, Products (CRUD + ImageKit upload), Orders (status management), Users list

---

## 🛠️ Tech Stack

| | |
|-|-|
| **Framework** | React 18 + Vite |
| **Routing** | React Router v6 |
| **State** | Zustand (cart, auth, UI) |
| **Data Fetching** | TanStack Query v5 |
| **Styling** | Tailwind CSS v4 |
| **HTTP** | Axios (with JWT interceptors + refresh logic) |
| **Payments** | Razorpay checkout.js (dynamically loaded) |
| **Notifications** | react-hot-toast |
| **Icons** | Lucide React |

---

## 📋 Prerequisites

- Node.js v18+
- npm or yarn
- Backend running on `http://localhost:3000`

---

## 🚀 Getting Started

```bash
# 1. Navigate to frontend
cd Divine-Kart/Frontend

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env:
#   VITE_API_URL=http://localhost:3000
#   VITE_APP_NAME=Divine-Kart

# 4. Start development server
npm run dev         # → http://localhost:5173

# 5. Production build
npm run build       # output in /dist

# 6. Preview production build
npm run preview
```

---

## 📁 Project Structure

```
Frontend/
├── public/
├── src/
│   ├── App.jsx                     # Root — subdomain routing (admin vs client)
│   ├── routes.jsx                  # All React Router routes
│   ├── main.jsx                    # Vite entry point
│   ├── index.css                   # Global styles + Tailwind + CSS variables
│   │
│   ├── pages/
│   │   ├── Home.jsx                # Landing page
│   │   ├── Login.jsx               # OTP auth
│   │   ├── ForgotPassword.jsx
│   │   ├── Category.jsx            # Category listing with filters
│   │   ├── ProductDetail.jsx       # PDP with thumbnails, ratings
│   │   ├── Cart.jsx                # Cart with Price Details panel
│   │   ├── Checkout.jsx            # 3-step checkout
│   │   ├── Orders.jsx              # Account sidebar + order history
│   │   ├── OrderDetail.jsx         # Single order tracking
│   │   ├── admin/
│   │   │   ├── AdminDashboard.jsx      # Stats, revenue, recent orders
│   │   │   ├── AdminProducts.jsx       # Product list + delete
│   │   │   ├── AdminProductForm.jsx    # Create/edit product with ImageKit
│   │   │   ├── AdminOrders.jsx         # All orders + status filter
│   │   │   ├── AdminOrderDetail.jsx    # Order detail + status update
│   │   │   └── AdminUsers.jsx          # Registered users list
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.jsx          # Nav, search, cart button
│   │   │   └── SearchBar.jsx       # Debounced global search
│   │   ├── product/
│   │   │   ├── ProductCard.jsx     # Card with full-width ADD TO CART
│   │   │   ├── ProductGrid.jsx
│   │   │   ├── ProductRow.jsx      # Horizontal AI recommendation row
│   │   │   └── CategoryGrid.jsx
│   │   ├── checkout/
│   │   │   └── AddressForm.jsx
│   │   └── ui/
│   │       ├── AIChatWidget.jsx    # Floating AI chat
│   │       ├── Badge.jsx
│   │       ├── Button.jsx
│   │       ├── EmptyState.jsx
│   │       ├── Input.jsx
│   │       ├── Modal.jsx
│   │       └── Spinner.jsx
│   │
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useCart.js
│   │   └── useDebounce.js
│   │
│   ├── store/
│   │   ├── authStore.js            # Zustand (persisted)
│   │   ├── cartStore.js            # Zustand (persisted)
│   │   └── uiStore.js
│   │
│   ├── services/
│   │   ├── api.js                  # Axios + JWT interceptors
│   │   ├── authService.js
│   │   ├── productService.js
│   │   ├── categoryService.js
│   │   ├── cartService.js
│   │   ├── orderService.js
│   │   ├── addressService.js
│   │   └── aiService.js            # Recommendations, chat, semantic search
│   │
│   └── utils/
│       ├── constants.js            # ROUTES, ORDER_STATUS, CATEGORIES …
│       └── formatters.js           # formatCurrency, formatDate …
│
├── index.html
├── vite.config.js
├── tailwind.config.js
└── package.json
```

---

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `http://localhost:3000` |
| `VITE_APP_NAME` | App display name | `Divine-Kart` |

---

## 🔑 Key Design Decisions

- **Subdomain routing** — `admin.*` hostname renders the admin SPA; everything else renders the customer SPA
- **Zustand + localStorage** — Cart and auth state persist across refreshes without server sessions
- **TanStack Query** — All API calls use queries/mutations with caching, loading, and error states
- **JWT + Refresh** — Axios interceptor auto-retries 401s with a fresh token, then redirects to login
- **Razorpay lazy-load** — `checkout.js` loaded dynamically only when user reaches the payment step

---

## 📄 License

ISC License — **Author**: Chiranjit Das
