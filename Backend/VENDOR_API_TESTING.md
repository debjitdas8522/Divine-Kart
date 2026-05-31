# Divine-Kart Vendor API — Postman Testing Guide

> **Base URL:** `http://localhost:3000` (Backend API)  
> **Frontend URL:** `http://vendor.localhost:5173` (Vendor Portal Subdomain)  
> **All responses are JSON.** Set `Content-Type: application/json` on all POST/PUT requests unless uploading a file (then use `form-data`).

---

## ⚙️ Setup: Postman Environment Variables

Create a Postman Environment called **DivineKart Dev** and add these variables:

| Variable | Initial Value | Notes |
|----------|--------------|-------|
| `BASE_URL` | `http://localhost:3000` | Backend port |
| `ADMIN_TOKEN` | _(fill after admin login)_ | JWT from admin login |
| `VENDOR_TOKEN` | _(fill after vendor OTP verify)_ | JWT from vendor login |
| `STORE_ID` | _(fill after store is created)_ | MongoDB ObjectId of the test store |
| `PRODUCT_ID` | _(fill after product is created)_ | MongoDB ObjectId of a product |
| `NOTIFICATION_ID` | _(fill after getting notifications)_ | MongoDB ObjectId of a notification |

> **Tip:** In Postman → Authorization tab → Type: `Bearer Token` → Value: `{{VENDOR_TOKEN}}` or `{{ADMIN_TOKEN}}`

---

## 🔐 Step 1 — Bootstrap Your Admin Account

> [!IMPORTANT]
> **Why you might get `role: "user"`**: The OTP login system auto-registers any new email as a regular user. You need to **manually promote** your account to `admin` once. This is a one-time setup.

### 1.1 First — Create the account (if you haven't already)

Send yourself an OTP and verify it. This creates the user record in MongoDB:

```
POST {{BASE_URL}}/api/users/send-login-otp
Content-Type: application/json

{
  "email": "your_email@example.com"
}
```
→ Check the **server console** for the OTP (printed in the terminal).

```
POST {{BASE_URL}}/api/users/verify-login-otp
Content-Type: application/json

{
  "email": "your_email@example.com",
  "otp": "123456"
}
```
You'll get `role: "user"` — that's expected. Proceed to 1.2.

### 1.2 Promote to Admin (run once in terminal)

Stop `npm run dev`, then run this from the **Backend folder**:

```bash
node promote-admin.js your_email@example.com
```

Expected output:
```
✅  Connected to MongoDB
✅  Promoted user to admin:
    Name  : Your Name
    Email : your_email@example.com
    Role  : user → admin

🚀  Now log in again with /api/users/send-login-otp and you'll get role: "admin"
```

Then restart the server: `npm run dev`

### 1.3 Log in Again → Get Admin Token

```
POST {{BASE_URL}}/api/users/send-login-otp
Content-Type: application/json

{
  "email": "your_email@example.com"
}
```
→ Check server console for OTP.

```
POST {{BASE_URL}}/api/users/verify-login-otp
Content-Type: application/json

{
  "email": "your_email@example.com",
  "otp": "123456"
}
```
**Expected response:**
```json
{
  "success": true,
  "token": "eyJ...",
  "user": { "role": "admin", ... }
}
```
→ Copy `token` → Set as `ADMIN_TOKEN` in your Postman environment.

---

## 🏪 Step 2 — Store Registration (Public)

### 2.1 Register a New Store
```
POST {{BASE_URL}}/api/stores/register
Content-Type: application/json

{
  "name": "Chiranjit's Fresh Store",
  "ownerName": "Chiranjit Das",
  "email": "vendor@example.com",
  "phone": "9876543210",
  "description": "Fresh groceries delivered in 30 mins",
  "gstin": "22AAAAA0000A1Z5",
  "street": "12 Park Street",
  "city": "Kolkata",
  "state": "West Bengal",
  "pincode": "700016",
  "lat": "22.5726",
  "lng": "88.3639"
}
```
**Expected:** `201 Created`
```json
{
  "success": true,
  "message": "Store registration submitted successfully. Awaiting admin approval.",
  "data": { "_id": "...", "isApproved": false, ... }
}
```
→ Copy `data._id` → Set as `STORE_ID` in your environment.

---

## ✅ Step 3 — Admin Approves the Store

### 3.1 List All Pending Stores (Admin)
```
GET {{BASE_URL}}/api/admin/stores?status=pending
Authorization: Bearer {{ADMIN_TOKEN}}
```
**Expected:** Array of pending stores.

### 3.2 Approve the Store
```
PUT {{BASE_URL}}/api/admin/stores/{{STORE_ID}}/approve
Authorization: Bearer {{ADMIN_TOKEN}}
Content-Type: application/json

{
  "action": "approve"
}
```
**Expected:** `200 OK`
```json
{
  "success": true,
  "message": "Store approved and vendor notified.",
  "data": { "isApproved": true, ... }
}
```
→ Vendor receives an approval email (check Resend dashboard or inbox).

### 3.3 Reject a Store (alternate)
```
PUT {{BASE_URL}}/api/admin/stores/{{STORE_ID}}/approve
Authorization: Bearer {{ADMIN_TOKEN}}
Content-Type: application/json

{
  "action": "reject",
  "reason": "GSTIN could not be verified. Please reapply with correct documentation."
}
```

---

## 🔑 Step 4 — Vendor Login (OTP)

### 4.1 Send OTP to Vendor Email
```
POST {{BASE_URL}}/api/stores/login/send-otp
Content-Type: application/json

{
  "email": "vendor@example.com"
}
```
→ OTP is printed to the **server console** AND sent via email.

### 4.2 Verify OTP → Get Vendor Token
```
POST {{BASE_URL}}/api/stores/login/verify-otp
Content-Type: application/json

{
  "email": "vendor@example.com",
  "otp": "123456"
}
```
**Expected:**
```json
{
  "success": true,
  "token": "eyJ...",
  "user": { "role": "vendor", ... },
  "store": { "_id": "...", "name": "Chiranjit's Fresh Store", ... }
}
```
→ Copy `token` → Set as `VENDOR_TOKEN`.

---

## 👤 Step 5 — Vendor Profile Management

### 5.1 Get My Store Profile
```
GET {{BASE_URL}}/api/stores/me
Authorization: Bearer {{VENDOR_TOKEN}}
```

### 5.2 Update Store Profile
```
PUT {{BASE_URL}}/api/stores/me
Authorization: Bearer {{VENDOR_TOKEN}}
Content-Type: application/json

{
  "description": "Updated: Premium groceries, 24/7 delivery",
  "serviceRadius": 8,
  "pincodes": ["700016", "700017", "700020"],
  "openingHours": {
    "open": "07:00",
    "close": "23:00",
    "days": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  },
  "lat": "22.5726",
  "lng": "88.3639"
}
```

### 5.3 Upload Store Logo
```
PUT {{BASE_URL}}/api/stores/me/logo
Authorization: Bearer {{VENDOR_TOKEN}}
Content-Type: multipart/form-data

[form-data]
Key: logo   Type: File   Value: (select an image file)
```
**Expected:**
```json
{
  "success": true,
  "logoUrl": "https://ik.imagekit.io/..."
}
```

---

## 🔍 Step 6 — Store Discovery (Public, No Auth)

### 6.1 Find Stores Nearby by Coordinates
```
GET {{BASE_URL}}/api/stores/nearby?lat=22.5726&lng=88.3639&radius=10
```
> `radius` is in **kilometers** (default: 10km).

### 6.2 Find Stores by Pincode
```
GET {{BASE_URL}}/api/stores/nearby?pincode=700016
```

### 6.3 Get Store Details by ID
```
GET {{BASE_URL}}/api/stores/{{STORE_ID}}
```

### 6.4 Get Products at a Store
```
GET {{BASE_URL}}/api/stores/{{STORE_ID}}/products
```
→ Also supports `?category=Fruits&page=1&limit=10`

---

## 📦 Step 7 — Place an Order (Hyperlocal Routing in Action)

This is where the magic happens. The order controller will auto-route to the nearest store based on `lat`/`lng` in the address.

> Get a user token first (non-vendor), or use any authenticated user token.

### 7.1 Create a COD Order (with geo routing)
```
POST {{BASE_URL}}/api/orders
Authorization: Bearer {{USER_TOKEN}}
Content-Type: application/json

{
  "paymentMethod": "cod",
  "shippingAddress": {
    "name": "Customer Name",
    "street": "15 Park Street",
    "city": "Kolkata",
    "state": "West Bengal",
    "pincode": "700016",
    "lat": "22.5726",
    "lng": "88.3639"
  },
  "items": [
    {
      "product": "{{PRODUCT_ID}}",
      "quantity": 2
    }
  ]
}
```
**Expected:** `201 Created` — Order saved with `store` field auto-populated.
```json
{
  "success": true,
  "order": {
    "orderId": "ORD-...",
    "store": "{{STORE_ID}}",
    "routingMethod": "Proximity",
    "storeNotified": false,
    ...
  }
}
```
→ After ~1–2 seconds, vendor should receive a notification + email.

### 7.2 Order routed by Pincode (fallback)
Send the same request but **omit** `lat` and `lng`:
```json
"shippingAddress": {
  "street": "15 Park Street",
  "city": "Kolkata",
  "pincode": "700016"
}
```
→ `routingMethod` will be `"Pincode"` in the response.

---

## 🔔 Step 8 — Vendor Notifications

### 8.1 Get My Notifications (unread first)
```
GET {{BASE_URL}}/api/stores/me/notifications
Authorization: Bearer {{VENDOR_TOKEN}}
```
**Expected:**
```json
{
  "success": true,
  "unreadCount": 1,
  "data": [
    {
      "_id": "...",
      "message": "New order ORD-... has been routed to your store.",
      "isRead": false,
      "type": "NewOrder",
      "order": { "orderId": "ORD-...", "totalAmount": 120.50 }
    }
  ]
}
```
→ Copy `data[0]._id` → Set as `NOTIFICATION_ID`.

### 8.2 Get Only Unread Notifications
```
GET {{BASE_URL}}/api/stores/me/notifications?unreadOnly=true
Authorization: Bearer {{VENDOR_TOKEN}}
```

### 8.3 Mark a Notification as Read
```
PUT {{BASE_URL}}/api/stores/me/notifications/{{NOTIFICATION_ID}}/read
Authorization: Bearer {{VENDOR_TOKEN}}
```

### 8.4 Mark All as Read
```
PUT {{BASE_URL}}/api/stores/me/notifications/read-all
Authorization: Bearer {{VENDOR_TOKEN}}
```

---

## 🛠 Step 9 — Vendor: View Own Orders

```
GET {{BASE_URL}}/api/stores/{{STORE_ID}}/orders
Authorization: Bearer {{VENDOR_TOKEN}}
```
→ Returns only orders routed to this store, paginated.  
→ Supports `?page=1&limit=10`

---

## 👑 Step 10 — Admin Store Management

### 10.1 List All Stores (with filters)
```
GET {{BASE_URL}}/api/admin/stores
Authorization: Bearer {{ADMIN_TOKEN}}
```
Supported query params:

| Param | Values | Example |
|-------|--------|---------|
| `status` | `active`, `pending`, `suspended` | `?status=pending` |
| `city` | any string (case-insensitive) | `?city=Kolkata` |
| `pincode` | any pincode | `?pincode=700016` |
| `page` | number | `?page=2` |
| `limit` | number | `?limit=5` |

### 10.2 Suspend a Store
```
PUT {{BASE_URL}}/api/admin/stores/{{STORE_ID}}/suspend
Authorization: Bearer {{ADMIN_TOKEN}}
```
→ Toggles `isActive`. Call again to reactivate.

### 10.3 View All Orders for a Store
```
GET {{BASE_URL}}/api/admin/stores/{{STORE_ID}}/orders
Authorization: Bearer {{ADMIN_TOKEN}}
```

### 10.4 Delete a Store
```
DELETE {{BASE_URL}}/api/admin/stores/{{STORE_ID}}
Authorization: Bearer {{ADMIN_TOKEN}}
```
> ⚠️ Permanent — cannot be undone.

---

## ❌ Error Reference

| HTTP Code | Meaning | Common Cause |
|-----------|---------|-------------|
| `400` | Bad Request | Missing fields, invalid action |
| `401` | Unauthorized | Missing or expired token |
| `403` | Forbidden | Wrong role (e.g., user hitting vendor route) |
| `404` | Not Found | Store/order/notification ID doesn't exist |
| `500` | Server Error | Check server console logs |

---

## 🧪 Quick Smoke Test Order (copy-paste flow)

1. `POST /api/stores/register` → get `STORE_ID`  
2. `PUT /api/admin/stores/{{STORE_ID}}/approve` (admin token) → store is live  
3. `POST /api/stores/login/send-otp` → get OTP from console  
4. `POST /api/stores/login/verify-otp` → get `VENDOR_TOKEN`  
5. `GET /api/stores/me` → see store profile  
6. `GET /api/stores/nearby?lat=22.5726&lng=88.3639` → your store appears  
7. `POST /api/orders` (user token + lat/lng in address) → order routed to store  
8. `GET /api/stores/me/notifications` (vendor token) → notification appears ✅

---

*Divine-Kart Vendor API — Test Guide v1.0*
