# Divine-Kart — Work Remaining Audit

> Cross-referenced [divine_kart_features.md](file:///C:/Users/chira/Desktop/Divine-Kart/divine_kart_features.md), [vendor.md](file:///C:/Users/chira/Desktop/Divine-Kart/vendor.md), and [implementation_plan.md](file:///C:/Users/chira/Desktop/Divine-Kart/Frontend/implementation_plan.md) against actual codebase.

---

## ✅ What's Fully Built

Everything marked `[x]` in the feature list is confirmed present in code:

| Area | Status | Key Files |
|------|--------|-----------|
| **Customer App** — Location, Home, Products, Cart, Checkout, Orders, Auth | ✅ Complete | 12 page files, location components, Zustand stores |
| **Vendor Portal** — Auth, Dashboard, Products, Orders, Notifications, Profile | ✅ Complete | 8 page files + VendorLayout + VendorProtectedRoute |
| **Admin Panel** — Dashboard, Stores, Store Detail, Orders, Products | ✅ Complete | 8 page files + AdminLayout + AdminSidebar |
| **Backend** — All APIs, models, controllers, routing service | ✅ Complete | 13 controllers, 8 models, 10 route files, routingService |
| **Hyperlocal** — 4-strategy store lookup, geo routing, order auto-assignment | ✅ Complete | [routingService.js](file:///C:/Users/chira/Desktop/Divine-Kart/Backend/src/services/routingService.js) |
| **Frontend Implementation Plan** (all 5 phases) | ✅ Complete | All 21 files from the plan exist |

---

## 🚧 Known Gaps — Work Remaining

These are from the [Known Gaps table](file:///C:/Users/chira/Desktop/Divine-Kart/divine_kart_features.md#L159-L169) in your feature list:

### 1. 🟡 Admin User Management Page (Placeholder)
**Current state:** [AdminUsers.jsx](file:///C:/Users/chira/Desktop/Divine-Kart/Frontend/src/pages/admin/AdminUsers.jsx) is a stub — just says *"User management coming soon..."*

**What's needed:**
- Backend: `GET /api/admin/users` endpoint (list, search, filter by role)
- Backend: `PUT /api/admin/users/:id/suspend` and `/activate`
- Frontend: Full user table with search, role filter, suspend/activate actions
- **Effort: Medium** (~2-3 hours)

---

### 2. 🟡 Vendor Store Auto-Geocode on Address Save
**Current state:** Vendor must manually enter lat/lng coordinates. No auto-geocode when they type an address.

**What's needed:**
- Use OpenCage (already integrated for customer side) to forward-geocode vendor address on profile save
- Auto-fill lat/lng from address in [VendorProfile.jsx](file:///C:/Users/chira/Desktop/Divine-Kart/Frontend/src/pages/vendor/VendorProfile.jsx) or backend [storeController.js](file:///C:/Users/chira/Desktop/Divine-Kart/Backend/src/controllers/storeController.js)
- **Effort: Small** (~30 min)

---

### 3. 🔴 Online Payment Gateway Integration
**Current state:** Payment method selection (COD / Online) exists in UI, but no actual gateway (Razorpay/Stripe) is integrated.

**What's needed:**
- Choose gateway (Razorpay is most common for India)
- Backend: Create order on gateway, verify payment signature
- Frontend: Gateway checkout modal integration in [Checkout.jsx](file:///C:/Users/chira/Desktop/Divine-Kart/Frontend/src/pages/Checkout.jsx)
- Webhook handler for payment confirmations
- **Effort: Large** (~4-6 hours)

---

### 4. 🟡 Real-Time Vendor Notifications (Currently Polling)
**Current state:** Vendor notifications work via DB polling. No WebSocket/Socket.io for real-time push.

**What's needed:**
- Socket.io server setup in backend
- Emit event when new order is routed to a store
- Frontend: Socket.io client in VendorLayout to listen for new order events
- **Effort: Medium** (~2-3 hours)

---

### 5. 🟡 Customer Notifications on Order Status Change
**Current state:** Vendors can update order status, but customers aren't notified (no email/push/in-app).

**What's needed:**
- Backend: Trigger email (Nodemailer already set up) when vendor updates order status
- Optional: In-app notification model for customers + notification bell
- **Effort: Medium** (~2-3 hours)

---

### 6. 🟢 ImageKit Old Images Cleanup
**Current state:** Images uploaded before the per-store folder structure still live in `/divinekart/products/` instead of `/divinekart/stores/{storeId}/products/`.

**What's needed:**
- One-time migration script to move old images to correct folders
- **Effort: Small** (~30 min)

---

## 📊 Priority Summary

| Priority | Item | Effort |
|----------|------|--------|
| 🔴 High | Payment gateway integration | 4-6 hrs |
| 🟡 Medium | Admin user management | 2-3 hrs |
| 🟡 Medium | Customer order status notifications | 2-3 hrs |
| 🟡 Medium | Real-time vendor notifications (Socket.io) | 2-3 hrs |
| 🟢 Low | Vendor auto-geocode | 30 min |
| 🟢 Low | ImageKit old image cleanup | 30 min |

**Total estimated remaining: ~12-16 hours of work**

---

## 📋 vendor.md Phase Checklist (Stale)

> [!NOTE]
> The [vendor.md](file:///C:/Users/chira/Desktop/Divine-Kart/vendor.md#L272-L304) implementation phases (1-4) still show all items as `[ ]` unchecked, but **all of them are actually implemented**. You should update those checkboxes to `[x]` to reflect reality.

---

## ❓ Open Questions (Still Unresolved)

From [vendor.md](file:///C:/Users/chira/Desktop/Divine-Kart/vendor.md#L334-L343):

1. If no store covers customer's location — show error or allow delayed delivery?
2. Should store owners set their own prices or use global product prices?
3. What happens when a store goes offline mid-order?
4. Should customers be able to choose their preferred store manually?
5. What is the commission structure for vendors (if any)?
