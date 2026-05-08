# PalmBerry E-Commerce - Complete Database & Architecture Guide

## Part 1: Database Schema Design

### Overview
Single MongoDB database with separate collections for different data types.

```
Database: palmberry
├── Collections:
│   ├── users (Regular customers)
│   ├── admins (Admin users - separate)
│   ├── products (Product catalog)
│   ├── orders (Customer orders)
│   ├── coupons (Discount codes)
│   ├── addresses (Customer addresses)
│   └── payments (Payment records)
```

---

## Part 2: User vs Admin Data Differences

### 2.1 ADMIN DATA Structure

**Collection: `admins`**

```javascript
{
  _id: ObjectId("..."),
  
  // Basic Info
  name: "Admin Name",
  email: "admin@palmberry.com",
  password: "hashed_password",
  phone: "9876543210",
  
  // Admin Specific
  role: "admin",  // Always "admin"
  adminId: "ADMIN_001",  // Unique admin ID
  accessLevel: "super_admin",  // "super_admin", "moderator", "editor"
  
  // Permissions
  permissions: {
    canAddProduct: true,
    canEditProduct: true,
    canDeleteProduct: true,
    canManageCoupons: true,
    canViewOrders: true,
    canEditOrders: true,
    canManageAdmins: false  // Only super_admin
  },
  
  // Activity Tracking
  lastLogin: "2026-04-29T10:30:00Z",
  loginCount: 145,
  activityLog: [
    {
      action: "Add Product",
      productName: "Test Product",
      timestamp: "2026-04-29T10:25:00Z"
    }
  ],
  
  // Status
  isActive: true,
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-04-29T10:30:00Z"
}
```

---

### 2.2 REGULAR USER DATA Structure

**Collection: `users`**

```javascript
{
  _id: ObjectId("..."),
  
  // Basic Info
  name: "Customer Name",
  email: "user@example.com",
  phone: "9876543211",
  
  // Authentication
  role: "customer",  // Always "customer"
  password: "hashed_password_or_null",  // Null if OAuth
  
  // OAuth / Social Login
  authProviders: {
    email: true,        // Password login
    google: {
      id: "google_user_id",
      email: "user@gmail.com",
      picture: "https://..."
    },
    phone: {
      verified: true,
      verificationCode: "123456"
    }
  },
  
  // Profile Info
  profilePicture: "https://...",
  preferredLanguage: "en",
  
  // Addresses (References)
  addresses: [
    {
      _id: ObjectId("..."),
      type: "home",  // "home", "work", "other"
      fullName: "John Doe",
      phone: "9876543211",
      street: "123 Main Street",
      city: "New York",
      state: "NY",
      pinCode: "10001",
      country: "USA",
      isDefault: true
    },
    {
      _id: ObjectId("..."),
      type: "work",
      fullName: "John Doe",
      phone: "9876543211",
      street: "456 Office Boulevard",
      city: "New York",
      state: "NY",
      pinCode: "10002",
      country: "USA",
      isDefault: false
    }
  ],
  
  // Preferences
  preferences: {
    newsletter: true,
    notifications: true,
    smsAlerts: false
  },
  
  // Status & Tracking
  isVerified: true,
  isActive: true,
  lastLogin: "2026-04-29T09:00:00Z",
  createdAt: "2026-03-15T00:00:00Z",
  updatedAt: "2026-04-29T09:00:00Z"
}
```

---

### 2.3 Key Differences Summary

| Feature | Admin | User |
|---------|-------|------|
| Collection | `admins` | `users` |
| Role Field | "admin" | "customer" |
| Login | Secret Admin Panel | Customer Page / OAuth |
| Can Add Products | ✅ Yes | ❌ No |
| Can Edit Products | ✅ Yes | ❌ No |
| Can View Orders | ✅ All Orders | ✅ Own Orders Only |
| Address Required | ❌ No | ✅ Yes (For Checkout) |
| OAuth Support | ❌ No | ✅ Google, Phone |
| Permissions Field | ✅ Yes | ❌ No |
| Activity Log | ✅ Yes | ❌ No |

---

## Part 3: USER FLOW (Complete Journey)

### 3.1 User Registration & Login

#### Flow Diagram:
```
User Visits http://localhost:3000
         ↓
   Sees "Login" Button
         ↓
    3 Options:
    ├─ Email Login
    ├─ Google Login
    └─ Phone OTP Login
         ↓
   User Data Stored in `users` Collection
         ↓
   JWT Token Generated
         ↓
   Redirected to Home/Products
```

#### Database Call:
```javascript
POST /api/auth/register
{
  name: "John Doe",
  email: "john@example.com",
  password: "hashed_password",
  phone: "9876543211"
}

// Stores in users collection
db.users.insertOne({
  name: "John Doe",
  email: "john@example.com",
  phone: "9876543211",
  role: "customer",
  authProviders: { email: true },
  addresses: [],
  createdAt: new Date()
})
```

---

### 3.2 User Adds Product to Cart

```
User Browses Products
         ↓
   Clicks "Add to Cart"
         ↓
   Product Added to Browser's localStorage
         ↓
   Cart Counter Updates
         ↓
   "Go to Checkout" Button Appears
```

---

### 3.3 User Proceeds to Checkout

#### Step 1: User Selects/Adds Address
```
User Clicks "Checkout"
         ↓
   Checks if user has saved addresses
         ↓
   If NO addresses:
   └─ Shows form to ADD NEW ADDRESS
   
   If YES addresses:
   ├─ Shows list of saved addresses
   └─ Option to add NEW ADDRESS
         ↓
   User Selects Address or Adds New
         ↓
   Address Saved in user.addresses array
         ↓
   Can Use for Future Checkouts
```

**Database Operation:**
```javascript
PUT /api/users/:userId/addresses
{
  fullName: "John Doe",
  phone: "9876543211",
  street: "123 Main Street",
  city: "New York",
  state: "NY",
  pinCode: "10001",
  country: "USA",
  type: "home",
  isDefault: true
}

// Updates user document
db.users.updateOne(
  { _id: userId },
  {
    $push: {
      addresses: {
        _id: ObjectId(),
        fullName: "John Doe",
        // ... other fields
      }
    }
  }
)
```

#### Step 2: Apply Coupon
```
User Enters Coupon Code
         ↓
   Validate Against coupons Collection
         ↓
   Check:
   ├─ Is Active?
   ├─ Not Expired?
   └─ Min Purchase Met?
         ↓
   If Valid: Apply Discount
   If Invalid: Show Error Message
```

#### Step 3: Complete Payment
```
User Reviews Order
         ↓
   Clicks "Pay ₹XXX"
         ↓
   Razorpay Modal Opens
         ↓
   User Completes Payment
   (UPI, Card, Net Banking, etc)
         ↓
   Payment Signature Verified
         ↓
   Order Created in Database
         ↓
   Email Sent to Customer
         ↓
   Redirected to Success Page
```

**Database Call:**
```javascript
POST /api/orders
{
  userId: "user_id",
  items: [
    {
      productId: "product_id",
      name: "Product Name",
      price: 299,
      quantity: 2,
      total: 598
    }
  ],
  shippingAddress: {
    fullName: "John Doe",
    phone: "9876543211",
    street: "123 Main Street",
    city: "New York",
    state: "NY",
    pinCode: "10001"
  },
  subtotal: 598,
  discount: 60,  // From coupon
  tax: 48,
  total: 586,
  couponCode: "WELCOME10",
  paymentMethod: "razorpay",
  paymentStatus: "completed",
  razorpayOrderId: "order_123456",
  razorpayPaymentId: "pay_123456",
  orderStatus: "pending",
  createdAt: new Date()
}

// Creates in orders collection
db.orders.insertOne({ ... })
```

---

### 3.4 User Can View Orders

```
User Clicks "My Orders"
         ↓
   Fetches Orders from orders Collection
   WHERE userId === currentUser._id
         ↓
   Displays:
   ├─ Order Number
   ├─ Products Ordered
   ├─ Total Amount
   ├─ Order Status (Pending/Shipped/Delivered)
   └─ Payment Status (Completed/Failed)
         ↓
   User Can Click to View Details
```

---

## Part 4: ADMIN FLOW (Complete Journey)

### 4.1 Secret Admin Login

#### URL: http://localhost:3000/admin/login

```
Admin Visits: http://localhost:3000/admin/login
         ↓
   Separate Admin Login Page
   (NOT visible to regular users)
         ↓
   Admin Enters:
   ├─ Email: admin@palmberry.com
   ├─ Password: secure_password
   └─ Secret Admin PIN (Optional: Extra Security)
         ↓
   Checks Against admins Collection
         ↓
   If Valid:
   ├─ Admin JWT Token Generated
   ├─ Stored in localStorage as "adminToken"
   └─ Redirected to /admin/dashboard
         ↓
   If Invalid:
   └─ Error Message: "Invalid Credentials"
```

**Database Check:**
```javascript
POST /api/admin/login
{
  email: "admin@palmberry.com",
  password: "secure_password"
}

// Checks admins collection
db.admins.findOne({ email: "admin@palmberry.com" })

// If found and password matches:
// Generate JWT with role "admin"
// Return adminToken
```

---

### 4.2 Admin Dashboard Features

#### A. Add Product
```
Admin Goes to: /admin/dashboard/products
         ↓
   Clicks "+ Add Product"
         ↓
   Fills Form:
   ├─ Product Name
   ├─ Description
   ├─ Price
   ├─ Category
   ├─ Stock Quantity
   ├─ Benefits (comma-separated)
   ├─ SKU
   └─ Upload Image
         ↓
   Clicks "Save"
         ↓
   Sent to: POST /api/products
   With: Authorization: Bearer {adminToken}
         ↓
   Middleware Checks:
   ├─ Is Token Valid?
   ├─ Is User Admin?
   └─ Has Permission?
         ↓
   If Valid:
   └─ Product Saved to products Collection
         ↓
   Admin Sees Success Message
```

**Database:**
```javascript
POST /api/products
Headers: { Authorization: "Bearer adminToken" }

Body:
{
  name: "Premium Palm Jaggery",
  description: "100% natural...",
  price: 299,
  category: "Jaggery",
  stock: 50,
  isInStock: true,
  benefits: ["Boosts immunity", "Natural energy"],
  sku: "PPJ-001",
  image: "filename.jpg"
}

// Stores in products collection
db.products.insertOne({
  name: "Premium Palm Jaggery",
  price: 299,
  // ... other fields
  createdAt: new Date(),
  updatedAt: new Date()
})
```

#### B. Edit Product
```
Admin Clicks "Edit" on Product
         ↓
   Form Pre-fills with Current Data
         ↓
   Admin Changes:
   ├─ Price
   ├─ Stock
   ├─ Description
   └─ Image (Optional)
         ↓
   Clicks "Update"
         ↓
   Sent to: PUT /api/products/:productId
   With: Authorization: Bearer {adminToken}
         ↓
   Product Updated in Database
         ↓
   Frontend Updated
```

#### C. Delete Product
```
Admin Clicks "Delete" on Product
         ↓
   Confirmation Modal:
   "Are you sure you want to delete this product?"
         ↓
   If Confirmed:
   └─ Sent to: DELETE /api/products/:productId
         ↓
   Product Deleted from products Collection
   Image File Deleted from /uploads folder
         ↓
   Frontend List Updated
```

#### D. Manage Coupons
```
Admin Goes to: /admin/dashboard/coupons
         ↓
   Sees List of All Coupons
   ├─ Code
   ├─ Discount Type (% or Fixed)
   ├─ Value
   ├─ Expiry Date
   ├─ Status (Active/Inactive)
   └─ Actions (Edit/Delete)
         ↓
   Add New Coupon:
   ├─ Code: "WELCOME10"
   ├─ Type: "percentage"
   ├─ Value: 10
   ├─ Min Purchase: 0
   ├─ Max Uses: 100
   ├─ Expiry Date: 2026-06-30
   └─ Is Active: true
         ↓
   Clicks "Save"
         ↓
   Sent to: POST /api/coupons
   With: Authorization: Bearer {adminToken}
         ↓
   Coupon Saved to coupons Collection
```

#### E. View Orders
```
Admin Goes to: /admin/dashboard/orders
         ↓
   Sees ALL Orders from ALL Customers
   ├─ Order Number
   ├─ Customer Name
   ├─ Order Date
   ├─ Total Amount
   ├─ Payment Status
   └─ Order Status
         ↓
   Admin Clicks on Order to View Details:
   ├─ Customer Name & Address
   ├─ Products Ordered with Quantities
   ├─ Total Amount Breakdown
   │  ├─ Subtotal
   │  ├─ Discount
   │  ├─ Tax
   │  └─ Total
   ├─ Payment Details (Razorpay ID)
   └─ Shipping Status
         ↓
   Admin Can Update Order Status:
   ├─ Pending → Processing
   ├─ Processing → Shipped
   ├─ Shipped → Delivered
   └─ Can Mark as Cancelled
         ↓
   Email Sent to Customer on Status Change
```

---

## Part 5: Complete Database Collections Schema

### Collection 1: admins
```javascript
db.createCollection("admins", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name", "email", "password", "role"],
      properties: {
        _id: { bsonType: "objectId" },
        name: { bsonType: "string" },
        email: { 
          bsonType: "string",
          pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"
        },
        password: { bsonType: "string" },  // bcrypt hashed
        phone: { bsonType: "string" },
        role: { enum: ["admin"] },
        accessLevel: { enum: ["super_admin", "moderator", "editor"] },
        permissions: { bsonType: "object" },
        lastLogin: { bsonType: "date" },
        isActive: { bsonType: "bool" },
        createdAt: { bsonType: "date" },
        updatedAt: { bsonType: "date" }
      }
    }
  }
})

db.admins.createIndex({ email: 1 }, { unique: true })
```

### Collection 2: users
```javascript
db.createCollection("users", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name", "email", "role"],
      properties: {
        _id: { bsonType: "objectId" },
        name: { bsonType: "string" },
        email: { bsonType: "string" },
        password: { bsonType: ["string", "null"] },  // null for OAuth users
        phone: { bsonType: "string" },
        role: { enum: ["customer"] },
        profilePicture: { bsonType: "string" },
        authProviders: { bsonType: "object" },
        addresses: { 
          bsonType: "array",
          items: { bsonType: "object" }
        },
        preferences: { bsonType: "object" },
        isVerified: { bsonType: "bool" },
        isActive: { bsonType: "bool" },
        lastLogin: { bsonType: "date" },
        createdAt: { bsonType: "date" },
        updatedAt: { bsonType: "date" }
      }
    }
  }
})

db.users.createIndex({ email: 1 }, { unique: true })
db.users.createIndex({ phone: 1 }, { sparse: true })
```

### Collection 3: products
```javascript
db.createCollection("products", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name", "price"],
      properties: {
        _id: { bsonType: "objectId" },
        name: { bsonType: "string" },
        description: { bsonType: "string" },
        price: { bsonType: "number" },
        category: { bsonType: "string" },
        stock: { bsonType: "int" },
        isInStock: { bsonType: "bool" },
        benefits: { 
          bsonType: "array",
          items: { bsonType: "string" }
        },
        sku: { bsonType: "string" },
        image: { bsonType: "string" },
        imageUrl: { bsonType: "string" },
        createdAt: { bsonType: "date" },
        updatedAt: { bsonType: "date" }
      }
    }
  }
})

db.products.createIndex({ name: "text", description: "text" })
db.products.createIndex({ category: 1 })
```

### Collection 4: orders
```javascript
db.createCollection("orders", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["userId", "items", "total"],
      properties: {
        _id: { bsonType: "objectId" },
        orderNumber: { bsonType: "string" },
        userId: { bsonType: "objectId" },
        items: { bsonType: "array" },
        shippingAddress: { bsonType: "object" },
        subtotal: { bsonType: "number" },
        discount: { bsonType: "number" },
        tax: { bsonType: "number" },
        total: { bsonType: "number" },
        couponCode: { bsonType: "string" },
        paymentMethod: { enum: ["razorpay", "stripe", "wallet"] },
        paymentStatus: { enum: ["pending", "completed", "failed"] },
        razorpayOrderId: { bsonType: "string" },
        razorpayPaymentId: { bsonType: "string" },
        orderStatus: { enum: ["pending", "processing", "shipped", "delivered", "cancelled"] },
        createdAt: { bsonType: "date" },
        updatedAt: { bsonType: "date" }
      }
    }
  }
})

db.orders.createIndex({ userId: 1 })
db.orders.createIndex({ orderNumber: 1 }, { unique: true })
```

### Collection 5: coupons
```javascript
db.createCollection("coupons", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["code", "type", "value"],
      properties: {
        _id: { bsonType: "objectId" },
        code: { bsonType: "string" },
        type: { enum: ["percentage", "fixed"] },
        value: { bsonType: "number" },
        minPurchase: { bsonType: "number" },
        maxUses: { bsonType: "int" },
        currentUses: { bsonType: "int" },
        expiryDate: { bsonType: "date" },
        isActive: { bsonType: "bool" },
        createdAt: { bsonType: "date" },
        updatedAt: { bsonType: "date" }
      }
    }
  }
})

db.coupons.createIndex({ code: 1 }, { unique: true })
db.coupons.createIndex({ expiryDate: 1 })
```

### Collection 6: addresses
```javascript
db.createCollection("addresses", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["userId", "fullName", "street", "city"],
      properties: {
        _id: { bsonType: "objectId" },
        userId: { bsonType: "objectId" },
        type: { enum: ["home", "work", "other"] },
        fullName: { bsonType: "string" },
        phone: { bsonType: "string" },
        street: { bsonType: "string" },
        city: { bsonType: "string" },
        state: { bsonType: "string" },
        pinCode: { bsonType: "string" },
        country: { bsonType: "string" },
        isDefault: { bsonType: "bool" },
        createdAt: { bsonType: "date" },
        updatedAt: { bsonType: "date" }
      }
    }
  }
})

db.addresses.createIndex({ userId: 1 })
```

---

## Part 6: API Endpoints Summary

### Admin Endpoints
```
POST   /api/admin/login             Login as Admin
GET    /api/admin/dashboard         Get Admin Dashboard Data
POST   /api/products                Add Product (Admin Only)
PUT    /api/products/:id            Edit Product (Admin Only)
DELETE /api/products/:id            Delete Product (Admin Only)
PATCH  /api/products/:id/stock      Toggle Stock (Admin Only)
GET    /api/orders                  View All Orders (Admin Only)
PUT    /api/orders/:id/status       Update Order Status (Admin Only)
POST   /api/coupons                 Create Coupon (Admin Only)
DELETE /api/coupons/:id             Delete Coupon (Admin Only)
GET    /api/admin/analytics         View Sales Analytics (Admin Only)
```

### User Endpoints
```
POST   /api/auth/register           Register User
POST   /api/auth/login              Login User
POST   /api/auth/google             Google OAuth Login
POST   /api/auth/phone-otp          Phone OTP Login
GET    /api/users/:id/profile       Get User Profile
PUT    /api/users/:id/addresses     Add/Update Address
POST   /api/orders                  Create Order
GET    /api/orders/:id              Get Order Details
GET    /api/users/:id/orders        Get User's Orders
POST   /api/payment/razorpay/verify Verify Payment
```

---

## Part 7: Complete Database Setup Script

```javascript
// Run in MongoDB Atlas Web Shell or Local MongoDB

// Create Database
use palmberry

// 1. Create Collections
db.createCollection("admins")
db.createCollection("users")
db.createCollection("products")
db.createCollection("orders")
db.createCollection("coupons")
db.createCollection("addresses")

// 2. Create Indexes
// Admins
db.admins.createIndex({ email: 1 }, { unique: true })

// Users
db.users.createIndex({ email: 1 }, { unique: true })
db.users.createIndex({ phone: 1 }, { sparse: true })

// Products
db.products.createIndex({ name: "text", description: "text" })
db.products.createIndex({ category: 1 })
db.products.createIndex({ sku: 1 }, { unique: true })

// Orders
db.orders.createIndex({ userId: 1 })
db.orders.createIndex({ orderNumber: 1 }, { unique: true })
db.orders.createIndex({ createdAt: -1 })

// Coupons
db.coupons.createIndex({ code: 1 }, { unique: true })
db.coupons.createIndex({ expiryDate: 1 })

// Addresses
db.addresses.createIndex({ userId: 1 })

// 3. Insert Sample Admin
db.admins.insertOne({
  name: "Super Admin",
  email: "admin@palmberry.com",
  password: "$2b$10$...",  // bcrypt hashed "Admin@123"
  phone: "9876543210",
  role: "admin",
  accessLevel: "super_admin",
  permissions: {
    canAddProduct: true,
    canEditProduct: true,
    canDeleteProduct: true,
    canManageCoupons: true,
    canViewOrders: true,
    canEditOrders: true,
    canManageAdmins: true
  },
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
})

// 4. Insert Sample User
db.users.insertOne({
  name: "John Doe",
  email: "user@example.com",
  password: "$2b$10$...",  // bcrypt hashed password
  phone: "9876543211",
  role: "customer",
  authProviders: { email: true },
  addresses: [],
  isVerified: true,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
})

// 5. Insert Sample Products
db.products.insertMany([
  {
    name: "Premium Palm Jaggery Powder",
    description: "100% Natural",
    price: 299,
    category: "Jaggery",
    stock: 50,
    isInStock: true,
    benefits: ["Boosts immunity", "Natural energy"],
    sku: "PPJ-001",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  // ... more products
])

// 6. Insert Sample Coupons
db.coupons.insertMany([
  {
    code: "WELCOME10",
    type: "percentage",
    value: 10,
    minPurchase: 0,
    maxUses: 100,
    currentUses: 0,
    expiryDate: new Date("2026-06-30"),
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
])
```

---

## Part 8: Environment Variables Setup

### server/.env
```env
# MongoDB
MONGODB_URI=mongodb+srv://Govind:govind@cluster1.oek31mq.mongodb.net/palmberry

# Authentication
JWT_SECRET=your_super_secret_key_here_at_least_32_chars
ADMIN_JWT_SECRET=admin_secret_key_different_from_user
JWT_EXPIRE=7d

# Razorpay
RAZORPAY_KEY_ID=rzp_test_xxx
RAZORPAY_KEY_SECRET=rzp_test_secret_xxx

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxx

# Email Service
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# File Upload
UPLOAD_PATH=/uploads
MAX_FILE_SIZE=5242880  # 5MB

# Server
PORT=5000
NODE_ENV=development
DOMAIN=http://localhost:3000
```

### client/.env
```env
# API
REACT_APP_API_URL=http://localhost:5000

# Razorpay
REACT_APP_RAZORPAY_KEY_ID=rzp_test_xxx

# Google OAuth
REACT_APP_GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com

# App Config
REACT_APP_BRAND_NAME=PalmBerry
REACT_APP_WHATSAPP_NUMBER=919876543210
```

---

## Summary

✅ **Admin Data**: Stored in `admins` collection with permissions & access control
✅ **User Data**: Stored in `users` collection with OAuth support
✅ **Addresses**: Stored in `addresses` collection or embedded in users
✅ **Orders**: Complete order history with all details
✅ **Products**: Managed only by admins
✅ **Coupons**: Created/deleted by admins, used by users

**Next**: I'll help you implement each part one by one!
