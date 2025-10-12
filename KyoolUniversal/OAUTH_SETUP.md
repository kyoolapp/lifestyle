# Mobile OAuth Setup Guide

## Current Issue
Your Google OAuth is working on web (localhost) but failing on mobile because Google OAuth requires **stable HTTPS URLs** for redirect URIs, but Expo Metro provides **dynamic HTTP URLs**.

## ❌ Solution 1: Custom Scheme (NOT SUPPORTED)

**ISSUE**: Google Web OAuth clients don't accept custom schemes like `kyoolapp://oauth`. They require valid HTTPS domains.

**Error**: "Invalid Redirect: must end with a public top-level domain (such as .com or .org)."

## ✅ Solution 2: Expo Development Tunnel (Recommended)

### Step 1: Start Expo with Tunnel
```bash
# In your KyoolUniversal directory
npx expo start --tunnel
```

This creates a public HTTPS URL like: `https://abc123-yourname-8081.exp.direct`

### Step 2: Add Tunnel URL to Google Console
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to your project → APIs & Services → Credentials
3. Find your Web Client OAuth 2.0 credentials
4. Add this to "Authorized redirect URIs":
   ```
   https://abc123-yourname-8081.exp.direct/oauth
   ```
   (Replace with your actual tunnel URL)
5. Save the configuration

### Step 2: Your App is Already Configured!
Your mobile OAuth setup is already correct in `googleAuth.ts`:
- ✅ Uses `kyoolapp://oauth` as redirect URI
- ✅ Handles the OAuth response properly
- ✅ Integrates with Firebase Auth

### Step 3: Test Mobile OAuth
After adding the redirect URI to Google Console, your mobile OAuth should work immediately.

## 🔧 Alternative Solutions

### Option A: Use Native OAuth Clients (Production Ready)

1. **Create Android OAuth Client**:
   - Client type: Android
   - Package name: `host.exp.exponent` (for Expo Go) or your bundle ID
   - SHA-1 certificate fingerprint (for production)

2. **Create iOS OAuth Client**:
   - Client type: iOS
   - Bundle ID: `host.exp.exponent` (for Expo Go) or your bundle ID

3. **Update your environment variables**:
   ```env
   EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=your-android-client-id
   EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=your-ios-client-id
   ```

### Option B: Use ngrok (Alternative Tunnel)
```bash
npm install -g ngrok
ngrok http 8081
```
Then use the HTTPS URL (e.g., `https://abc123.ngrok.io/oauth`) as redirect URI.

### Option C: Quick Test Scripts
Use the provided scripts for easy tunnel setup:
- Windows: `start-with-tunnel.bat`
- Mac/Linux: `start-with-tunnel.sh`

## 🐛 Troubleshooting

### Check if OAuth Redirect URI is Added
- Error: "redirect_uri_mismatch" = URI not added to Google Console
- Error: "invalid_client" = Wrong client ID or misconfiguration

### Debug OAuth Flow
Check the console logs when testing mobile OAuth:
```
=== Metro/Development Server Info ===
OAuth Redirect URIs: { selected: "kyoolapp://oauth" }
```

### Test Web vs Mobile
- Web: Should use popup/redirect with localhost URI
- Mobile: Should use custom scheme `kyoolapp://oauth`

## 📱 Expected Flow
1. User taps "Sign in with Google"
2. Browser opens with Google OAuth
3. User authenticates
4. Google redirects to `kyoolapp://oauth`
5. App receives the response and completes sign-in

## ✅ Quick Fix Steps (Updated)

### For Development:
1. **Start Expo with tunnel**: Run `npx expo start --tunnel` or use `start-with-tunnel.bat`
2. **Copy the tunnel URL**: e.g., `https://abc123-yourname-8081.exp.direct`
3. **Add to Google Console**: Add `https://abc123-yourname-8081.exp.direct/oauth` to redirect URIs
4. **Test mobile OAuth**: Should work immediately!

### For Production:
1. **Create native OAuth clients** (Android/iOS) in Google Console
2. **Update environment variables** with native client IDs
3. **Update OAuth implementation** to use platform-specific clients

## ✅ Expected Results
- **Web**: Uses localhost redirect URI (works as before)
- **Mobile**: Uses tunnel HTTPS URL (now Google-compliant)
- **Console**: Shows successful OAuth flow with proper redirect handling