# Mobile Google Sign In Troubleshooting Guide

## Current Issue: "Access Blocked" on Mobile

### Root Causes:
1. **Domain not authorized** - Mobile/Expo Go uses different domains
2. **Google Cloud Console restrictions** - Mobile OAuth requires specific configuration
3. **Firebase Console setup** - Mobile domains need to be whitelisted

## Immediate Fixes:

### 1. Firebase Console - Authorized Domains
Add these domains to Firebase Console → Authentication → Settings → Authorized domains:

```
localhost
127.0.0.1
192.168.1.XXX (your local IP)
exp.host
exp.direct
*.exp.host
*.exp.direct
*.expo.dev
*.expo.test
```

### 2. Google Cloud Console - OAuth Configuration
Go to Google Cloud Console → APIs & Services → Credentials:

**For your Web Client ID (`1084205685608-7hsfvp62t56lcgc4k2bqqavjt9ukhqjg.apps.googleusercontent.com`):**

Add these **Authorized redirect URIs**:
```
http://localhost:8081
http://localhost:19006  
https://auth.expo.io/@vcky8702/kyoolapp
exp://192.168.1.XXX:8081 (replace with your IP)
kyoolapp://oauth
```

Add these **Authorized JavaScript origins**:
```
http://localhost:8081
http://localhost:19006
https://localhost:8081
exp://exp.host
```

### 3. Test Steps:
1. **Clear cache**: `npx expo start --clear`
2. **Check console logs** - Look for detailed error messages
3. **Try different networks** - Sometimes corporate/restricted networks block OAuth
4. **Test on different devices** - Expo Go vs standalone builds behave differently

### 4. Alternative Mobile Implementation:

If the above doesn't work, uncomment and configure Android Client ID:

```env
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com
```

And create an Android OAuth Client in Google Cloud Console with:
- **Package name**: `host.exp.exponent` (for Expo Go)
- **SHA-1 certificate fingerprint**: Get from `expo credentials:manager`

## Debug Information:

The updated code now logs detailed information. Check your console for:
- Platform detection
- Firebase configuration
- Specific OAuth error codes
- Redirect URIs being used

## Common Error Messages:

1. **"Domain not authorized"** → Add domains to Firebase
2. **"redirect_uri_mismatch"** → Add redirect URIs to Google Cloud Console  
3. **"popup_blocked"** → Browser/webview blocking popups
4. **"access_blocked"** → OAuth client restrictions or app verification needed

## Production Considerations:

For production apps, you'll need:
1. **App Store/Play Store verification** with Google
2. **Production domains** added to authorized lists
3. **Native Google Sign In** packages for better UX
4. **Backend token validation** for security

## Next Steps:

1. Add the domains listed above to Firebase Console
2. Add redirect URIs to Google Cloud Console  
3. Test with the detailed logging enabled
4. Share the console logs if issues persist