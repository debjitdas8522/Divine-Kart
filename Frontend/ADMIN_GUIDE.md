# Divine-Kart Admin Guide 🔑

## Accessing the Admin Panel

The admin panel runs on the **`admin.`** subdomain:

| Environment | URL |
|-------------|-----|
| Development | `http://admin.localhost:5173` |

> **Requirement:** You must be logged in with an admin account (`role: 'admin'`).  
> Contact the backend team to enable admin access for your account.

---

## Pages Overview

| Page | Path | Description |
|------|------|-------------|
| Dashboard | `/` | Platform-wide stats, pending stores, system status |
| Stores | `/stores` | All registered vendor stores and approval status |
| Store Detail | `/stores/:id` | Full store view, location, and inventory |
| Users | `/users` | Registered user list |

---

## 📊 Dashboard (`/`)

Real-time overview of the entire platform:

- **Stats cards** — Total Stores, Active Stores, Pending Approval, Suspended Stores
- **Needs Your Approval** — Urgent section highlighting stores waiting for review
- **All Stores table** — Logo, name, email, city, status badge, registered time
- **System Status panel** — Live distribution of store statuses (Active, Pending, Suspended)
- **Console Actions** — Quick links to Manage Stores or Manage Users

---

## 🏪 Store Management (`/stores`)

View and manage the vendor stores on the platform:

- **Search** by store name or location
- **Filter** by status: All / Active / Pending / Suspended
- **Table columns:** Store Info, Location, Owner, Status, Action
- **Inspect** button → opens the store detail page

### Store Detail (`/stores/:id`)

- Review store details (description, GSTIN, owner info)
- View store's serviceable area and operating hours
- See the products managed by the store
- **Approve / Reject** pending store applications
- **Suspend / Reactivate** active stores

---

## 👥 User Management (`/users`)

Displays a list of all registered users on the platform.

---

## Navigation Sidebar

```
Divine-Kart Admin
├── 📊 Dashboard
├── 🏪 Stores
└── 👥 Users
```

Logout is available via the user menu in the bottom-left corner.

---

## Role & Access

- Admin access is controlled by the `role` field (`'admin'`) on the user document in MongoDB.
- Non-admin users are automatically redirected away from all admin subdomain routes.
- To grant admin access, update the user document in the database:

```js
db.users.updateOne({ email: "user@example.com" }, { $set: { role: "admin" } })
```
