# How to Run on Mobile/Other Devices - Step by Step

## Current Status ✅
Your **backend is running correctly**:
- ✅ Server listening on `0.0.0.0:5000` (accessible from network)
- ✅ CORS configured to allow local network IPs
- ✅ MongoDB connected

## What You Need to Do Now

### Step 1: Find Your PC's IP Address

**Windows Command Prompt:**
```bash
ipconfig
```

Look for "IPv4 Address" under your active network adapter.  
**Example:** `192.168.1.26` (you already know this from your earlier URL)

---

### Step 2: Configure Frontend for Network Access

#### Option A: Quick Method (Recommended)

**Run this in a NEW terminal (not the backend terminal):**

```bash
# Navigate to project root
cd C:\Users\masum\Desktop\Desktop\Mobilions\New folder (2)

# Run the setup script
setup-mobile-access.bat
```

This will:
- Automatically find your IP address
- Create `.env.local` file with correct API URL
- Configure everything for you

---

#### Option B: Manual Method

If the script doesn't work, do this manually:

1. **Create `.env.local` file:**
   ```bash
   cd C:\Users\masum\Desktop\Desktop\Mobilions\New folder (2)\starterkit
   notepad .env.local
   ```

2. **Add this content** (replace `192.168.1.26` with your actual IP):
   ```env
   NEXT_PUBLIC_API_URL=http://192.168.1.26:5000/api
   ```

3. **Save and close** the file

---

### Step 3: Start Frontend with Network Access

**Open a NEW Command Prompt/PowerShell** (keep backend running in the other one):

```bash
# Navigate to starterkit folder
cd C:\Users\masum\Desktop\Desktop\Mobilions\New folder (2)\starterkit

# Start with network access
npm run dev -- -H 0.0.0.0
```

**OR** use the new shortcut command:
```bash
npm run dev:network
```

You should see output like:
```
- ready started server on 0.0.0.0:3000, url: http://localhost:3000
- info Linting and checking validity of types
- event compiled client and server successfully
```

---

### Step 4: Access from Mobile

On your mobile device (must be on the **same WiFi** as your PC):

1. **Open browser** (Chrome, Safari, etc.)

2. **Navigate to:**
   ```
   http://192.168.1.26:3000
   ```
   (Replace with YOUR IP address)

3. **You should see the login page!** 🎉

---

## Complete Commands Summary

### Terminal 1 - Backend (Already Running ✅):
```bash
cd C:\Users\masum\Desktop\Desktop\Mobilions\New folder (2)\backend
nodemon server.js
```

### Terminal 2 - Frontend (What you need to start):
```bash
cd C:\Users\masum\Desktop\Desktop\Mobilions\New folder (2)\starterkit
npm run dev -- -H 0.0.0.0
```

---

## Quick Start Script (Easiest Way)

Instead of running commands manually, use this:

```bash
# From project root
cd C:\Users\masum\Desktop\Desktop\Mobilions\New folder (2)

# This starts BOTH servers with network access
start-mobile-access.bat
```

This will:
- Open 2 windows automatically
- Start backend server
- Start frontend server with network access
- Show you the IP address to use on mobile

---

## What to Expect

### Backend Console (what you already see):
```
🔒 CORS Configuration:
   Allowed Origins: [ 'http://localhost:3000', 'http://127.0.0.1:3000' ]
   Development mode: Allowing local network IPs
✅ Server running on http://0.0.0.0:5000
✅ MongoDB connected successfully
```

### Frontend Console (what you'll see after step 3):
```
🔗 API Base URL: http://192.168.1.26:5000/api
- ready started server on 0.0.0.0:3000
- Local:        http://localhost:3000
- On Your Network:  http://192.168.1.26:3000
```

---

## Troubleshooting

### Issue: "npm run dev -- -H 0.0.0.0" gives error

**Try these alternatives:**

```bash
# Method 1: Use the new script
npm run dev:network

# Method 2: Use npx
npx next dev -H 0.0.0.0

# Method 3: Use PowerShell specific syntax
npm run dev '--' -H 0.0.0.0
```

### Issue: Can't access from mobile

**Checklist:**
- ✅ Both servers running?
- ✅ Mobile on same WiFi?
- ✅ Using IP address (not localhost)?
- ✅ Firewall allowing Node.js?
- ✅ `.env.local` file created with correct IP?

**Test backend from mobile browser:**
```
http://192.168.1.26:5000
```
Should show: "API is running"

### Issue: Login fails on mobile

**Solution:**
After creating `.env.local`, you MUST restart the frontend:
1. Stop frontend (Ctrl+C)
2. Start again: `npm run dev:network`

---

## Verification Steps

### 1. Check Backend (Already Done ✅)
```bash
# Should respond with "API is running"
curl http://localhost:5000
```

### 2. Check Frontend Configuration
After starting frontend, check console for:
```
🔗 API Base URL: http://192.168.1.26:5000/api
```

### 3. Test from Mobile
Open mobile browser and go to:
```
http://192.168.1.26:3000
```

### 4. Check Network Connectivity
From mobile browser, test backend:
```
http://192.168.1.26:5000
```

---

## Windows Firewall (If Connection Fails)

If mobile can't connect:

1. **Open Windows Defender Firewall**
2. Click **"Allow an app or feature through Windows Defender Firewall"**
3. Click **"Change settings"**
4. Look for **Node.js**
5. Check both **Private** and **Public** boxes
6. Click **OK**

Or run this in **Administrator Command Prompt**:
```bash
netsh advfirewall firewall add rule name="Node.js" dir=in action=allow program="C:\Program Files\nodejs\node.exe" enable=yes
```

---

## Quick Reference

| What | Where | Command |
|------|-------|---------|
| Find IP | Windows | `ipconfig` |
| Backend | Terminal 1 | `cd backend && nodemon server.js` |
| Frontend | Terminal 2 | `cd starterkit && npm run dev:network` |
| Mobile URL | Browser | `http://YOUR_IP:3000` |
| Config File | starterkit | `.env.local` |

---

## Your Next Steps RIGHT NOW:

1. ✅ Backend is running (you already did this)
2. 🔄 **Open a NEW terminal**
3. 🔄 **Run:** `cd C:\Users\masum\Desktop\Desktop\Mobilions\New folder (2)\starterkit`
4. 🔄 **Create `.env.local`** with: `NEXT_PUBLIC_API_URL=http://192.168.1.26:5000/api`
5. 🔄 **Run:** `npm run dev -- -H 0.0.0.0`
6. 📱 **Access from mobile:** `http://192.168.1.26:3000`

---

**That's it! Your app will be accessible from any device on your WiFi!** 🚀

