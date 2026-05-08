# 🔍 Local Development Environment Verification

## Run This Checklist Before Starting Development

---

## ✅ System Requirements Check

### Prerequisites Installed?
- [ ] **Node.js v14+** installed
  ```bash
  node --version
  # Should show: v14.0.0 or higher
  ```

- [ ] **npm** installed  
  ```bash
  npm --version
  # Should show: 6.0.0 or higher
  ```

- [ ] **Git** installed
  ```bash
  git --version
  # Should show: git version 2.x.x
  ```

---

## ✅ Project Files Check

- [ ] Project folder exists at: `c:\Users\GOVIND\Desktop\palmberry.....1\palmberry`
- [ ] Can access: `server/`, `client/`, `package.json`

---

## ✅ Environment Files Check

### Server Configuration
- [ ] File exists: `server/.env`
- [ ] Contains: `MONGODB_URI=...`
- [ ] Contains: `JWT_SECRET=...`
- [ ] Contains: `PORT=5000`
- [ ] Contains: `NODE_ENV=development`

**Command to verify:**
```bash
cat server/.env
```

### Client Configuration
- [ ] File exists: `client/.env`
- [ ] Contains: `REACT_APP_API_URL=http://localhost:5000`
- [ ] Does NOT contain production URLs

**Command to verify:**
```bash
cat client/.env
```

---

## ✅ Dependencies Check

### Root Dependencies
```bash
npm list --depth=0
```
Should include:
- [ ] `mongodb`
- [ ] `concurrently`

### Server Dependencies
```bash
cd server && npm list --depth=0 && cd ..
```
Should include:
- [ ] `express`
- [ ] `mongoose`
- [ ] `cors`
- [ ] `dotenv`
- [ ] `jsonwebtoken`
- [ ] `nodemon` (dev)

### Client Dependencies
```bash
cd client && npm list --depth=0 && cd ..
```
Should include:
- [ ] `react`
- [ ] `react-router-dom`
- [ ] `axios`
- [ ] `react-scripts`

---

## ✅ MongoDB Connection Check

### Is MongoDB Atlas Running?
```bash
# Open browser
https://www.mongodb.com/cloud/atlas

# Login and check:
- [ ] Cluster status: "Running" (not paused)
- [ ] Credentials are correct in server/.env
- [ ] Network access allows your IP
```

### Test Connection from Server
```bash
cd server
npm run dev
```

Should show:
```
✅ MongoDB connected
🚀 Server running on port 5000 [development]
```

---

## ✅ Port Availability Check

### Check if Ports are Free
```bash
# Check port 3000
netstat -ano | findstr :3000
# Should return nothing if port is free

# Check port 5000  
netstat -ano | findstr :5000
# Should return nothing if port is free
```

If ports are in use:
```bash
# Kill process on port 3000 (replace PID as needed)
taskkill /PID 12345 /F

# Kill process on port 5000
taskkill /PID 54321 /F
```

---

## 🚀 Full Installation Verification

### Step 1: Clean Install (if needed)
```bash
# Navigate to project root
cd c:\Users\GOVIND\Desktop\palmberry.....1\palmberry

# Delete old installations
rmdir /s /q node_modules
cd server && rmdir /s /q node_modules && cd ..
cd client && rmdir /s /q node_modules && cd ..

# Delete lock files
del package-lock.json
del server/package-lock.json
del client/package-lock.json
```

### Step 2: Fresh Install
```bash
npm run install-all
```

Should show:
```
added XXX packages in XXs
```

---

## 🧪 Running Tests

### Test 1: Backend Health Check
```bash
cd server
npm run dev
```

Expected output:
```
✅ MongoDB connected
🚀 Server running on port 5000 [development]
```

Then in browser, visit: http://localhost:5000/api/health  
Should return: `{"status":"ok","timestamp":"..."}`

### Test 2: Frontend Startup
```bash
# In new terminal
cd client
npm start
```

Expected output:
```
Compiled successfully!

You can now view palmberry-client in the browser.
  Local:   http://localhost:3000
  On Your Network:  http://192.168.x.x:3000
```

Then visit: http://localhost:3000  
Should see: PalmBerry homepage with products

### Test 3: API Communication
1. Frontend should be running on port 3000
2. Backend should be running on port 5000
3. Open browser DevTools (F12)
4. Go to Network tab
5. Refresh page
6. Look for API calls to `http://localhost:5000/api/...`
7. All should have green status (200 OK)

---

## 🔧 Troubleshooting

### If `npm install` fails:
```bash
npm cache clean --force
npm install --legacy-peer-deps
```

### If backend won't start:
```bash
# Check MongoDB
# 1. Go to https://www.mongodb.com/cloud/atlas
# 2. Login
# 3. Check cluster status
# 4. If paused, click Resume

# Check .env file
cat server/.env
# Make sure MONGODB_URI is correct
```

### If frontend won't start:
```bash
cd client
npm install react-scripts
npm start
```

### If ports are blocked:
```bash
# Windows: Kill process on port 3000
FOR /F "tokens=5" %A IN ('netstat -ano ^| findstr :3000') DO taskkill /PID %A /F

# Windows: Kill process on port 5000
FOR /F "tokens=5" %A IN ('netstat -ano ^| findstr :5000') DO taskkill /PID %A /F
```

---

## ✨ Final Checklist Before Starting

- [ ] Node.js and npm are installed
- [ ] Project files are accessible
- [ ] `server/.env` exists and is correct
- [ ] `client/.env` exists and points to localhost
- [ ] MongoDB Atlas cluster is running
- [ ] Ports 3000 and 5000 are available
- [ ] All dependencies installed successfully
- [ ] Backend test passed (health check)
- [ ] Frontend test passed (page loads)
- [ ] API communication test passed (Network tab shows 200s)

---

## 🎯 Ready to Develop?

```bash
# Start development
npm run dev

# Or in separate terminals:
# Terminal 1:
npm run server

# Terminal 2:
npm run client
```

**Visit: http://localhost:3000** ✅

---

## 📞 Need Help?

Save these reference URLs:
- **MongoDB Atlas:** https://www.mongodb.com/cloud/atlas
- **Node.js Download:** https://nodejs.org/
- **Project Docs:** See `LOCAL_SETUP.md` and `QUICK_START.md`

**All set! Happy coding! 🚀**
