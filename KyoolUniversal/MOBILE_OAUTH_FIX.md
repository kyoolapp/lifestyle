# Mobile OAuth Configuration Fix

## Current Problem
The Google OAuth flow works but after authentication, it stays in the web browser instead of returning to the mobile app.

## Root Cause
Using **Web OAuth Client** for mobile authentication causes browser redirect issues. Mobile apps need **Native OAuth Clients**.

## Solution: Create Native OAuth Clients

### Step 1: Create Android OAuth Client
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to APIs & Services → Credentials  
3. Click "Create Credentials" → "OAuth 2.0 Client ID"
4. Choose "Android" as application type
5. Fill in:
   - **Name**: Kyool Android App
   - **Package name**: `com.kyoolapp.kyooluniversal` (from app.json)
   - **SHA-1 certificate fingerprint**: Get from Expo/development certificate

### Step 2: Create iOS OAuth Client  
1. Same process but choose "iOS" as application type
2. Fill in:
   - **Name**: Kyool iOS App
   - **Bundle ID**: `com.kyoolapp.kyooluniversal` (from app.json)

### Step 3: Get SHA-1 Certificate for Android
```bash
# For Expo development
expo credentials:manager

# Or get debug certificate SHA-1
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

### Step 4: Update Environment Variables
Add the new client IDs to your `.env`:
```env
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=your-android-client-id.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=your-ios-client-id.apps.googleusercontent.com
```

### Step 5: Update OAuth Implementation
The code will use platform-specific client IDs instead of the web client ID.

## Quick Fix Options (Choose One)

### Option A: Add Custom Scheme (Try First)
Add `kyoolapp://oauth` to Google Console Authorized redirect URIs.
- Even if Console shows error, try saving it - sometimes it works anyway
- Test OAuth after adding

### Option B: Use Expo Auth Proxy  
Add `https://auth.expo.io/@vcky8702/kyoolapp` to Google Console
- Replace `vcky8702` with your Expo username  
- This uses Expo's OAuth proxy service
- More reliable but requires Expo account

### Option C: Test Current Implementation
The updated code now uses `useProxy: true` which should automatically handle the redirect properly.

## Testing Steps
1. Choose one of the redirect URIs above
2. Add it to Google Console → Credentials → Your Web Client → Authorized redirect URIs  
3. Save the configuration
4. Test mobile OAuth - should return to app properly now

## Expected Result
✅ OAuth opens in browser  
✅ User authenticates with Google  
✅ Browser closes and returns to mobile app  
✅ User is logged in successfully