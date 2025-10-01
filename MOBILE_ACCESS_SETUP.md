# Mobile/Network Access Setup Guide

This guide will help you access the application from your mobile device or other devices on the same network.

## Problem
By default, the application uses `localhost` which only works on the same computer. To access from mobile or other devices, you need to use your PC's IP address.

## Solution

### Step 1: Find Your PC's IP Address

#### On Windows:
1. Open Command Prompt (cmd)
2. Type: `ipconfig`
3. Look for "IPv4 Address" under your active network adapter
4. It will look something like: `192.168.1.100` or `10.0.0.5`

#### On Mac:
1. Open Terminal
2. Type: `ifconfig | grep "inet "` 
3. Look for the IP address (not 127.0.0.1)

#### On Linux:
1. Open Terminal
2. Type: `ip addr show` or `ifconfig`
3. Look for your network interface IP address

**Example IP:** Let's say your IP is `192.168.1.100`

---

### Step 2: Configure the Frontend (Next.js)

#### Option A: Using Environment Variable (Recommended)

1. Navigate to the `starterkit` folder
2. Create a file named `.env.local` (note the dot at the beginning)
3. Add the following content:
```env
NEXT_PUBLIC_API_URL=http://192.168.1.100:5000/api
```
Replace `192.168.1.100` with your actual IP address.

4. **IMPORTANT:** Restart the Next.js development server:
```bash
# Stop the server (Ctrl+C) and restart
cd starterkit
npm run dev
```

#### Option B: Direct Edit (Quick Method)
If you don't want to use environment variables, you can directly edit the axios config:

File: `starterkit/src/utils/axios.js`

Change line 4 from:
```javascript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
```
To:
```javascript
const API_URL = 'http://192.168.1.100:5000/api'; // Replace with your IP
```

---

### Step 3: Configure the Backend (Node.js/Express)

The backend is already configured to:
- Listen on all network interfaces (0.0.0.0)
- Accept CORS requests from local network IPs

**Optional:** Create `.env` file in `backend` folder for custom origins:
```env
ALLOWED_ORIGINS=http://localhost:3000,http://192.168.1.100:3000
PORT=5000
```

**Restart the backend server:**
```bash
cd backend
node server.js
```

---

### Step 4: Start the Frontend with Network Access

Instead of the default dev command, start Next.js to listen on all network interfaces:

```bash
cd starterkit
npm run dev -- -H 0.0.0.0
```

Or update `package.json` script:
```json
"scripts": {
  "dev": "next dev -H 0.0.0.0",
  "build": "next build",
  "start": "next start"
}
```

---

### Step 5: Access from Mobile Device

1. Make sure your mobile device is on the **same WiFi network** as your PC
2. On your mobile device, open a browser
3. Navigate to: `http://192.168.1.100:3000` (replace with your IP)
4. You should now see the login page!

---

## Troubleshooting

### Issue: "Login Failed" or "Invalid Credentials"
**Cause:** The frontend is still trying to connect to localhost instead of your IP

**Solution:**
1. Check if you created `.env.local` file correctly
2. Verify the IP address is correct
3. **Restart the Next.js dev server** (this is crucial!)
4. Check browser console for API URL (should show your IP, not localhost)

### Issue: "Network Error" or "Cannot connect"
**Cause:** Firewall blocking the connection

**Solution (Windows):**
1. Open Windows Defender Firewall
2. Click "Allow an app through firewall"
3. Allow Node.js on both Private and Public networks
4. Or temporarily disable firewall for testing

**Solution (Mac):**
1. System Preferences → Security & Privacy → Firewall
2. Click Firewall Options
3. Ensure Node is allowed

### Issue: CORS Error
**Cause:** Backend not allowing requests from your IP

**Solution:**
The backend is now configured to allow local network IPs automatically in development mode. If you still have issues:
1. Check backend console logs for CORS messages
2. Verify both frontend and backend are using the same IP
3. Restart the backend server

### Issue: "Connection Refused"
**Solutions:**
1. Verify backend is running: `http://192.168.1.100:5000` should show "API is running"
2. Check if port 5000 and 3000 are not blocked by firewall
3. Ensure both devices are on the same network (same WiFi)

---

## Quick Start Commands

**Terminal 1 - Backend:**
```bash
cd backend
node server.js
```

**Terminal 2 - Frontend:**
```bash
cd starterkit
npm run dev -- -H 0.0.0.0
```

**Access URLs:**
- From PC: `http://localhost:3000`
- From Mobile: `http://192.168.1.100:3000` (use your IP)

---

## Important Notes

1. **Restart Required:** Always restart both servers after changing configuration
2. **Same Network:** Mobile device must be on the same WiFi as your PC
3. **IP Changes:** Your IP might change if you reconnect to WiFi
4. **Security:** This setup is for development only, not production!
5. **Environment Files:** `.env` and `.env.local` are git-ignored for security

---

## Production Deployment

For production deployment, use proper domain names and HTTPS:
- Deploy backend to Heroku, AWS, or DigitalOcean
- Deploy frontend to Vercel, Netlify, or AWS
- Update `NEXT_PUBLIC_API_URL` to production backend URL
- Configure proper CORS origins in backend
- Use HTTPS for secure connections

---

## Example Configuration Files

### starterkit/.env.local
```env
# Replace with your PC's IP address
NEXT_PUBLIC_API_URL=http://192.168.1.100:5000/api
```

### backend/.env
```env
MONGODB_URI=mongodb://localhost:27017/timetracker
PORT=5000
JWT_SECRET=your-secret-key
ALLOWED_ORIGINS=http://localhost:3000,http://192.168.1.100:3000
```

---

## Need Help?

If you're still having issues:
1. Check the browser console (F12) for error messages
2. Check backend terminal for logs
3. Verify IP address hasn't changed (`ipconfig` again)
4. Make sure both servers are running
5. Try accessing backend directly: `http://YOUR_IP:5000/api`

---

**Last Updated:** October 2025
**Tested On:** Windows 10/11, Mac OS, Android, iOS

