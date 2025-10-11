# iOS Build and Testing Guide

## Quick Testing with Expo Go (Recommended for Development)

1. **Install Expo Go** on iPhone from App Store
2. **Start development server:**
   ```bash
   npx expo start
   # or for tunnel mode:
   npx expo start --tunnel
   ```
3. **Scan QR code** with iPhone camera or Expo Go app
4. **App opens instantly** in Expo Go

## Building Standalone iOS App

### Prerequisites
- **Apple Developer Account** ($99/year) for App Store testing
- **macOS** (required for iOS builds) OR use Expo's cloud build service

### Option 1: Cloud Build with EAS (Recommended)

```bash
# Install EAS CLI
npm install -g @expo/eas-cli

# Login to Expo
eas login

# Configure build
eas build:configure

# Build for iOS development
eas build --platform ios --profile development

# Build for TestFlight/App Store
eas build --platform ios --profile production
```

### Option 2: Local Build (Requires macOS + Xcode)

```bash
# Generate native iOS project
npx expo run:ios

# This creates ios/ folder and opens Xcode
# Build and run from Xcode
```

## Testing Options

### 1. Expo Go (No Build Needed)
✅ **Fastest for development**
✅ **Instant updates**
❌ **Limited to Expo SDK features**
❌ **Can't test native modules**

### 2. Development Build
✅ **Full native features**
✅ **Custom native code**
❌ **Requires build process**
❌ **Takes longer to update**

### 3. TestFlight (Production Testing)
✅ **Production environment**
✅ **Share with testers**
❌ **App Store review for new builds**
❌ **Longer build times**

## Current Project Status

Your app should work well in **Expo Go** since it uses:
- ✅ Standard Expo SDK features
- ✅ Firebase (supported in Expo Go)
- ✅ React Navigation
- ✅ Standard React Native components

## Quick Start Commands

```bash
# For immediate testing
npx expo start

# For different network
npx expo start --tunnel

# For LAN access
npx expo start --lan

# For localhost only
npx expo start --localhost

# Build iOS app (requires Apple Developer account)
eas build --platform ios
```

## Troubleshooting

### Common Issues:
1. **QR Code not working**: Try tunnel mode `npx expo start --tunnel`
2. **Network issues**: Use `--lan` flag
3. **Google Sign In issues**: Check redirect URIs in Google Cloud Console
4. **Firebase issues**: Verify configuration in `.env` file

### Debug Steps:
1. Check terminal output for errors
2. Check iPhone/Expo Go for error messages
3. Check network connectivity
4. Verify Expo account login
