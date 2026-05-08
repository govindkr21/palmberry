# 🌴 PalmBerry - Local Development Setup Guide

This guide will help you set up and run the PalmBerry e-commerce platform on your local machine without any errors.

---

## ✅ Prerequisites

Before you start, ensure you have the following installed on your system:

1. **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
2. **npm** (comes with Node.js)
3. **Git** - [Download](https://git-scm.com/)
4. **MongoDB** - Either:
   - MongoDB Atlas (Cloud) - [Visit](https://www.mongodb.com/cloud/atlas) - ✅ **Already configured in `.env`**
   - OR MongoDB Community Edition (Local) - [Download](https://www.mongodb.com/try/download/community)

**Check your installations:**
```bash
node --version
npm --version
git --version
```

---

## 🚀 Quick Start (3 Simple Steps)

### Step 1️⃣: Clone or Open the Project
```bash
# Navigate to your project directory
cd c:\Users\GOVIND\Desktop\palmberry.....1\palmberry
```

### Step 2️⃣: Install All Dependencies
Run this single command from the root directory:
```bash
npm run install-all
```

This will automatically install:
- Root dependencies
- Server dependencies (`server/`)
- Client dependencies (`client/`)

### Step 3️⃣: Start Development Mode
Open **TWO separate terminals** and run:

**Terminal 1 - Backend Server:**
```bash
npm run server
# Or manually: cd server && npm run dev
```
✅ Backend will start on **http://localhost:5000**

**Terminal 2 - Frontend App:**
```bash
npm run client
# Or manually: cd client && npm start
```
✅ Frontend will start on **http://localhost:3000**

---

## 📍 Access Your Application

Once both servers are running:

| Service | URL |
|---------|-----|
| **Website** | http://localhost:3000 |
| **Admin Panel** | http://localhost:3000/admin |
| **API Base** | http://localhost:5000/api |

---

## ⚙️ Environment Configuration

✅ **Already configured for local development!**

### Server Configuration (`server/.env`)
```
MONGODB_URI=mongodb+srv://Govind:govind@cluster1.oek31mq.mongodb.net/palmberry?appName=Cluster1&retryWrites=true&w=majority
JWT_SECRET=palmberry_dev_secret_key_12345678901234567890
RAZORPAY_KEY_ID=rzp_test_SkZ0GNNHnpnhAs
RAZORPAY_KEY_SECRET=7WlM6PdUKab3Oq2XwQz1fG92
NODE_ENV=development
PORT=5000
```

### Client Configuration (`client/.env`)
```
REACT_APP_API_URL=http://localhost:5000
REACT_APP_RAZORPAY_KEY_ID=rzp_test_SkZ0GNNHnpnhAs
REACT_APP_WHATSAPP_NUMBER=919876543210
REACT_APP_BRAND_NAME=PalmBerry
```

---

## 🔧 Running Both Servers Simultaneously

**From root directory, run:**
```bash
npm run dev
```

This uses `concurrently` to run both backend and frontend in one terminal.

---

## 📦 Project Structure

```
palmberry/
├── server/              # Backend (Express + Node.js)
│   ├── config/         # Configuration files
│   ├── controllers/    # Route controllers
│   ├── middleware/     # Custom middleware
│   ├── models/         # MongoDB models
│   ├── routes/         # API routes
│   ├── scripts/        # Database scripts
│   ├── uploads/        # File uploads
│   ├── .env           # Backend env variables
│   └── server.js      # Main server file
│
├── client/              # Frontend (React)
│   ├── public/         # Static files
│   ├── src/
│   │   ├── components/ # React components
│   │   ├── pages/      # Page components
│   │   ├── styles/     # CSS files
│   │   ├── admin/      # Admin panel
│   │   ├── api/        # API calls
│   │   ├── utils/      # Helper functions
│   │   ├── App.js      # Main app file
│   │   └── index.js    # Entry point
│   ├── .env           # Frontend env variables
│   └── package.json
│
└── package.json        # Root package.json
```

---

## 🐛 Troubleshooting

### **Issue: "npm not found" or "node not found"**
- **Solution:** Reinstall Node.js from https://nodejs.org/
- Restart your terminal after installation
- Run `node --version` to verify

### **Issue: Port 3000 or 5000 already in use**
- **Option 1:** Kill the process using that port
  ```bash
  # Windows
  netstat -ano | findstr :3000
  taskkill /PID <PID> /F
  ```
- **Option 2:** Change the port in `.env` or `package.json`

### **Issue: MongoDB connection fails**
- Check your internet connection
- Verify MongoDB Atlas cluster is running
- Check credentials in `server/.env` are correct
- Visit [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) to verify cluster status

### **Issue: CORS errors in console**
- ✅ Already configured! Backend `.env` has CORS enabled
- Make sure backend is running on port 5000
- Make sure `REACT_APP_API_URL=http://localhost:5000` in client `.env`

### **Issue: Dependencies not installing**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and lock file
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### **Issue: "react-scripts not found"**
```bash
cd client
npm install
cd ..
```

---

## 🎯 What Each Script Does

### From Root Directory:
```bash
npm run install-all    # Install all dependencies (one-time)
npm run dev            # Run both server and client together
npm run server         # Run only backend
npm run client         # Run only frontend
npm run build          # Build for production
```

### From Server Directory:
```bash
npm run dev            # Run with nodemon (auto-restart)
npm start              # Run production version
npm run seed           # Seed database with sample data
```

### From Client Directory:
```bash
npm start              # Start development server
npm run build          # Create production build
npm test               # Run tests
```

---

## 🔐 Important Security Notes

- ✅ MongoDB credentials are already configured
- ✅ JWT secret is set for local development
- ✅ Razorpay test keys are configured
- ⚠️ **Never commit `.env` files to Git** (already in `.gitignore`)
- ⚠️ Replace test keys with production keys before deploying

---

## 📊 Database Initialization

Your MongoDB database is using **MongoDB Atlas** (Cloud).

### First Time Setup?
The database will be created automatically when you:
1. Start the server (`npm run server`)
2. Make your first API request

### Seed Sample Data:
```bash
cd server
npm run seed
```

This will populate the database with sample products.

---

## ✨ Frontend Features Ready to Use

✅ Product showcase page  
✅ Shopping cart with side panel  
✅ Checkout process  
✅ Admin dashboard (login at `/admin`)  
✅ Order tracking  
✅ Coupon/Promo code system  
✅ Razorpay payment integration  
✅ Responsive design  

---

## 🎓 Next Steps

1. **Verify Setup Works:**
   - Frontend loads at http://localhost:3000
   - You can see products on the homepage
   - Admin panel loads at http://localhost:3000/admin

2. **Test Backend:**
   - Open http://localhost:5000/api/products
   - Should see JSON response with products

3. **Check Browser Console:**
   - No red errors about API URLs
   - All API calls should go to `http://localhost:5000`

---

## 📞 Need Help?

If you encounter any errors:
1. Check the terminal output for specific error messages
2. Verify all prerequisites are installed
3. Clear cache: `npm cache clean --force`
4. Delete `node_modules` and reinstall
5. Make sure both `.env` files exist in `server/` and `client/`

---

## 🚀 Ready to Go!

You now have a complete local development environment. Happy coding! 🎉

**Remember:** 
- Keep both terminals running (server + client)
- Frontend changes auto-reload
- Backend changes need manual restart (or configure nodemon)
- Check console for any API errors during testing
