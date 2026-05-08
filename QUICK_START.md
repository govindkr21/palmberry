# 🚀 PalmBerry - Quick Start & Troubleshooting Guide

## ⚡ Super Quick Start (Copy & Paste)

### Windows Users:
1. **Click** `SETUP.bat` in the project folder
2. Wait for installation to complete
3. Run in two terminals:
   ```bash
   npm run server
   npm run client
   ```
4. Visit http://localhost:3000

### Mac/Linux Users:
```bash
npm run install-all
npm run dev
```

---

## 🎯 Common Issues & Solutions

### 1. ❌ "npm: command not found" or "node: command not found"

**Problem:** Node.js is not installed or not in PATH

**Solutions:**
- Download from https://nodejs.org/
- Choose **LTS version**
- **RESTART your computer** after installation
- Verify: `node --version` and `npm --version`

---

### 2. ❌ "Port 3000 or 5000 already in use"

**Solution A: Kill the process**
```bash
# Find what's using port 3000
netstat -ano | findstr :3000

# Kill it (replace PID with the number shown above)
taskkill /PID 12345 /F

# Repeat for port 5000
netstat -ano | findstr :5000
taskkill /PID 54321 /F
```

**Solution B: Use different ports**
- Edit `client/package.json` and change start script to:
  ```json
  "start": "set PORT=3001 && react-scripts start"
  ```
- Update `client/.env`: `REACT_APP_API_URL=http://localhost:5000`

---

### 3. ❌ "EACCES: permission denied"

**Problem:** npm doesn't have permission to install

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Use sudo (Mac/Linux only)
sudo npm install

# Or reinstall Node.js with correct permissions
```

---

### 4. ❌ "MongoDB connection error"

**Problem:** Can't connect to MongoDB

**Checklist:**
- [ ] Internet connection is working
- [ ] MongoDB Atlas cluster is not paused
- [ ] Login to https://www.mongodb.com/cloud/atlas
- [ ] Check if cluster is **Running** (not paused)
- [ ] Check username/password in `server/.env`
- [ ] Check your IP is whitelisted in MongoDB Atlas security settings

**MongoDB Atlas Setup Check:**
1. Go to https://www.mongodb.com/cloud/atlas
2. Login with your account
3. Click on your cluster
4. Check **Status** - should say "Running"
5. If paused, click **Resume**
6. Click **Connect** and verify connection string in `server/.env`

---

### 5. ❌ "CORS error in browser console"

**Error:** "Access to XMLHttpRequest blocked by CORS policy"

**Check:**
- [ ] Backend is running on port 5000
- [ ] `client/.env` has `REACT_APP_API_URL=http://localhost:5000`
- [ ] `server/.env` has `NODE_ENV=development`
- [ ] CORS is enabled in `server/server.js` ✅ (already configured)

**Solution:**
```bash
# Restart both servers in this order:
# Terminal 1: npm run server
# Terminal 2: npm run client
```

---

### 6. ❌ "Cannot find module 'react-scripts'"

**Problem:** Client dependencies not installed

**Solution:**
```bash
cd client
npm install
cd ..
npm run client
```

---

### 7. ❌ "npm ERR! code ERESOLVE, ERESOLVE could not resolve dependencies"

**Problem:** npm version incompatibility

**Solution:**
```bash
# Try this flag
npm install --legacy-peer-deps

# Or update npm
npm install -g npm@latest
npm install
```

---

### 8. ❌ "ModuleNotFoundError" or "Cannot find module"

**Solution:**
```bash
# Delete everything and reinstall
rm -rf node_modules package-lock.json
cd server && rm -rf node_modules package-lock.json && cd ..
cd client && rm -rf node_modules package-lock.json && cd ..

# Fresh install
npm run install-all
```

---

### 9. ❌ App shows blank page or 404

**Check:**
- [ ] Frontend is running on http://localhost:3000
- [ ] Backend is running on http://localhost:5000
- [ ] Open browser DevTools (F12)
- [ ] Check **Console** tab for red errors
- [ ] Check **Network** tab - see if API calls are going to localhost:5000

**Solution:**
```bash
# Restart both servers
npm run dev
```

---

### 10. ❌ "ENOTFOUND" or "Network error"

**Problem:** Can't reach the API server

**Solution:**
1. Make sure backend is running: `npm run server`
2. Verify it says: `🚀 Server running on port 5000`
3. Test it: Open http://localhost:5000/api/health in browser
4. Should show: `{"status":"ok","timestamp":"..."}`

---

## ✅ How to Verify Setup is Correct

### Test 1: Check Backend is Running
```bash
# Terminal 1
npm run server
```

Should show:
```
✅ MongoDB connected
🚀 Server running on port 5000 [development]
```

### Test 2: Check Frontend is Running
```bash
# Terminal 2
npm run client
```

Should show:
```
Compiled successfully!

You can now view palmberry-client in the browser.
  Local:   http://localhost:3000
```

### Test 3: Test API Connection
Open browser and visit:
- http://localhost:5000/api/health

Should show: `{"status":"ok"}`

### Test 4: Test Frontend
Open browser and visit:
- http://localhost:3000

Should see the PalmBerry homepage

### Test 5: Test API from Frontend
Open DevTools (F12) → Network tab
- Refresh the page
- Look for API calls to `http://localhost:5000/api/...`
- They should succeed (green status 200)

---

## 📊 Environment Variables Checklist

### ✅ server/.env (Required)
```
MONGODB_URI=mongodb+srv://Govind:govind@cluster1.oek31mq.mongodb.net/palmberry?appName=Cluster1&retryWrites=true&w=majority
JWT_SECRET=palmberry_dev_secret_key_12345678901234567890
RAZORPAY_KEY_ID=rzp_test_SkZ0GNNHnpnhAs
RAZORPAY_KEY_SECRET=7WlM6PdUKab3Oq2XwQz1fG92
NODE_ENV=development
PORT=5000
```

### ✅ client/.env (Required)
```
REACT_APP_API_URL=http://localhost:5000
REACT_APP_RAZORPAY_KEY_ID=rzp_test_SkZ0GNNHnpnhAs
REACT_APP_WHATSAPP_NUMBER=919876543210
REACT_APP_BRAND_NAME=PalmBerry
```

---

## 🔍 Debugging Tips

### 1. **Check for Error Messages**
- Look in both terminal windows for red text
- Copy the exact error message

### 2. **Use Browser DevTools**
- Press `F12` to open DevTools
- Check **Console** tab for JavaScript errors
- Check **Network** tab to see API requests and responses

### 3. **Terminal Logs**
```bash
# Server logs appear in Terminal 1
# Client logs appear in Terminal 2
# Look for red ERROR or stack traces
```

### 4. **Check if Ports are Working**
```bash
# Test port 5000
curl http://localhost:5000/api/health

# Test port 3000
curl http://localhost:3000
```

### 5. **Verify .env Files Exist**
- `server/.env` should exist
- `client/.env` should exist
- NOT `.env.example` - those are just templates!

---

## 🚀 Getting Started After Setup

### Option A: Run Both Servers (Easiest)
```bash
npm run dev
```
- Both start in one terminal
- Frontend auto-opens in browser

### Option B: Run Separately (More Control)
```bash
# Terminal 1
npm run server

# Terminal 2 (new terminal)
npm run client
```

### Option C: Manual Control
```bash
# Terminal 1
cd server && npm run dev

# Terminal 2 (new terminal)
cd client && npm start
```

---

## 📍 After Everything is Running

Visit these URLs to test:

| URL | What to see |
|-----|-------------|
| http://localhost:3000 | Homepage with products |
| http://localhost:3000/admin | Admin login page |
| http://localhost:5000/api/health | `{"status":"ok"}` |
| http://localhost:5000/api/products | List of products in JSON |

---

## 🆘 Still Having Issues?

1. **Read the error message carefully** - note the exact text
2. **Check both terminal windows** - backend and frontend
3. **Look in browser console** - F12 → Console tab
4. **Verify .env files** - make sure they exist and have values
5. **Try restarting** - close terminals and run again
6. **Clear cache** - `npm cache clean --force`
7. **Reinstall** - delete node_modules and reinstall

---

## 💡 Remember

- ✅ Keep **two terminals running** (server + client)
- ✅ Backend on **port 5000**
- ✅ Frontend on **port 3000**
- ✅ `.env` files must exist (not `.env.example`)
- ✅ MongoDB must be accessible (check internet & Atlas)
- ✅ Don't commit `.env` files to Git
- ⚠️ Check `NODE_ENV=development` in server `.env`

**Happy coding! 🎉**
