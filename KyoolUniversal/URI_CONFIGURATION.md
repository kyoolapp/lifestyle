# Metro URI Configuration Guide

## Current Issue
You're getting inconsistent redirect URIs because Expo is auto-selecting tunnel mode.

## Solutions

### Option 1: Force Localhost Mode
```bash
# Always use localhost (most predictable)
npx expo start --localhost

# Or add to package.json
npm run start:localhost
```

### Option 2: Configure Google OAuth for Expo URIs
Add these URIs to Google Cloud Console:

**Current Tunnel URI (from your logs):**
```
exp://7pqm6ds-vcky8702-8081.exp.direct
```

**Standard URIs to also add:**
```
kyoolapp://oauth
http://localhost:8081/oauth
http://localhost:19006/oauth
exp://localhost:8081
```

### Option 3: Use Custom Scheme Only
The updated code now uses `kyoolapp://oauth` instead of the Expo tunnel URI.

### Test Commands
```bash
# Force localhost
npm run start:localhost

# Check what URI you get
# Look for "OAuth Redirect URIs" in console logs

# Copy the URI and add to Google Cloud Console
```

## Current Status
- ✅ Firebase Auth persistence: Fixed import path
- ✅ SafeAreaView: Updated DashboardScreen (more screens need updating)
- ✅ OAuth URI: Now using custom scheme instead of tunnel
- ⚠️ Google OAuth: Need to add URIs to Google Cloud Console

## Next Steps
1. Run `npm run start:localhost` for consistent URIs
2. Add the redirect URIs to Google Cloud Console
3. Test Google Sign In again