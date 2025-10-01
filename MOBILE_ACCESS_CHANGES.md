# Mobile Access - Changes Summary

## What Was Fixed

### Problem
The application was hardcoded to use `localhost:5000`, which only works on the same computer. When accessing from a mobile device using the PC's IP address, the login would fail because the frontend was still trying to connect to `localhost` instead of the actual server IP.

---

## Changes Made

### 1. Frontend (starterkit/src/utils/axios.js)
**Before:**
```javascript
const axiosServices = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000,
});
```

**After:**
```javascript
// Use environment variable for API URL, fallback to localhost
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const axiosServices = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// Log the API URL in development mode for debugging
if (process.env.NODE_ENV === 'development') {
  console.log('🔗 API Base URL:', API_URL);
}
```

**Impact:** Frontend now reads API URL from environment variable, allowing dynamic configuration.

---

### 2. Backend (backend/server.js)
**Before:**
```javascript
app.use(
  cors({
    origin: "http://0.0.0.0:3000",
    credentials: true,
  })
);
```

**After:**
```javascript
// Configure CORS to allow multiple origins
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:3000', 'http://127.0.0.1:3000'];

// Add wildcard support for development (allows any IP on port 3000)
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed list
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } 
    // In development, allow any localhost or 192.168.x.x IP on port 3000
    else if (process.env.NODE_ENV !== 'production' && 
             (origin.match(/^http:\/\/localhost:\d+$/) || 
              origin.match(/^http:\/\/127\.0\.0\.1:\d+$/) ||
              origin.match(/^http:\/\/192\.168\.\d+\.\d+:\d+$/) ||
              origin.match(/^http:\/\/10\.\d+\.\d+\.\d+:\d+$/))) {
      callback(null, true);
    } else {
      console.log('❌ CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
```

**Impact:** Backend now accepts connections from:
- localhost (127.0.0.1, localhost)
- Local network IPs (192.168.x.x, 10.x.x.x)
- Custom origins from environment variable

---

### 3. Package.json (starterkit/package.json)
**Added:**
```json
"scripts": {
  "dev": "next dev",
  "dev:network": "next dev -H 0.0.0.0",  // NEW
  "build": "next build",
  "start": "next start",
  "lint": "next lint"
}
```

**Impact:** New command to start frontend with network access enabled.

---

## New Files Created

1. **env.local.example** - Template for frontend environment configuration
2. **env.example** - Template for backend environment configuration
3. **MOBILE_ACCESS_SETUP.md** - Comprehensive setup guide
4. **QUICK_MOBILE_SETUP.md** - Quick reference guide
5. **setup-mobile-access.bat** - Automated setup script (Windows)
6. **start-mobile-access.bat** - Start both servers with network access (Windows)

---

## How It Works Now

### Configuration Flow

1. **Frontend Configuration** (`.env.local`):
   ```env
   NEXT_PUBLIC_API_URL=http://192.168.1.100:5000/api
   ```

2. **Backend Configuration** (`.env`):
   ```env
   ALLOWED_ORIGINS=http://localhost:3000,http://192.168.1.100:3000
   PORT=5000
   ```

3. **Server Startup**:
   - Backend listens on `0.0.0.0:5000` (all interfaces)
   - Frontend listens on `0.0.0.0:3000` (all interfaces)

4. **Mobile Access**:
   - Mobile browser connects to `http://192.168.1.100:3000`
   - Frontend makes API calls to `http://192.168.1.100:5000/api`
   - Backend accepts the request (CORS allows local network)
   - Authentication works correctly

---

## Usage Instructions

### Quick Method (Windows)
```bash
# 1. Run setup
setup-mobile-access.bat

# 2. Start servers
start-mobile-access.bat

# 3. Access from mobile
http://YOUR_IP:3000
```

### Manual Method
```bash
# 1. Create .env.local in starterkit folder
NEXT_PUBLIC_API_URL=http://YOUR_IP:5000/api

# 2. Start backend
cd backend
node server.js

# 3. Start frontend (new terminal)
cd starterkit
npm run dev:network

# 4. Access from mobile
http://YOUR_IP:3000
```

---

## Verification Steps

### 1. Check Frontend Configuration
Open browser console, you should see:
```
🔗 API Base URL: http://192.168.1.100:5000/api
```

### 2. Check Backend CORS
Backend console should show:
```
🔒 CORS Configuration:
   Allowed Origins: http://localhost:3000
   Development mode: Allowing local network IPs
```

### 3. Test Backend API
From mobile browser, access:
```
http://YOUR_IP:5000
```
Should display: "API is running"

### 4. Test Login
From mobile browser:
- Go to `http://YOUR_IP:3000`
- Login should work correctly
- No CORS errors in console

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Login fails on mobile | Restart frontend server after creating `.env.local` |
| Cannot connect | Check Windows Firewall, allow Node.js |
| CORS error | Restart backend server |
| IP changed | Update `.env.local` and restart |

---

## Important Notes

1. **Restart Required**: Always restart servers after config changes
2. **Same Network**: Mobile must be on same WiFi as PC
3. **IP Address**: May change when reconnecting to WiFi
4. **Development Only**: Not for production use
5. **Firewall**: May need to allow Node.js through firewall

---

## Rollback

To revert to localhost-only:

1. Delete `starterkit/.env.local`
2. Restart frontend server
3. Backend will still work (backwards compatible)

---

## Production Considerations

For production deployment:
- Use proper domain names (e.g., `api.yourdomain.com`)
- Use HTTPS/SSL certificates
- Set specific CORS origins (no wildcards)
- Use environment-specific configurations
- Consider using a reverse proxy (nginx)
- Set `NODE_ENV=production`

---

**Changed Files:**
- `starterkit/src/utils/axios.js` ✓
- `backend/server.js` ✓
- `starterkit/package.json` ✓

**New Files:**
- `env.local.example` ✓
- `env.example` ✓
- `MOBILE_ACCESS_SETUP.md` ✓
- `QUICK_MOBILE_SETUP.md` ✓
- `MOBILE_ACCESS_CHANGES.md` ✓
- `setup-mobile-access.bat` ✓
- `start-mobile-access.bat` ✓

