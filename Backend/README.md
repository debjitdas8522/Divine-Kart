# Divine-Kart Backend 🛒

A modern, scalable e-commerce backend API built with Node.js, Express 5.x, and MongoDB. Divine-Kart provides a complete RESTful API for managing products, users, shopping carts, orders, and more, featuring secure OTP-based authentication and high-performance caching.

## ✨ Features

- 🔐 **Authentication & Authorization**
  - OTP-based login and registration for enhanced security
  - JWT-based authentication with high-security access and refresh tokens
  - Email verification and updates via OTP
  - Secure password reset flow
  - Role-based access control (Admin/User)

- 🛍️ **Product & Category Management**
  - Full CRUD operations for products and categories
  - Advanced image upload integrated with **ImageKit**
  - Dynamic category seeding and management
  - Inventory tracking and stock management
  - Search and pagination support

- 🛒 **Shopping Cart**
  - Persistent cart state management
  - Optimized quantity updates and synchronization
  - Secure cart-to-order transition

- 📦 **Order & Payment**
  - Streamlined order creation and tracking
  - Full **Razorpay** payment gateway integration
  - Secure webhook handling for payment verification
  - Automatic order status updates

- 👤 **User Profile & Addresses**
  - Comprehensive profile management
  - Multi-address support with enable/disable functionality
  - Order history tracking

- 🎯 **AI & Personalization**
  - **Gemini AI** integration for semantic product similarity
  - Personalized product recommendations based on order history
  - "Frequently Bought Together" collaborative filtering
  - Redis caching for high-speed recommendation delivery

- 🚀 **Performance & Security**
  - **Redis** caching layer for optimized data retrieval
  - **Morgan** logging for API monitoring
  - **Helmet.js** for secure HTTP headers
  - **CSRF** protection and Rate Limiting
  - Centralized error handling and input validation

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js 5.x
- **Database**: MongoDB (Mongoose ODM)
- **Cache**: Redis
- **Auth**: JWT (jsonwebtoken) + OTP
- **File Upload**: Multer + ImageKit
- **Payment**: Razorpay
- **Email**: Nodemailer + Resend
- **Logging**: Morgan
- **Security**: Helmet, CORS, CSRF, Express-rate-limit
- **Testing**: Jest + Supertest

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB (v6 or higher)
- Redis (v6 or higher)
- npm or yarn

## 🚀 Getting Started

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Divine-Kart/Backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your credentials (see [Environment Variables](#-environment-variables) for details).

4. **Run the application**
   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

## 🐳 Docker Setup

```bash
# Start development environment
docker-compose --file docker-compose.dev.yml up -d

# Build and start production services
docker-compose up -d
```

## 📚 API Endpoints

### Authentication
- `POST /api/users/send-login-otp` - Send login/reg OTP
- `POST /api/users/verify-login-otp` - Verify OTP & Login
- `GET  /api/users/user-details` - Get profile (Auth)
- `PUT  /api/users/update-user` - Update profile (Auth)
- `POST /api/users/request-email-update` - Request email change (Auth)
- `POST /api/users/verify-email-update` - Verify new email (Auth)
- `POST /api/users/forgot-password` - Request password reset
- `POST /api/users/verify-forgot-password-otp` - Verify reset OTP
- `POST /api/users/reset-password` - Set new password
- `POST /api/users/refresh-token` - Renew access token

### Categories
- `GET  /api/category/get` - List all categories
- `POST /api/category/create` - Create category (Admin)
- `POST /api/category/seed` - Seed default categories (Admin)

### Products
- `GET  /api/products` - List products (Pagination)
- `GET  /api/products/:id` - Product details
- `POST /api/products` - Create product (Admin + ImageKit)
- `PUT  /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

### Cart
- `GET  /api/cart` - View cart (Auth)
- `POST /api/cart` - Add/Update item
- `PUT  /api/cart/:itemId` - Update quantity
- `DELETE /api/cart/:itemId` - Remove item
- `DELETE /api/cart` - Clear cart

### Orders & Payments
- `POST /api/orders` - Create order (Auth)
- `POST /api/orders/verify` - Verify Razorpay payment (Auth)
- `GET  /api/orders` - User order history (Auth)
- `GET  /api/orders/:id` - Order status/details (Auth)
- `POST /webhooks/razorpay` - Payment webhook (System)

### Addresses
- `GET  /api/address/get` - List addresses (Auth)
- `POST /api/address/create` - Add address (Auth)
- `PUT  /api/address/update` - Update address (Auth)
- `DELETE /api/address/disable` - Disable address (Auth)

## 📁 Project Structure

### Root Files
- `app.js` - Main entry point; configures middleware (CORS, CSRF, Helmet), routes, and centralized error handling.
- `package.json` - Project manifest containing dependencies, scripts, and metadata.
- `Dockerfile` / `Dockerfile.dev` - Docker configurations for production and development environments.
- `docker-compose.yml` / `.dev.yml` - Orchestration files for running the API with MongoDB and Redis.
- `DivineKart.postman_collection.json` - Postman collection for manual API testing.
- `DOCKER.md` - Comprehensive guide specifically for Docker-based deployments.

### Directories
- **`config/`** - Core system configurations.
  - `db.js` - MongoDB connection setup using Mongoose.
  - `redis.js` - Redis client initialization for caching.
  - `sendmail.js` - Nodemailer transporter configuration for email services.
- **`controllers/`** - Request handlers containing business logic.
  - `userController.js` - Handles OTP auth, JWT tokens, and profile management.
  - `productController.js` - Manages product CRUD and ImageKit uploads.
  - `categoryController.js` - Logic for category management and seeding.
  - `orderController.js` - Processes orders and verifies Razorpay payments.
  - `addressController.js` - Manages user addresses.
  - `cartController.js` - Handles shopping cart state.
- **`middleware/`** - Custom Request/Response interceptors.
  - `auth.js` - JWT authentication verification.
  - `adminAuth.js` - Guard for restricted admin-only routes.
  - `validation.js` - Input validation rules using `express-validator`.
  - `multer.js` - Configuration for handling file uploads.
- **`models/`** - Mongoose schemas defining database structure.
  - `userModel`, `productModel`, `categoryModel`, `orderModel`, `cartModel`, `addressModel`.
- **`routes/`** - API route definitions mapping URLs to controllers.
  - Separate files for `users`, `products`, `categories`, `orders`, `addresses`, and `cart`.
- **`services/`** - Decoupled business services.
  - `recommendationService.js` - Logic for the personalized product engine.
- **`utils/`** - Modular helper functions and templates.
  - `generatedOtp.js` - Secure 6-digit OTP generator.
  - `uploadImageClodinary.js` - Image processing logic (integrated with ImageKit).
  - `redisCache.js` - Utility for easy Redis GET/SET operations.
  - `loginOtpTemplate.js` & others - HTML templates for system emails.
- **`uploads/`** - Temporary storage for local file processing (gitignored).

## 📝 Environment Variables

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 3000) |
| `MONGO_URI` | MongoDB Connection String |
| `REDIS_HOST` | Redis Server Host |
| `SECRET_KEY_ACCESS_TOKEN` | JWT Access Token Secret |
| `SECRET_KEY_REFRESH_TOKEN` | JWT Refresh Token Secret |
| `IMAGEKIT_PRIVATE_KEY` | ImageKit Private Key |
| `RAZORPAY_KEY_ID` | Razorpay Key ID |
| `RESEND_API` | Resend Email API Key |

## 🧪 Testing

```bash
# Run Jest test suite
npm test
```

## 🧹 Code Quality

```bash
npm run lint         # Run ESLint
npm run format       # Prettier formatting
```

## 📄 License

Licensed under the **ISC License**.

---
**Author**: Chiranjit Das
