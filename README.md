# Divine-Kart 🕉️

A full-stack spiritual e-commerce platform built for the modern web. Divine-Kart lets users browse, discover, and purchase authentic puja items — agarbatti, idols, diyas, samagri, spiritual books, and more — with a seamless 10-minute delivery promise.

## 📦 Project Structure

```
Divine-Kart/
├── Backend/        # Node.js + Express REST API
└── Frontend/       # React + Vite SPA
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- MongoDB v6+
- Redis v6+
- npm

### Backend

```bash
cd Backend
cp .env.example .env      # configure your env variables
npm install
npm run dev               # starts on http://localhost:3000
```

### Frontend

```bash
cd Frontend
cp .env.example .env      # set VITE_API_URL=http://localhost:3000
npm install
npm run dev               # starts on http://localhost:5173
```

---

## ✨ Features

### 🛍️ Shopping Experience
- Browse products by category (Agarbatti, Murti, Diya, Puja Samagri, Flowers, Books, Vessels, Decor)
- Full-text product search with AI-powered smart search
- Product detail pages with image gallery, star ratings, and delivery info
- Add to cart with live quantity controls

### 🛒 Cart & Checkout
- Persistent cart with Price Details breakdown (MRP, Discount, Delivery)
- 3-step checkout flow: Address → Payment → Summary
- Saved address management with add/edit/delete
- Cash on Delivery + Razorpay online payment (UPI, Card, Net Banking)

### 👤 User Account
- OTP-based login via phone or email (no passwords required)
- Order history with real-time tracking
- Saved addresses with multi-address support

### 🔑 Admin Panel
- Served on `admin.` subdomain (e.g. `admin.localhost:5173`)
- **Dashboard** — Platform-wide store stats, pending approvals, recent stores
- **Stores** — Approve, suspend, and view all registered vendor stores
- **Users** — Browse registered users
- Role-gated: only authenticated Admin users can access

### 🏪 Vendor Portal
- Served on `vendor.` subdomain (e.g. `vendor.localhost:5174`)
- **Dashboard** — Vendor sales, revenue, and active orders
- **Products** — Local store inventory management (CRUD + ImageKit)
- **Orders** — Manage store-specific orders (Status tracking)
- **Notifications** — Real-time alerts for new orders
- Role-gated: only authenticated Store Owners can access

### 🤖 AI Features
- AI Chat Assistant for product discovery
- Personalized product recommendations
- "Frequently Bought Together" collaborative filtering
- Semantic product similarity using Gemini AI

### 🔐 Security
- JWT access + refresh token auth
- CSRF protection, Helmet.js, rate limiting
- Role-based access control (Admin / User)
- Admin panel on `admin.` subdomain

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite, Tailwind CSS, React Router v6 |
| **State** | Zustand, TanStack Query |
| **Backend** | Node.js, Express.js 5.x |
| **Database** | MongoDB (Mongoose) |

| **Auth** | JWT + OTP |
| **Payments** | Razorpay |
| **File Upload** | ImageKit |
| **Email** | Resend |
| **AI** | Gemini AI |

---

## 📚 API Overview

| Domain | Base Path |
|--------|----------|
| Auth | `POST /api/users/send-login-otp` |
| Products | `GET /api/products` |
| Categories | `GET /api/category/get` |
| Cart | `GET /api/cart` |
| Orders | `POST /api/orders` |
| Addresses | `GET /api/address/get` |
| AI / Recs | `GET /api/recommendations` |
| Health | `GET /healthz` |

Full API documentation: import `Backend/DivineKart.postman_collection.json` into Postman.

---


## 📄 License

Licensed under the **ISC License**.

---

**Author**: Chiranjit Das
