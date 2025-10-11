# Android Development Build & Testing Guide

## 🚀 Quick Start Commands

```bash
# Build Android development client
eas build --platform android --profile development

# Check build status
eas build:list

# Start development server for dev build
npx expo start --dev-client
```

## 📱 Step-by-Step Android Testing Process

### Step 1: Build Development Client

```bash
# Navigate to project
cd "d:\Projects\Kyool\KyoolUniversal"

# Build Android development client (takes 10-15 minutes)
eas build --platform android --profile development
```

**What this does:**
- Creates a custom Android APK with your app's native dependencies
- Includes development tools for hot reloading
- Works like "Expo Go" but with your specific configuration

### Step 2: Install APK on Android Device

**Option A: Direct Download**
1. EAS will provide a download link when build completes
2. Open link on Android device
3. Download and install APK
4. Enable "Install from Unknown Sources" if prompted

**Option B: ADB Install**
```bash
# Download APK to computer first
# Then install via ADB
adb install path/to/your-app.apk
```

### Step 3: Start Development Server

```bash
# Start server for development client
npx expo start --dev-client

# NOT regular expo start - dev client needs special server
```

### Step 4: Connect Device to Development Server

1. **Open your dev build app** on Android device
2. **Shake device** or use dev menu to open developer options
3. **Enter development server URL** (shown in terminal)
4. **App loads with hot reloading enabled**

## 🔧 Alternative: Local Android Development

### Option 1: Android Studio + Emulator

```bash
# Generate native Android project
npx expo run:android

# This will:
# 1. Generate android/ folder
# 2. Open Android Studio
# 3. Build and run on emulator/device
```

### Option 2: Physical Device via USB

```bash
# Enable USB debugging on Android device
# Connect via USB
npx expo run:android --device
```

## 📋 Testing Checklist

### Before Building:
- ✅ **EAS CLI installed**: `npm install -g @expo/eas-cli`
- ✅ **Logged into Expo**: `eas login`
- ✅ **Android config complete**: Check app.json
- ✅ **Environment variables set**: Check .env file

### After Building:
- ✅ **APK downloaded and installed**
- ✅ **Development server running**: `npx expo start --dev-client`
- ✅ **Device connected to server**
- ✅ **App loads and functions correctly**

## 🎯 Recommended Testing Flow

### For Your Kyool App Specifically:

1. **Build dev client** (one-time setup):
   ```bash
   eas build --platform android --profile development
   ```

2. **Install APK** on Android device

3. **Start dev server**:
   ```bash
   npx expo start --dev-client
   ```

4. **Test key features**:
   - ✅ Login/Signup flows
   - ✅ Google Sign In (with proper OAuth setup)
   - ✅ Firebase authentication persistence
   - ✅ Navigation between screens
   - ✅ API calls to backend
   - ✅ Water tracker functionality
   - ✅ Fitness tracker features

## 🛠️ Troubleshooting

### Common Issues:

**Build fails:**
- Check `eas build:list` for error details
- Verify app.json configuration
- Check for dependency conflicts

**APK won't install:**
- Enable "Install from Unknown Sources"
- Check Android version compatibility
- Try ADB install method

**Can't connect to dev server:**
- Use `--tunnel` flag: `npx expo start --dev-client --tunnel`
- Check firewall settings
- Verify device and computer on same network

**Google Sign In not working:**
- Add Android package name to Google Cloud Console
- Configure OAuth redirect URIs for Android
- Check Firebase Android app configuration

### Debug Commands:

```bash
# Check build status
eas build:list

# View build logs
eas build:view [BUILD_ID]

# Test locally first
npx expo start --dev-client --localhost

# Use tunnel for network issues
npx expo start --dev-client --tunnel
```

## 🎯 Production Builds (Later)

```bash
# Internal testing build
eas build --platform android --profile preview

# Play Store build
eas build --platform android --profile production

# Submit to Play Store
eas submit --platform android
```

## 📱 Device Requirements

**Minimum Android Version:** 6.0 (API level 23)
**Recommended:** Android 8.0+ for best performance
**RAM:** 2GB+ recommended
**Storage:** 100MB+ free space

## ⚡ Quick Commands Reference

```bash
# Essential commands for Android development:

# Build dev client (one-time)
eas build --platform android --profile development

# Start dev server
npx expo start --dev-client

# Check builds
eas build:list

# Install via ADB
adb install app-release.apk

# Generate local project
npx expo run:android
```

Your app is now ready for Android development builds! The EAS configuration is already set up perfectly.