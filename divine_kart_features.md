# Divine-Kart — Feature List

> Hyperlocal puja & spiritual goods delivery platform  
> **Stack:** Node.js + Express + MongoDB | React + Vite | ImageKit | OpenCage Geocoder

---

## 🛍️ Customer App (Frontend — localhost:5173)

### Location & Discovery
- [x] **Location detection** via browser GPS (OpenCage reverse geocode)
- [x] **Manual location search** via OpenCage forward geocode
- [x] **Location persistence** — saved in localStorage via Zustand store
- [x] **Hyperlocal gating** — Home page only shows products if stores serve the user's area
- [x] **4-strategy store lookup**: GPS → Pincode → City → District (handles village-level GPS like "Tarial" → "Uttar Dinajpur")
- [x] **No location banner** — prompts user to set delivery location
- [x] **No stores banner** — informs user when no vendors serve their area
- [x] **Global location modal** — triggerable from anywhere (Header, banners) via Zustand uiStore

### Home Page
- [x] Nearby stores check before showing any products
- [x] Products sourced **only from nearby vendor stores** (not admin global catalog)
- [x] AI-powered personalized recommendations (logged-in users)
- [x] Popular products feed (guest users)
- [x] Category grid navigation
- [x] Hero banner/carousel

### Product Browsing
- [x] Product detail page (images, description, price, stock)
- [x] Category page with filters
- [x] Product search
- [x] Out-of-stock indicator

### Cart
- [x] Add / remove / update quantity
- [x] Cart drawer (slide-in panel)
- [x] Cart count badge in header
- [x] Persistent cart (Zustand)

### Checkout & Orders
- [x] Checkout with delivery address selection
- [x] Multiple saved addresses (add/edit/delete)
- [x] COD & online payment method selection
- [x] Order placement → auto-routed to nearest vendor store
- [x] Order history page
- [x] Order detail page (items, status, address, timeline)
- [x] Real-time order status display

### User Auth
- [x] Email + OTP login
- [x] Forgot password → OTP verify → reset password flow
- [x] Protected routes (checkout, orders, profile)
- [x] User profile page

---

## 🏪 Vendor Portal (Subdomain — vendor.localhost:5173)

### Auth
- [x] Vendor registration (store profile + contact)
- [x] OTP-based vendor login (email OTP)
- [x] Vendor JWT auth with role guard

### Dashboard
- [x] Summary stats (total orders, revenue, pending, products)
- [x] Recent orders list
- [x] Store approval status banner

### Product Management
- [x] Add product (name, category, description, price, MRP, stock, image)
- [x] Edit product
- [x] Delete product (with confirm dialog)
- [x] Image upload → **per-store ImageKit folder** (`/divinekart/stores/{storeId}/products/`)
- [x] Pagination

### Order Management *(newly built)*
- [x] Orders list with status filter tabs (All / Pending / Confirmed / Processing / Shipped / Delivered / Cancelled)
- [x] Clickable row → **Order detail side drawer**
- [x] Drawer shows: customer name, phone, email, delivery address, all items with images, total, payment method
- [x] **Status update buttons** — forward-only pipeline:
  `pending → confirmed → processing → shipped → delivered`
- [x] Optional status note field (e.g. "Out for delivery by 3pm")
- [x] Cancel order (only if not delivered)
- [x] "Action needed" badge for in-progress orders
- [x] Status filter passes to backend (only fetches filtered orders)

### Store Profile
- [x] Edit store name, description, contact, address
- [x] Logo upload → **per-store ImageKit folder** (`/divinekart/stores/{storeId}/logo/`)
- [x] Store location (lat/lng) and service area settings
- [x] Pincode coverage management

### Notifications
- [x] In-app notification bell
- [x] Mark single/all as read

---

## 🔧 Admin Panel (Subdomain — admin.localhost:5173)

### Dashboard
- [x] Platform-wide stats (stores, orders, products, users)

### Store Management
- [x] List all registered stores
- [x] Approve / reject store applications
- [x] View store detail (owner, address, products)
- [x] Email notification on approve/reject



### User Management
- [x] User list (placeholder — in progress)

---

## ⚙️ Backend Architecture

### APIs
| Route prefix | Purpose |
|---|---|
| `/api/users` | Customer auth, profile, addresses |
| `/api/products` | Global product catalog (supports `?storeIds=` filter) |
| `/api/stores` | Vendor auth, store CRUD, product CRUD, orders, nearby discovery |
| `/api/orders` | Order placement, customer order history |
| `/api/cart` | Cart operations |
| `/api/categories` | Category list |
| `/api/ai` | AI recommendations |
| `/api/admin/stores` | Admin store management |

### Order Routing
- [x] Auto-assigns orders to nearest store on placement
- [x] Priority: GPS distance → Pincode match → City match → Fallback (first active store)

### ImageKit Integration
- [x] Folder structure: `/divinekart/products/` (admin), `/divinekart/stores/{id}/products/` + `/logo/` (vendor)
- [x] `imagekitFolder` field stored in Store document for future bulk operations

### Store Discovery (Nearby Stores)
- [x] **Strategy 1** — `$near` MongoDB geospatial query (GPS)
- [x] **Strategy 2** — Pincode match (`address.pincode` or `pincodes[]`)
- [x] **Strategy 3** — City name substring match (handles translation mismatches)
- [x] **Strategy 4** — District/county match (handles village-level GPS)
- [x] Gracefully skips GPS if store coordinates are `0, 0` (not yet set)

### Auth & Security
- [x] JWT-based auth (customer + vendor separate tokens)
- [x] `isVendorRole` middleware
- [x] `checkStoreOwner` middleware (vendor can only touch their own store/orders)
- [x] Admin role guard

### Vendor Order Status Rules (enforced on backend)
- [x] Forward-only pipeline (cannot revert status)
- [x] Cannot cancel delivered orders
- [x] `statusNote` and `statusUpdatedAt` fields on Order

---

## 🚧 Known Gaps / Next Steps

| Area | Gap |
|---|---|
| Vendor store | Lat/Lng must be manually set (no auto-geocode on address save) |
| Admin | User management page is a placeholder |
| Vendor | No real-time push notification (polling only) |
| Payment | Online payment is UI-only (no gateway integrated) |
| Orders | No customer push notification on status change |
| ImageKit | Old images (pre-folder change) still in `/divinekart/products/` |
