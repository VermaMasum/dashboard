# 🚀 Quick Mobile Access Setup

## TL;DR - Fast Setup (Windows)

1. **Run the setup script:**
   ```bash
   setup-mobile-access.bat
   ```

2. **Start both servers:**
   ```bash
   start-mobile-access.bat
   ```

3. **Access from mobile:**
   - Open browser on your phone
   - Navigate to the IP shown (e.g., `http://192.168.1.100:3000`)
   - Make sure you're on the **same WiFi**

---

## Manual Setup (3 Steps)

### Step 1: Find Your IP Address
**Windows:** Run `ipconfig` in Command Prompt
**Example:** `192.168.1.100`

### Step 2: Create Config File
Create file: `starterkit/.env.local`
```env
NEXT_PUBLIC_API_URL=http://192.168.1.100:5000/api
```
*Replace `192.168.1.100` with YOUR IP*

### Step 3: Start Servers

**Terminal 1 (Backend):**
```bash
cd backend
node server.js
```

**Terminal 2 (Frontend):**
```bash
cd starterkit
npm run dev:network
```

---

## Access Points

| From | URL |
|------|-----|
| PC | `http://localhost:3000` |
| Mobile | `http://YOUR_IP:3000` |
| Backend API | `http://YOUR_IP:5000/api` |

---

## Common Issues & Fixes

### ❌ "Login Failed" on Mobile
**Fix:** 
1. Restart the frontend server
2. Clear browser cache on mobile
3. Verify IP address is correct in `.env.local`

### ❌ "Cannot Connect"
**Fix:**
1. Check Windows Firewall - allow Node.js
2. Ensure mobile is on same WiFi as PC
3. Try accessing `http://YOUR_IP:5000` directly

### ❌ CORS Error
**Fix:** Backend is already configured. Just restart backend server.

---

## Commands Reference

```bash
# Find IP (Windows)
ipconfig

# Run setup script
setup-mobile-access.bat

# Start with mobile access
start-mobile-access.bat

# Manual start (Frontend with network access)
cd starterkit
npm run dev:network

# Manual start (Backend)
cd backend
node server.js
```

---

## What Changed?

1. ✅ Frontend now uses environment variable for API URL
2. ✅ Backend accepts connections from local network IPs
3. ✅ CORS configured to allow mobile devices
4. ✅ Servers listen on all network interfaces (0.0.0.0)

---

## Testing the Connection

### Test Backend (from mobile browser):
```
http://YOUR_IP:5000
```
Should show: "API is running"

### Test Frontend (from mobile browser):
```
http://YOUR_IP:3000
```
Should show: Login page

---

## Security Note
⚠️ This setup is for **development only**. For production:
- Use HTTPS
- Use proper domain names
- Restrict CORS origins
- Use environment-specific configurations

---

## Need More Help?
See full guide: `MOBILE_ACCESS_SETUP.md`

