# Divine-Kart Admin Guide 🔑

## Accessing the Admin Panel

The admin panel runs on the **`admin.`** subdomain:

| Environment | URL |
|-------------|-----|
| Development | `http://admin.localhost:5173` |
<!-- | Production  | `https://admin.divine-kart.com` | -->

> **Requirement:** You must be logged in with an admin account (`isAdmin: true`).  
> Contact the backend team to enable admin access for your account.

---

## Pages Overview

| Page | Path | Description |
|------|------|-------------|
| Dashboard | `/admin` | Live stats, recent orders, system status |
| Products | `/admin/products` | Full product catalogue management |
| Add / Edit Product | `/admin/products/new` or `/admin/products/:id` | Product form with AI description & image upload |
| Orders | `/admin/orders` | All orders with search, filter & status update |
| Order Detail | `/admin/orders/:id` | Full order view with status control |
| Users | `/admin/users` | Registered user list |

---

## 📊 Dashboard (`/admin`)

Real-time overview of the entire store:

- **Stats cards** — Total Products, Total Orders, Total Revenue, Total Users
- **Recent Orders table** — Last 10 orders with Order Ref, Timestamp, Status badge, Net Amount
- **System Status panel** — Live count of orders grouped by status (Pending, Confirmed, Shipped, etc.)
- **Console Actions** — Quick links to launch a new product or audit orders

---

## 📦 Product Management (`/admin/products`)

View and manage the entire product catalogue:

- **Table columns:** Name, Category, Stock, Old Price, Sale Price, Actions
- **Search** by product name or category
- **Add Product** button → opens the product form
- **Edit** icon → opens pre-filled product form
- **Delete** icon → confirms and removes the product

### Add / Edit Product Form (`/admin/products/new` or `/admin/products/:id`)

| Field | Required | Notes |
|-------|----------|-------|
| Product Name | ✅ | Min 3 characters |
| Description | No | Manual or AI-generated |
| Category | ✅ | Dropdown: Agarbatti & Dhoop, Spiritual Books, Flowers & Garlands, etc. |
| Old Price / MRP (₹) | ✅ | Must be ≥ Sale Price |
| Sale Price (₹) | ✅ | Must be ≤ Old Price |
| Stock Quantity | ✅ | Whole number ≥ 0 |
| Product Image | ✅ | Upload via drag & drop or click · JPG/PNG/WebP · max 5 MB |

#### ✨ AI Description Generator

Click **"Generate with AI"** next to the Description field.  
The Gemini AI generates a product description based on the Name, Category, and Price you've filled in.

> Fill in **Name** and **Category** before clicking Generate.

#### Image Upload

- Drag & drop a file onto the upload zone, or click to browse
- Accepted formats: **JPG, PNG, WebP**
- Max size: **5 MB**
- When editing, the current image is shown with a **Change** link
- Click the **✕** button to remove the current image

---

## 🛍️ Order Management (`/admin/orders`)

Full order manifest with advanced filtering:

- **Search** by Order ID (partial match supported)
- **Filter** by status: All / Pending / Confirmed / Processing / Shipped / Delivered / Cancelled
- **Table columns:** Reference & Timestamp, Customer Info (name + email), Items (SKU count), Status, Net Amount, Inspect button

### Update Order Status (`/admin/orders/:id`)

1. Click **Inspect** on any order row
2. From the order detail page, use the status control panel
3. Available transitions:

```
Pending → Confirmed → Processing → Shipped → Delivered
                                           ↘ Cancelled
```

---

## 👥 User Management (`/admin/users`)

Displays a list of all registered users on the platform.

---

## Navigation Sidebar

```
Divine-Kart Admin
├── 📊 Dashboard
├── 📦 Products
├── 🛍️ Orders
└── 👥 Users
```

Logout is available via the user menu in the top-right corner.

---

## Role & Access

- Admin access is controlled by the `isAdmin` field on the user document in MongoDB.
- Non-admin users are automatically redirected away from all `/admin/*` routes.
- To grant admin access, update the user document in the database:

```js
db.users.updateOne({ email: "user@example.com" }, { $set: { isAdmin: true } })
```
