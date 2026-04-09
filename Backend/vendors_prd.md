+-----------------------------------------------------------------------+
| **PRODUCT REQUIREMENTS DOCUMENT**                                     |
|                                                                       |
| **Divine-Kart**                                                       |
|                                                                       |
| Hyperlocal Store System                                               |
|                                                                       |
| *Inspired by Blinkit / Zepto*                                         |
+-----------------------------------------------------------------------+

+-----------------+-----------------+-----------------+-----------------+
| | **Version** | | **Author** | | **Status** | | **Date** | | |
| | | | | | | | | | |
| | **1.0** | | **Chiranjit | | **Draft** | | **Feb 2026** | | |
| | | | Das** | | | | | | |
+-----------------+-----------------+-----------------+-----------------+

**1. Product Overview**

+-----------------------------------------------------------------------+
| Divine-Kart is evolving from a single-admin store into a hyperlocal   |
| multi-store marketplace,                                              |
|                                                                       |
| modeled after platforms like Blinkit and Zepto. Customers will see    |
| only stores that can                                                  |
|                                                                       |
| deliver to their location, and orders are automatically routed to the |
| nearest available store.                                              |
+-----------------------------------------------------------------------+

**1.1 Problem Statement**

The current Divine-Kart architecture supports only a single
admin-managed inventory. This creates bottlenecks as the platform scales
--- a single warehouse cannot serve customers across multiple cities or
neighborhoods with fast delivery guarantees. There is no way to onboard
third-party store owners or localize inventory to specific areas.

**1.2 Proposed Solution**

Introduce a Store/Vendor layer sitting between Admin and Products. Each
store represents a physical warehouse or local seller with a defined
serviceable area (by coordinates + radius or pincode list). When a
customer places an order, the system routes it to the nearest eligible
store automatically.

**1.3 Goals**

-   Enable multiple local stores/warehouses to register and manage their
    own inventory

-   Route customer orders automatically to the nearest store based on
    delivery location

-   Notify the relevant store when an order is placed; Admin handles
    platform-level fulfillment

-   Allow Admin to approve, suspend, or manage all stores from a central
    dashboard

-   Maintain backward compatibility with existing User, Product, Order,
    and Cart flows

**2. User Roles & Permissions**

  -----------------------------------------------------------------------
| **Role** | **Description** | **Key Capabilities** |
  --------------------- ------------------- -----------------------------
| Super Admin | Platform owner | Full access: approve stores, |
                        (Chiranjit)         manage all products & orders,
                                            view platform analytics

| Store Owner / Vendor | Local | Manage own store profile, |
                        warehouse/store     products, inventory, view own
                        manager             orders, receive notifications

| Customer / User | End buyer | Browse products, add to cart, |
                                            checkout, track orders,
                                            manage addresses

| Guest | Unauthenticated | Browse products, view store |
                        visitor             listings (no checkout)
  -----------------------------------------------------------------------

**3. Feature Modules**

**3.1 Store Registration & Onboarding**

  -----------------------------------------------------------------------
  **Module: Store Auth & Profile**

  -----------------------------------------------------------------------

**3.1.1 Store Registration Flow**

1.  Store Owner submits registration: business name, owner name, email,
    phone, GSTIN, address

2.  Admin receives notification and reviews the application

3.  Admin approves or rejects --- Store Owner gets email notification
    via Nodemailer/Resend

4.  On approval, Store Owner receives OTP-based login credentials
    (consistent with existing auth)

5.  Store Owner completes store profile: description, logo (ImageKit),
    opening hours, service area

**3.1.2 Service Area Definition**

Each store must define its delivery coverage using one of two methods:

-   Geofencing: Center coordinates (lat/lng) + radius in km

-   Pincode list: Array of serviceable pincodes

+-----------------------------------------------------------------------+
| Data Model Note: storeModel should include:                           |
|                                                                       |
| location: { type: \'Point\', coordinates: \[lng, lat\] } // GeoJSON   |
| for MongoDB 2dsphere index                                            |
|                                                                       |
| serviceRadius: Number // in kilometers                                |
|                                                                       |
| pincodes: \[String\] // alternative to radius                         |
+-----------------------------------------------------------------------+

**3.2 Store Product Management**

  -----------------------------------------------------------------------
  **Module: Store Inventory**

  -----------------------------------------------------------------------

Each store maintains its own product catalog. Products are scoped to a
store --- the same SKU can exist across multiple stores with different
prices and stock levels.

  -----------------------------------------------------------------------
| **Action** | **Who** | **Details** |
  ------------------- ---------------- ----------------------------------
| Add Product | Store Owner / | Create product with store |
                      Admin            reference, price, stock, images
                                       via ImageKit

| Update Product | Store Owner / | Edit name, price, description, |
                      Admin            stock count

| Delete Product | Store Owner / | Soft delete (isActive: false), not |
                      Admin            hard delete

| View Products | Store Owner | Only sees own store\'s products |

| View All Products | Admin | Can filter by store, category, |
                                       stock level
  -----------------------------------------------------------------------

**3.2.1 Product Schema Changes**

Existing productModel needs one new required field:

-   store: { type: ObjectId, ref: \'Store\', required: true } --- links
    product to its store

-   storePrice: Number --- store-specific price (allows per-store
    pricing)

-   storeStock: Number --- store-specific inventory count

**3.3 Hyperlocal Order Routing**

  -----------------------------------------------------------------------
  **Module: Location-Based Store Selection**

  -----------------------------------------------------------------------

**3.3.1 How Routing Works**

This is the core differentiator of the hyperlocal model. When a customer
initiates checkout:

6.  Customer provides delivery address (lat/lng OR pincode)

7.  System queries MongoDB using 2dsphere index: find all stores where
    delivery address falls within serviceRadius

8.  From eligible stores, pick the one with: (a) all cart items in
    stock, (b) shortest distance

9.  If no single store has all items, either: flag the conflict OR split
    the order (Phase 2)

10. Selected store ID is attached to the Order document

11. Store Owner receives real-time notification (Socket.io or push) +
    email alert

12. Admin also receives platform-level order notification

+-----------------------------------------------------------------------+
| MongoDB Geo Query Example:                                            |
|                                                                       |
| Store.find({                                                          |
|                                                                       |
| location: {                                                           |
|                                                                       |
| \$near: { \$geometry: { type: \'Point\', coordinates: \[userLng,      |
| userLat\] },                                                          |
|                                                                       |
| \$maxDistance: serviceRadius \* 1000 }                                |
|                                                                       |
| },                                                                    |
|                                                                       |
| isActive: true, isApproved: true                                      |
|                                                                       |
| })                                                                    |
+-----------------------------------------------------------------------+

**3.3.2 New API Endpoints for Routing**

  -------------------------------------------------------------------------------------
| **Method** | **Endpoint** | **Description** |
  ------------ --------------------------------------- --------------------------------
| GET | /api/stores/nearby?lat=&lng=&pincode= | List stores serving the |
                                                       customer\'s location

| GET | /api/stores/:id/products | Products available at a specific |
                                                       store

| POST | /api/orders | Updated: auto-routes to nearest |
                                                       store at checkout
  -------------------------------------------------------------------------------------

**3.4 Store Notifications**

  -----------------------------------------------------------------------
  **Module: Store Order Alerts**

  -----------------------------------------------------------------------

When an order is placed and routed to a store, the Store Owner is
notified via:

-   Email (Nodemailer/Resend): Order summary --- items, quantities,
    customer delivery address, order ID

-   In-app notification: Stored in DB, fetched on store dashboard load

-   Optional Phase 2: WebSocket (Socket.io) for real-time dashboard
    alerts

The Store Owner\'s responsibility ends at notification --- they prepare
the order for pickup. Admin/logistics handles the actual delivery
fulfillment. This aligns with the stated model: Vendor gets notified,
Admin fulfills.

**3.5 Admin Store Management**

  -----------------------------------------------------------------------
  **Feature**            **Description**
  ---------------------- ------------------------------------------------
  Approve Store          Review registration; approve or reject with
                         reason

  Suspend Store          Temporarily disable store --- its products go
                         invisible to customers

  View All Stores        List with filters: city, status
                         (active/pending/suspended), pincode

  View Store Orders      All orders routed to a specific store

  Override Routing       Manually reassign an order to a different store

  Platform Analytics     Orders per store, revenue split, top-performing
                         stores
  -----------------------------------------------------------------------

**4. Data Models**

**4.1 New: storeModel**

+-----------------------------------------------------------------------+
| storeModel fields:                                                    |
|                                                                       |
| owner ObjectId → User (Store Owner role)                              |
|                                                                       |
| name String (required)                                                |
|                                                                       |
| description String                                                    |
|                                                                       |
| logo String (ImageKit URL)                                            |
|                                                                       |
| phone String                                                          |
|                                                                       |
| email String                                                          |
|                                                                       |
| gstin String                                                          |
|                                                                       |
| address { street, city, state, pincode }                              |
|                                                                       |
| location { type: \'Point\', coordinates: \[lng, lat\] } // 2dsphere   |
| index                                                                 |
|                                                                       |
| serviceRadius Number (km)                                             |
|                                                                       |
| pincodes \[String\]                                                   |
|                                                                       |
| isApproved Boolean (default: false)                                   |
|                                                                       |
| isActive Boolean (default: true)                                      |
|                                                                       |
| openingHours { open: String, close: String, days: \[String\] }        |
|                                                                       |
| createdAt, updatedAt                                                  |
+-----------------------------------------------------------------------+

**4.2 Modified: productModel**

+-----------------------------------------------------------------------+
| Add to existing productModel:                                         |
|                                                                       |
| store ObjectId → Store (required)                                     |
|                                                                       |
| storePrice Number (store-specific price override, optional)           |
|                                                                       |
| storeStock Number (store-specific inventory)                          |
+-----------------------------------------------------------------------+

**4.3 Modified: orderModel**

+-----------------------------------------------------------------------+
| Add to existing orderModel:                                           |
|                                                                       |
| store ObjectId → Store (auto-assigned at checkout)                    |
|                                                                       |
| storeNotified Boolean (default: false)                                |
|                                                                       |
| routingMethod String (\'geo\' \| \'pincode\')                         |
+-----------------------------------------------------------------------+

**4.4 New: storeNotificationModel**

+-----------------------------------------------------------------------+
| storeNotificationModel fields:                                        |
|                                                                       |
| store ObjectId → Store                                                |
|                                                                       |
| order ObjectId → Order                                                |
|                                                                       |
| message String                                                        |
|                                                                       |
| isRead Boolean (default: false)                                       |
|                                                                       |
| createdAt                                                             |
+-----------------------------------------------------------------------+

**5. New API Endpoints**

**5.1 Store Auth & Profile**

  ----------------------------------------------------------------------------
| **Method** | **Endpoint** | **Auth** | **Description** |
  ------------ ------------------------ ------------- ------------------------
| POST | /api/stores/register | Public | Submit store |
                                                      registration application

| POST | /api/stores/login | Public | OTP-based store owner |
                                                      login

| GET | /api/stores/me | Store Owner | Get own store profile |

| PUT | /api/stores/me | Store Owner | Update store profile, |
                                                      hours, service area

| PUT | /api/stores/me/logo | Store Owner | Upload store logo via |
                                                      ImageKit
  ----------------------------------------------------------------------------

**5.2 Store Discovery (Customer-Facing)**

  ------------------------------------------------------------------------------
| **Method** | **Endpoint** | **Auth** | **Description** |
  ------------ -------------------------- ------------- ------------------------
| GET | /api/stores/nearby | Public | Find stores by lat/lng |
                                                        or pincode

| GET | /api/stores/:id | Public | Get store details and |
                                                        info

| GET | /api/stores/:id/products | Public | Browse products at a |
                                                        specific store
  ------------------------------------------------------------------------------

**5.3 Admin Store Management**

  ------------------------------------------------------------------------------------
| **Method** | **Endpoint** | **Auth** | **Description** |
  ------------ ------------------------------- ---------- ----------------------------
| GET | /api/admin/stores | Admin | List all stores with filters |

| PUT | /api/admin/stores/:id/approve | Admin | Approve store registration |

| PUT | /api/admin/stores/:id/suspend | Admin | Suspend or reactivate store |

| DELETE | /api/admin/stores/:id | Admin | Remove store from platform |

| GET | /api/admin/stores/:id/orders | Admin | Orders routed to a store |
  ------------------------------------------------------------------------------------

**5.4 Store Notifications**

  ----------------------------------------------------------------------------------------
| **Method** | **Endpoint** | **Auth** | **Description** |
  ------------ --------------------------------------- ------------- ---------------------
| GET | /api/stores/me/notifications | Store Owner | Get unread order |
                                                                     notifications

| PUT | /api/stores/me/notifications/:id/read | Store Owner | Mark notification as |
                                                                     read
  ----------------------------------------------------------------------------------------

**6. Technical Architecture**

**6.1 New Files & Folders**

  ----------------------------------------------------------------------------------------
  **Path**                                     **Purpose**
  -------------------------------------------- -------------------------------------------
  models/storeModel.js                         Mongoose schema for Store (with 2dsphere
                                               geo index)

  models/storeNotificationModel.js             Schema for per-store order notifications

  controllers/storeController.js               Registration, profile, discovery, admin
                                               controls

  controllers/storeNotificationController.js   Notification fetch and mark-read logic

  middleware/storeAuth.js                      JWT guard for Store Owner routes

  routes/stores.js                             All /api/stores/\* route definitions

  routes/admin/stores.js                       All /api/admin/stores/\* route definitions

  services/routingService.js                   Core geo-routing logic: find nearest
                                               eligible store

  utils/storeEmailTemplates.js                 Email templates for store approval, order
                                               alerts
  ----------------------------------------------------------------------------------------

**6.2 Modified Files**

  ----------------------------------------------------------------------------
  **File**                         **Change Required**
  -------------------------------- -------------------------------------------
  models/productModel.js           Add store, storePrice, storeStock fields

  models/orderModel.js             Add store, storeNotified, routingMethod
                                   fields

  controllers/orderController.js   Integrate routingService at checkout;
                                   trigger store notification

  middleware/auth.js               Extend to support STORE_OWNER role token
                                   validation

  app.js                           Register new store routes
  ----------------------------------------------------------------------------

**6.3 Infrastructure Requirements**

-   MongoDB 2dsphere index on storeModel.location for geo queries

-   Redis caching for nearby store results (TTL: 5 min) --- avoids
    repeated geo queries per session

-   Existing ImageKit integration reused for store logo uploads

-   Existing Nodemailer/Resend reused for store approval + order
    notification emails

**7. Implementation Phases**

**Phase 1 --- Foundation (Week 1--2)**

  -----------------------------------------------------------------------
  **Goal: Store registration, auth, and basic profile**

  -----------------------------------------------------------------------

-   Build storeModel with geo index

-   Store registration + OTP login (reuse existing OTP system)

-   Admin approval flow + approval email

-   storeAuth middleware

-   Store profile CRUD + ImageKit logo upload

**Phase 2 --- Product Scoping (Week 3)**

  -----------------------------------------------------------------------
  **Goal: Products linked to stores**

  -----------------------------------------------------------------------

-   Update productModel with store field

-   Store Owner can create/edit/delete own products only

-   Customer API: GET /api/stores/:id/products

-   Admin: filter products by store

**Phase 3 --- Geo Routing (Week 4)**

  -----------------------------------------------------------------------
  **Goal: Location-based order routing**

  -----------------------------------------------------------------------

-   Build routingService.js (geo query + stock check + nearest store
    selection)

-   Update orderController to call routingService at checkout

-   GET /api/stores/nearby endpoint

-   Customer-facing: show only products from deliverable stores

**Phase 4 --- Notifications & Admin Dashboard (Week 5)**

  -----------------------------------------------------------------------
  **Goal: Store alerts and admin controls**

  -----------------------------------------------------------------------

-   storeNotificationModel + notification controller

-   Email alert to Store Owner on new order

-   Admin: store management endpoints (suspend, approve, view orders)

-   Redis caching for nearby store query results

**8. Non-Functional Requirements**

  -----------------------------------------------------------------------
| **Requirement** | **Target** | **How** |
  --------------------- ---------------- --------------------------------
| Geo query latency | \< 100ms | MongoDB 2dsphere index + Redis |
                                         cache (5min TTL)

| Order routing | \< 500ms | Optimized geo query + async |
                                         notification

| Store notification | \< 5 seconds | Async email + in-app DB write |
  delivery                               

| Backward | 100% | All existing User/Order/Cart |
  compatibility                          APIs unchanged

| Security | Role-isolated | storeAuth middleware; store |
                                         owners cannot access other
                                         stores

| Scalability | 100+ stores | Geo index scales with store |
                                         count; Redis absorbs read load
  -----------------------------------------------------------------------

**9. Out of Scope (Phase 1)**

+-----------------------------------------------------------------------+
| The following features are intentionally excluded from Phase 1 to     |
| keep scope manageable:                                                |
|                                                                       |
| \- Split orders across multiple stores (single store per order only   |
| in Phase 1)                                                           |
|                                                                       |
| \- Vendor payout / earnings dashboard (admin manually handles         |
| payments)                                                             |
|                                                                       |
| \- Real-time WebSocket notifications (email only in Phase 1)          |
|                                                                       |
| \- Customer-facing store ratings and reviews                          |
|                                                                       |
| \- Dynamic pricing / surge pricing per store                          |
|                                                                       |
| \- Mobile push notifications                                          |
|                                                                       |
| \- Delivery partner / rider management                                |
+-----------------------------------------------------------------------+

**10. Open Questions**

  ----------------------------------------------------------------------------
| **\#** | **Question** | **Owner** | **Status** |
  -------- -------------------------------- -------------- -------------------
| 1 | If no store covers customer\'s | Chiranjit | Open |
           location, show error or allow                   
           delayed delivery?                               

| 2 | Should store owners be able to | Chiranjit | Open |
           set their own prices or use                     
           global product prices?                          

| 3 | What happens when a store goes | Engineering | Open |
           offline mid-order?                              

| 4 | Should customers be able to | Chiranjit | Open |
           choose their preferred store                    
           manually?                                       

| 5 | What is the commission structure Business | Open |
           for vendors (if any)?                           
  ----------------------------------------------------------------------------

+-----------------------------------------------------------------------+
| **End of Document**                                                   |
|                                                                       |
| Divine-Kart Hyperlocal Store System PRD v1.0 \| Chiranjit Das         |
+-----------------------------------------------------------------------+