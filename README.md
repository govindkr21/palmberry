# 🌴 PalmBerry - E-Commerce Platform

A simple, clean MERN stack e-commerce website for PalmBerry products.

## 🚀 Quick Start

### Terminal 1 - Start Backend
```bash
cd server
npm install
npm run dev
```
Backend runs on **http://localhost:5000**

### Terminal 2 - Start Frontend
```bash
cd client
npm install
npm start
```
Frontend runs on **http://localhost:3000**

---

## 📍 Access Your Website

- **Website**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin
- **API**: http://localhost:5000/api

---

## 🎯 Features

✅ **Website**
- Product showcase
- Shopping cart
- Checkout process
- Responsive design

✅ **Admin Panel**
- Add/Edit/Delete products
- Manage orders
- Create/Delete promo codes
- View all orders

✅ **Backend API**
- Products management
- Orders tracking
- Coupon system
- Order status updates

---

## 📦 Tech Stack

- **Frontend**: React 18, React Router, Axios
- **Backend**: Node.js, Express, MongoDB
- **Database**: MongoDB (local or Atlas)

---

## ⚙️ Configuration

**Backend** (`server/.env`):
```
MONGODB_URI=mongodb://localhost:27017/palmberry
JWT_SECRET=your_secret_key
STRIPE_SECRET_KEY=your_stripe_key
PORT=5000
NODE_ENV=development
```

**Frontend** (`client/.env`):
```
REACT_APP_API_URL=http://localhost:5000
REACT_APP_STRIPE_PUBLIC_KEY=your_stripe_public_key
```

---

## 🚀 Deploy to Vercel

1. Push code to GitHub
2. Connect repo to Vercel
3. Deploy frontend to Vercel
4. Deploy backend to Vercel or Railway

That's it! 🎉

A complete full-stack e-commerce platform for PalmBerry natural health products with admin dashboard, payment gateway integration, and coupon system.

## 🚀 Features

### Frontend
- **Premium Landing Page** - Mobile-responsive design inspired by international organic brands
- **Product Showcase** - Display with add-to-cart functionality
- **Shopping Cart** - Side-panel cart with order summary
- **Checkout Page** - Multi-step checkout with coupon application
- **Stripe Payment** - Secure payment processing
- **WhatsApp Integration** - Direct WhatsApp contact button
- **Responsive Design** - Works seamlessly on all devices

### Backend
- **Express.js Server** - RESTful API
- **MongoDB Database** - Product, order, coupon, and user data
- **User Authentication** - JWT-based auth system
- **Order Management** - Track and manage orders
- **Product Management** - CRUD operations
- **Coupon System** - Create, apply, and track coupon usage

### Admin Dashboard
- **Product Management** - Add, edit, delete products
- **Order Management** - View and update order status
- **Coupon Management** - Create and manage promotional codes
- **Analytics** - View order details and customer information

## 📁 Project Structure

```
plambrerry/
├── client/                 # React Frontend
│   ├── public/
│   ├── src/
│   │   ├── admin/         # Admin Dashboard
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── styles/        # CSS files
│   │   └── App.js
│   └── package.json
│
└── server/                # Node.js Backend
    ├── controllers/       # Business logic
    ├── models/           # MongoDB schemas
    ├── routes/           # API endpoints
    ├── middleware/       # Auth & validation
    ├── config/           # Configuration files
    ├── server.js         # Main server file
    └── package.json
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v14+)
- npm or yarn
- MongoDB (local or Atlas)
- Git

### Backend Setup

1. **Navigate to server directory**
   ```bash
   cd server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create .env file**
   ```bash
   copy .env.example .env
   ```

4. **Configure environment variables**
   ```
   MONGODB_URI=mongodb://localhost:27017/palmberry
   JWT_SECRET=your_jwt_secret_key
   STRIPE_SECRET_KEY=your_stripe_secret_key
   STRIPE_PUBLIC_KEY=your_stripe_public_key
   PORT=5000
   NODE_ENV=development
   ```

5. **Start MongoDB** (if running locally)
   ```bash
   mongod
   ```

6. **Run the server**
   ```bash
   npm run dev
   ```
   Server runs at http://localhost:5000

### Frontend Setup

1. **Navigate to client directory**
   ```bash
   cd client
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Update Stripe key**
   - Edit `src/pages/Checkout.js`
   - Replace `pk_test_YOUR_STRIPE_KEY` with your Stripe public key

4. **Start the development server**
   ```bash
   npm start
   ```
   App runs at http://localhost:3000

## 🔑 Getting API Keys

### Stripe
1. Create account at [stripe.com](https://stripe.com)
2. Go to Developers → API Keys
3. Copy your Secret Key and Publishable Key

### MongoDB
1. Create cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Get connection string
3. Add to MONGODB_URI in .env

## 💳 Payment Integration

The platform uses **Stripe** for secure payment processing:
- Card payments (Visa, Mastercard, Amex)
- Payment confirmation and tracking
- Transaction ID storage

## 🎟️ Coupon System

Create promotional codes with:
- **Percentage or Fixed discounts**
- **Usage limits**
- **Expiry dates**
- **Minimum purchase requirements**
- **Maximum discount cap**

## 👤 Admin Access

1. Access admin dashboard at `/admin`
2. Default credentials (create after first setup):
   - Email: admin@palmberry.com
   - Role: admin

## 📱 WhatsApp Integration

The WhatsApp button sends users directly to:
- Order inquiries
- Product questions
- Customer support

Update the phone number in `src/components/WhatsAppButton.js`

## 🚀 Deployment

### Heroku Deployment

**Backend:**
```bash
heroku login
heroku create palmberry-server
git push heroku main
```

**Frontend:**
```bash
npm run build
# Deploy to Netlify or Vercel
```

### Environment Variables for Production
- Set all `.env` variables in Heroku/hosting platform
- Use production Stripe keys
- Use production MongoDB URI

## 📊 API Endpoints

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (admin)
- `PUT /api/products/:id` - Update product (admin)
- `DELETE /api/products/:id` - Delete product (admin)

### Orders
- `GET /api/orders` - Get all orders (admin)
- `GET /api/orders/:id` - Get order details
- `POST /api/orders` - Create order
- `PUT /api/orders/:id/status` - Update order status (admin)

### Coupons
- `GET /api/coupons` - Get all coupons (admin)
- `GET /api/coupons/code/:code` - Validate coupon
- `POST /api/coupons` - Create coupon (admin)
- `DELETE /api/coupons/:id` - Delete coupon (admin)

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile

## 🎨 Customization

### Colors
Edit `src/styles/App.css`:
```css
--primary-color: #3d5f4a;
--secondary-color: #a67565;
--accent-color: #e8d5c4;
```

### Typography & Spacing
Modify individual CSS files in `src/styles/`

### Product Data
Add sample products in MongoDB or through admin dashboard

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9
```

### MongoDB Connection Error
- Ensure MongoDB is running
- Check connection string in .env
- Verify MongoDB credentials

### CORS Issues
- Server has CORS enabled for localhost:3000
- Update CORS settings in `server/server.js` for production

## 📝 License

This project is proprietary software for PalmBerry.

## 👥 Support

For issues or questions, please contact the development team.

## 🎯 Future Enhancements

- [ ] Email notifications for orders
- [ ] User reviews and ratings
- [ ] Inventory management
- [ ] Email marketing integration
- [ ] Social media links
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Bulk order discounts

---

**Version:** 1.0.0  
**Last Updated:** April 2024
"# palmberry" 
"# palmberyy-web" 
"# palmberyy-web" 
"# palmberyy-web" 
"# palmberyy-web" 
