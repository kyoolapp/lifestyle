# Google Sign In Setup Guide

This guide explains how to configure Google Sign In for the Kyool Universal app.

## Current Implementation

The current implementation uses Firebase's web-based Google Sign In (`signInWithPopup`) which works across all platforms in the Expo/React Native environment. This provides immediate functionality without requiring additional native dependencies.

## Setup Instructions

### 1. Firebase Console Configuration

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Authentication** > **Sign-in method**
4. Enable **Google** as a sign-in provider
5. Add your authorized domains (including localhost for development)

### 2. Google Cloud Console Configuration

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Select your Firebase project
3. Navigate to **APIs & Services** > **Credentials**
4. Create OAuth 2.0 Client IDs for each platform:
   - **Web application** for web builds
   - **iOS** for iOS builds (when you publish to App Store)
   - **Android** for Android builds (when you publish to Play Store)

### 3. Environment Variables

Copy `.env.example` to `.env` and fill in your configuration:

```bash
# Firebase Configuration (from Firebase Console > Project Settings)
EXPO_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id

# Google OAuth Configuration (from Google Cloud Console)
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your_google_web_client_id
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=your_google_ios_client_id.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=your_google_android_client_id.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID=your_google_expo_client_id.apps.googleusercontent.com
```

## How It Works

### Current Web-Based Implementation

The app currently uses Firebase's `signInWithPopup` method which:
- Opens a popup window with Google OAuth
- Works on web browsers
- Works in Expo Go app (which runs in a web context)
- Handles authentication entirely through Firebase

### User Flow

1. User taps "Continue with Google" button
2. Google OAuth popup opens
3. User signs in with their Google account
4. Firebase receives the authentication token
5. User is automatically signed in to the app
6. App navigation updates based on auth state

### Files Modified

- `src/shared/services/googleAuth.ts` - Google Sign In service
- `src/shared/screens/LoginScreen.tsx` - Added Google Sign In button
- `src/shared/screens/SignUpScreen.tsx` - Added Google Sign In button

## Future Improvements

For production apps, you may want to implement native Google Sign In for better user experience:

### Option 1: Expo Google Sign In
```bash
npx expo install expo-auth-session expo-crypto expo-web-browser
```

### Option 2: React Native Google Sign In
```bash
npm install @react-native-google-signin/google-signin
```

### Option 3: Expo AuthSession
Already partially implemented in the codebase for future use.

## Testing

1. Run the app: `npm start`
2. Open in web browser or Expo Go
3. Navigate to Login or Sign Up screen
4. Tap "Continue with Google" button
5. Complete Google OAuth flow
6. Verify user is signed in and redirected to Dashboard

## Troubleshooting

### Common Issues

1. **Popup blocked**: The web browser may block the OAuth popup. Users need to allow popups for the site.

2. **Domain not authorized**: Add your development domain (e.g., `localhost:8081`) to Firebase's authorized domains.

3. **Client ID mismatch**: Ensure you're using the correct OAuth client ID for the platform you're testing on.

4. **CORS issues**: Make sure your domain is added to both Firebase and Google Cloud Console authorized origins.

### Development Testing

- **Web**: Works with localhost domains
- **Expo Go**: Works as it runs in a web context
- **iOS Simulator**: Works with Expo Go
- **Android Emulator**: Works with Expo Go

### Production Considerations

- Add your production domains to Firebase authorized domains
- Use platform-specific OAuth client IDs
- Consider implementing native Google Sign In for better UX
- Test on actual devices, not just simulators

## Security Notes

- OAuth client secrets should never be exposed in client-side code
- Use environment variables for all configuration
- Regularly rotate OAuth credentials
- Monitor authentication logs in Firebase Console