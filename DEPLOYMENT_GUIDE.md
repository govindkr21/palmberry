# 🚀 PalmBerry Production Deployment Guide

This guide covers how to deploy the **PalmBerry** frontend to **Vercel** and the backend to **Railway**.

---

## 🎨 Phase 1: Frontend Deployment (Vercel)

Vercel is the best home for your React frontend.

### 1. Preparation
I have already created a `client/vercel.json` file in your project. This ensures that your React routes (like `/admin` or `/cart`) work correctly when users refresh the page.

### 2. Deployment Steps
1. Push your code to a GitHub/GitLab/Bitbucket repository.
2. Log in to [Vercel](https://vercel.com) and click **"Add New Project"**.
3. Import your repository.
4. **Project Settings**:
   - **Root Directory**: Select `client` (Very Important!).
   - **Framework Preset**: Create React App.
5. **Environment Variables**: Add the following:
   - `REACT_APP_API_URL`: Your Railway backend URL (e.g., `https://palmberry-api.up.railway.app`).
   - `REACT_APP_RAZORPAY_KEY_ID`: Your **LIVE** Razorpay Key ID.
   - `REACT_APP_WHATSAPP_NUMBER`: Your business WhatsApp number.
   - `REACT_APP_BRAND_NAME`: `PalmBerry`
6. Click **Deploy**.

---

## ⚙️ Phase 2: Backend Deployment (Railway)

Railway is excellent for Node.js/Express backends.

### 1. Preparation
I have created a `server/Procfile` and ensured the `server/package.json` has the correct `start` script. The server is configured to listen on the dynamic `PORT` provided by Railway.

### 2. Deployment Steps
1. Log in to [Railway](https://railway.app) and click **"New Project"**.
2. Select **"Deploy from GitHub repo"**.
3. Choose your repository.
4. **Railway Settings**:
   - Railway will automatically detect the `server` folder if it's in a monorepo, or you can set the **Root Directory** to `server`.
5. **Environment Variables**: Add the following:
   - `NODE_ENV`: `production`
   - `PORT`: `5000` (Railway will override this if needed, which is fine).
   - `MONGODB_URI`: Your MongoDB Atlas connection string.
   - `JWT_SECRET`: A long, random string for security.
   - `RAZORPAY_KEY_ID`: Your **LIVE** Razorpay Key ID.
   - `RAZORPAY_KEY_SECRET`: Your **LIVE** Razorpay Key Secret.
   - `CLIENT_URL`: Your **Vercel Frontend URL** (e.g., `https://palmberry.vercel.app`).
   - `CLOUDINARY_CLOUD_NAME`: (Optional) Your Cloudinary Cloud Name.
   - `CLOUDINARY_API_KEY`: (Optional) Your Cloudinary API Key.
   - `CLOUDINARY_API_SECRET`: (Optional) Your Cloudinary API Secret.

---

## 🔗 Phase 3: Final Connection

1. **CORS Configuration**: Once your Vercel app is deployed, copy its URL.
2. Go back to Railway and ensure the `CLIENT_URL` environment variable matches your Vercel URL exactly.
3. This allows the frontend to communicate securely with the backend.

---

## 💡 Pro Tips
- **Live Keys**: Make sure you use **Live Mode** keys from Razorpay for real transactions.
- **Database**: Ensure your MongoDB Atlas IP Whitelist allows access from "Anywhere" (`0.0.0.0/0`) so Railway can connect.
- **Health Check**: You can verify your backend is alive by visiting `https://your-railway-url.com/api/health`.

**Your code is now ready for production! 🚀**
