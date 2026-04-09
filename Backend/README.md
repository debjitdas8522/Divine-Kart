# Divine-Kart Backend 🛒

A modern, scalable REST API for the Divine-Kart spiritual e-commerce platform, built with **Node.js**, **Express 5.x**, and **MongoDB**. Features OTP-based authentication, Razorpay payments, AI-powered recommendations via Gemini, and Redis caching.

---

## ✨ Features

- 🔐 **Auth** — OTP-based login (phone/email), JWT access + refresh tokens, role-based access (Admin/User)
- 🛍️ **Products & Categories** — Full CRUD, ImageKit uploads, search, pagination, stock tracking
- 🛒 **Cart** — Persistent cart, quantity sync, cart-to-order transition
- 📦 **Orders & Payments** — Order creation, Razorpay integration, webhook verification, status tracking
- 👤 **Users & Addresses** — Profile management, multi-address support, order history
- 🤖 **AI & Recommendations** — Gemini AI semantic similarity, personalized recs, "Frequently Bought Together"
- 🚀 **Performance & Security** — Redis caching, Helmet.js, CSRF, rate limiting, Morgan logging

---

## 🛠️ Tech Stack

| | |
|-|-|
| **Runtime** | Node.js v18+ |
| **Framework** | Express.js 5.x |
| **Database** | MongoDB (Mongoose) |
| **Auth** | JWT + OTP (6-digit, TTL 10 min) |
| **File Upload** | Multer + ImageKit |
| **Payments** | Razorpay |
| **Email** | Nodemailer + Resend |
| **AI** | Google Gemini AI |
| **Logging** | Morgan |
| **Security** | Helmet, CORS, CSRF, express-rate-limit |
| **Testing** | Jest + Supertest |

---

## 📋 Prerequisites

- Node.js v18+
- MongoDB v6+
- npm or yarn

---

## 🚀 Getting Started

```bash
# 1. Clone and navigate
git clone <repository-url>
cd Divine-Kart/Backend

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env with your credentials (see Environment Variables below)

# 4. Start development server
npm run dev        # nodemon, hot reload → http://localhost:3000

# 5. Start production server
npm start
```

---

## 🐳 Docker

```bash
# Development (hot reload)
docker-compose -f docker-compose.dev.yml up

# Production
docker-compose up -d

# View logs
docker-compose logs -f app
```

See [DOCKER.md](./DOCKER.md) for the full Docker setup guide.

---

## 📚 API Endpoints

### Authentication
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/users/send-login-otp` | — | Send OTP to phone/email |
| `POST` | `/api/users/verify-login-otp` | — | Verify OTP & issue tokens |
| `GET`  | `/api/users/user-details` | ✅ | Get logged-in user profile |
| `PUT`  | `/api/users/update-user` | ✅ | Update profile info |
| `POST` | `/api/users/request-email-update` | ✅ | Request email change OTP |
| `POST` | `/api/users/verify-email-update` | ✅ | Verify & apply new email |
| `POST` | `/api/users/forgot-password` | — | Request password reset OTP |
| `POST` | `/api/users/verify-forgot-password-otp` | — | Verify reset OTP |
| `POST` | `/api/users/reset-password` | — | Set new password |
| `POST` | `/api/users/refresh-token` | — | Renew access token |

### Categories
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET`  | `/api/category/get` | — | List all categories |
| `POST` | `/api/category/create` | 🔑 Admin | Create category |
| `POST` | `/api/category/seed` | 🔑 Admin | Seed default categories |

### Products
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET`  | `/api/products` | — | List products (pagination, filters) |
| `GET`  | `/api/products/:id` | — | Product details |
| `GET`  | `/api/products/category/:category` | — | Products by category |
| `POST` | `/api/products` | 🔑 Admin | Create product |
| `PUT`  | `/api/products/:id` | 🔑 Admin | Update product |
| `DELETE` | `/api/products/:id` | 🔑 Admin | Delete product |

### Cart
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET`  | `/api/cart` | ✅ | View cart |
| `POST` | `/api/cart` | ✅ | Add/Update item |
| `PUT`  | `/api/cart/:itemId` | ✅ | Update quantity |
| `DELETE` | `/api/cart/:itemId` | ✅ | Remove item |
| `DELETE` | `/api/cart` | ✅ | Clear cart |

### Orders & Payments
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/orders` | ✅ | Create order (COD or Razorpay) |
| `POST` | `/api/orders/verify` | ✅ | Verify Razorpay payment signature |
| `GET`  | `/api/orders` | ✅ | User order history |
| `GET`  | `/api/orders/:id` | ✅ | Order details |
| `PUT`  | `/api/orders/:id` | 🔑 Admin | Update order status |
| `POST` | `/webhooks/razorpay` | — | Razorpay payment webhook |

### Addresses
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET`  | `/api/address/get` | ✅ | List saved addresses |
| `POST` | `/api/address/create` | ✅ | Add new address |
| `PUT`  | `/api/address/update` | ✅ | Update address |
| `DELETE` | `/api/address/disable` | ✅ | Remove address |

### Admin (🔑 Admin only)
| Method | Path | Description |
|--------|------|-------------|
| `GET`  | `/api/admin/dashboard` | Sales stats & revenue |
| `GET`  | `/api/admin/orders` | All orders (paginated) |
| `PUT`  | `/api/admin/orders/:id` | Update order status |
| `GET`  | `/api/admin/users` | All registered users |
| `GET`  | `/api/admin/products` | All products |
| `POST` | `/api/admin/products` | Create product |
| `PUT`  | `/api/admin/products/:id` | Update product |
| `DELETE` | `/api/admin/products/:id` | Delete product |

### AI & Recommendations
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET`  | `/api/recommendations` | ✅ | Personalized recommendations |
| `GET`  | `/api/recommendations/popular` | — | Popular products |
| `GET`  | `/api/recommendations/similar/:id` | — | Similar products (Gemini AI) |
| `GET`  | `/api/recommendations/frequently-bought-together/:id` | — | FBT products |
| `POST` | `/api/ai/chat` | — | AI chat assistant |
| `GET`  | `/api/ai/search` | — | AI-powered product search |

### Health
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/healthz` | Health check |
| `GET` | `/readyz` | Readiness check |

---

## 📁 Project Structure

```
Backend/
├── app.js                          # Entry point — middleware, routes, error handling
├── config/
│   ├── db.js                       # MongoDB connection
│   ├── redis.js                    # Redis client setup
│   └── sendmail.js                 # Nodemailer config
├── controllers/
│   ├── userController.js           # OTP auth, JWT, profile
│   ├── productController.js        # Product CRUD + ImageKit
│   ├── categoryController.js       # Category management
│   ├── orderController.js          # Orders + Razorpay
│   ├── addressController.js        # Address management
│   ├── cartController.js           # Cart state
│   └── recommendationController.js # AI recommendation engine
├── middleware/
│   ├── auth.js                     # JWT verification
│   ├── adminAuth.js                # Admin-only guard
│   ├── validation.js               # express-validator rules
│   └── multer.js                   # File upload config
├── models/
│   ├── userModel.js
│   ├── productModel.js
│   ├── categoryModel.js
│   ├── orderModel.js
│   ├── cartModel.js
│   └── addressModel.js
├── routes/
│   ├── userRoutes.js
│   ├── productRoutes.js
│   ├── categoryRoutes.js
│   ├── orderRoutes.js
│   ├── addressRoutes.js
│   ├── cartRoutes.js
│   └── recommendationRoutes.js
├── services/
│   └── recommendationService.js    # Gemini-powered product engine
├── utils/
│   ├── generatedOtp.js             # Secure 6-digit OTP generator
│   ├── generatedAccessToken.js
│   ├── generatedRefreshToken.js
│   ├── redisCache.js               # Redis GET/SET helpers
│   ├── uploadImageClodinary.js     # ImageKit wrapper
│   ├── loginOtpTemplate.js         # OTP email HTML template
│   ├── forgotPasswordTemplate.js
│   └── verifyEmailTemplate.js
├── Dockerfile
├── Dockerfile.dev
├── docker-compose.yml
├── docker-compose.dev.yml
├── DOCKER.md
└── DivineKart.postman_collection.json
```

---

## 📝 Environment Variables

Copy `.env.example` to `.env` and fill in:

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port (default: `3000`) | No |
| `NODE_ENV` | `development` \| `production` \| `test` | Yes |
| `MONGO_URI` | MongoDB connection string | Yes |
| `SECRET_KEY_ACCESS_TOKEN` | JWT access token signing secret | Yes |
| `SECRET_KEY_REFRESH_TOKEN` | JWT refresh token signing secret | Yes |
| `IMAGEKIT_PUBLIC_KEY` | ImageKit public key | Yes |
| `IMAGEKIT_PRIVATE_KEY` | ImageKit private key | Yes |
| `IMAGEKIT_URL_ENDPOINT` | ImageKit URL endpoint | Yes |
| `RAZORPAY_KEY_ID` | Razorpay key ID | Yes |
| `RAZORPAY_KEY_SECRET` | Razorpay key secret | Yes |
| `RAZORPAY_WEBHOOK_SECRET` | Razorpay webhook secret | Yes |
| `RESEND_API` | Resend email API key | Yes |
| `GEMINI_API_KEY` | Google Gemini AI API key | Yes |
| `ALLOWED_ORIGINS` | Comma-separated CORS origins | Yes |
| `FRONTEND_URL` | Frontend base URL | Yes |

---

## 🧪 Testing

```bash
npm test                    # Run Jest suite
npm test -- --watch         # Watch mode
npm test -- --coverage      # With coverage report
```

---

## 🧹 Code Quality

```bash
npm run lint        # ESLint
npm run lint:fix    # Auto-fix lint issues
npm run format      # Prettier
```

---

## 📄 License

Licensed under the **ISC License**.

---

**Author**: Chiranjit Das
