# Frontend — Hyperlocal Vendor System

Add a complete **Vendor Dashboard** (portal at the same origin, role-gated) and update the **Customer-facing** and **Admin** frontends to surface the new store/hyperlocal layer built in the backend.

---

## Scope Overview

```
Customer Frontend  →  Store discovery widget, address lat/lng, store badge on order
Vendor Dashboard   →  New portal: login, store profile, orders, notifications
Admin Panel        →  New "Stores" section alongside existing Products / Orders
```

---

## User Review Required

> [!IMPORTANT]
> The vendor dashboard will be served at the **`vendor.` subdomain** (e.g. `vendor.localhost:5173`), matching the admin subdomain pattern. All vendor routes are root-relative (no `/vendor` prefix).

> [!WARNING]
> `Checkout.jsx` currently sends `shippingAddress: selectedAddressId` (a MongoDB ObjectId string). The backend routing service needs `{ lat, lng, pincode }`. We must **enrich** the address object before sending. This affects the existing checkout flow — it's a one-line change but is a breaking fix.

---

## Phase 1 — Foundation (Services, Store, Routes)

### [NEW] `src/services/storeService.js`
All API calls for the store layer:
- `registerStore(data)` → `POST /api/stores/register`
- `sendVendorOtp(email)` → `POST /api/stores/login/send-otp`
- `verifyVendorOtp(email, otp)` → `POST /api/stores/login/verify-otp`
- `getMyStore()` → `GET /api/stores/me`
- `updateMyStore(data)` → `PUT /api/stores/me`
- `uploadStoreLogo(file)` → `PUT /api/stores/me/logo`
- `getMyNotifications(params)` → `GET /api/stores/me/notifications`
- `markNotificationRead(id)` → `PUT /api/stores/me/notifications/:id/read`
- `markAllRead()` → `PUT /api/stores/me/notifications/read-all`
- `getMyOrders(storeId, params)` → `GET /api/stores/:storeId/orders`
- `getNearbyStores(lat, lng, radius)` → `GET /api/stores/nearby`

### [NEW] `src/services/adminStoreService.js`
Admin API calls:
- `adminGetStores(params)` → `GET /api/admin/stores`
- `adminApproveStore(id, action, reason)` → `PUT /api/admin/stores/:id/approve`
- `adminSuspendStore(id)` → `PUT /api/admin/stores/:id/suspend`
- `adminDeleteStore(id)` → `DELETE /api/admin/stores/:id`
- `adminGetStoreOrders(id, params)` → `GET /api/admin/stores/:id/orders`

### [NEW] `src/store/vendorStore.js`
Zustand store for vendor session:
```js
{
  vendor: null,        // user object
  store: null,         // store profile
  token: null,
  isVendor: false,
  login(vendor, store, token),
  logout(),
  setStore(store)
}
```
Persisted to `localStorage` under key `vendor-storage`.

### [NEW] `src/vendorRoutes.jsx`
Add lazy-loaded vendor routes on the vendor subdomain:
```
/login          → VendorLogin
/register       → VendorRegister
/dashboard      → VendorDashboard (protected)
/profile        → VendorProfile (protected)
/orders         → VendorOrders (protected)
/notifications  → VendorNotifications (protected)
```
New `VendorProtectedRoute` component wraps protected pages.

---

## Phase 2 — Vendor Portal (6 Pages)

### [NEW] `src/pages/vendor/VendorLogin.jsx`
OTP-based two-step login:
- Step 1: Email input → calls `sendVendorOtp` → shows OTP field
- Step 2: OTP verify → calls `verifyVendorOtp` → saves to `vendorStore` → redirect to `/vendor/dashboard`
- Resend OTP countdown (60s)

### [NEW] `src/pages/vendor/VendorRegister.jsx`
Store registration form:
- Fields: Store Name, Owner Name, Email, Phone, Description, GSTIN, Address (street/city/state/pincode), optional lat/lng
- On submit: `POST /api/stores/register`
- On success: show pending approval message, link to vendor login

### [NEW] `src/pages/vendor/VendorDashboard.jsx`
Overview cards:
- Total orders (this week / all time)
- Unread notifications badge
- Store status (Approved ✅ / Pending ⏳ / Suspended 🚫)
- Recent 5 orders table
- Quick links: Profile → Notifications

### [NEW] `src/pages/vendor/VendorProfile.jsx`
Edit store profile:
- All editable fields from the API
- Logo upload with drag-and-drop preview (ImageKit URL displayed)
- Store location shown on a small map pin display (coordinates display only, no full map needed)
- Save button → `PUT /api/stores/me`

### [NEW] `src/pages/vendor/VendorOrders.jsx`
Paginated order list for the vendor's store:
- `GET /api/stores/:storeId/orders`
- Columns: Order ID, Customer, Items, Amount, Status, Date
- Status badge colors (Pending=yellow, Processing=blue, Shipped=indigo, Delivered=green)

### [NEW] `src/pages/vendor/VendorNotifications.jsx`
Notification feed:
- Unread count badge in header
- Mark individual / mark all as read
- Each notification shows: order ID, amount, timestamp, "View Order" link

### [NEW] `src/components/vendor/VendorLayout.jsx`
Sidebar layout for all vendor pages:
- Logo + "Vendor Portal" branding
- Nav: Dashboard, Orders, Notifications, Profile
- Unread badge on Notifications
- Logout button

### [NEW] `src/components/auth/VendorProtectedRoute.jsx`
Checks `vendorStore.isVendor` — redirects to `/vendor/login` if not authenticated.

---

## Phase 3 — Admin: Stores Section

### [NEW] `src/pages/admin/AdminStores.jsx`
Store management list:
- Filterable by: status (all/pending/active/suspended), city, pincode
- Table: Store Name, Owner, City, Status badge, Created Date, Actions
- Actions: Approve / Reject / Suspend / View Orders / Delete
- Approve/Reject opens a confirmation modal (with optional rejection reason textarea)

### [NEW] `src/pages/admin/AdminStoreDetail.jsx`
Single store view for admin:
- Store info (name, owner, address, coords, GSTIN, logo)
- Orders table (paginated) — same as vendor view but admin sees all fields
- Action buttons: Suspend/Reactivate, Delete

### [MODIFY] `src/adminRoutes.jsx`
Add two new admin routes:
```
/stores          → AdminStores
/stores/:id      → AdminStoreDetail
```

### [MODIFY] `src/components/admin/AdminLayout.jsx`
Add **Stores** nav item with a 🏪 icon, linking to `/stores`.

---

## Phase 4 — Customer: Address & Store Badge

### [MODIFY] `src/pages/Checkout.jsx`
**Critical fix** — enrich `shippingAddress` before sending to backend.

Currently sends:
```js
shippingAddress: selectedAddressId   // just an ID string
```

Must send the **full address object with lat/lng** so the routing service can work:
```js
shippingAddress: {
  ...selectedAddress,        // spread the saved address fields
  lat: selectedAddress.lat,  // if lat/lng were saved
  lng: selectedAddress.lng,
  pincode: selectedAddress.pincode   // fallback
}
```

### [MODIFY] `src/pages/OrderDetail.jsx`
Show a **"Fulfilled by [Store Name]"** chip if `order.store` is populated:
```jsx
{order.store && (
  <div className="flex items-center gap-1 text-xs text-gray-500">
    <Store className="w-3 h-3" />
    Fulfilled by <strong>{order.store.name}</strong>
  </div>
)}
```

### [MODIFY] `src/components/checkout/AddressForm.jsx`
Add **lat/lng fields** (optional, collapsible "Advanced" section):
- If user doesn't fill them, pincode-based routing is used as fallback
- Small helper text: "Adding coordinates enables faster store matching"

---

## Phase 5 — Polish

### [NEW] `src/components/vendor/NotificationBell.jsx`
Bell icon with unread count badge — used in VendorLayout header.  
Polls `getMyNotifications?unreadOnly=true` every 30 seconds.

### [NEW] `src/utils/constants.js` additions
```js
VENDOR_ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  ORDERS: '/orders',
  NOTIFICATIONS: '/notifications',
}
```

---

## File Summary

| # | File | Action |
|---|------|--------|
| 1 | `src/services/storeService.js` | NEW |
| 2 | `src/services/adminStoreService.js` | NEW |
| 3 | `src/store/vendorStore.js` | NEW |
| 4 | `src/pages/vendor/VendorLogin.jsx` | NEW |
| 5 | `src/pages/vendor/VendorRegister.jsx` | NEW |
| 6 | `src/pages/vendor/VendorDashboard.jsx` | NEW |
| 7 | `src/pages/vendor/VendorProfile.jsx` | NEW |
| 8 | `src/pages/vendor/VendorOrders.jsx` | NEW |
| 9 | `src/pages/vendor/VendorNotifications.jsx` | NEW |
| 10 | `src/components/vendor/VendorLayout.jsx` | NEW |
| 11 | `src/components/vendor/NotificationBell.jsx` | NEW |
| 12 | `src/components/auth/VendorProtectedRoute.jsx` | NEW |
| 13 | `src/pages/admin/AdminStores.jsx` | NEW |
| 14 | `src/pages/admin/AdminStoreDetail.jsx` | NEW |
| 15 | `src/routes.jsx` | MODIFY |
| 16 | `src/adminRoutes.jsx` | MODIFY |
| 17 | `src/components/admin/AdminLayout.jsx` | MODIFY |
| 18 | `src/pages/Checkout.jsx` | MODIFY (critical fix) |
| 19 | `src/pages/OrderDetail.jsx` | MODIFY |
| 20 | `src/components/checkout/AddressForm.jsx` | MODIFY |
| 21 | `src/utils/constants.js` | MODIFY |

---

## Verification Plan

### Automated
- Vendor register → approve via admin → vendor login → get token ✅
- Checkout sends enriched address → backend returns `store` in order ✅

### Manual Browser Checks
1. `vendor.localhost:5173/register` — form submits, shows "pending" message
2. `vendor.localhost:5173/login` — OTP flow, redirects to dashboard
3. Vendor dashboard shows store status + recent orders
4. `admin.localhost:5173/stores` — pending store appears, approve button works
5. Place an order → `OrderDetail` shows "Fulfilled by [Store Name]"
6. Vendor notification count increments after an order is placed
