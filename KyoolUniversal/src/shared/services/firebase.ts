import { initializeApp } from "firebase/app";
import { initializeAuth, getAuth } from "firebase/auth";
import { Platform } from "react-native";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with proper persistence
let auth: any;

if (Platform.OS === 'web') {
  // Web platform - use default auth
  auth = getAuth(app);
  // Set web persistence
  //import('firebase/auth').then(({ browserLocalPersistence, setPersistence }) => {
    //setPersistence(auth, browserLocalPersistence).catch(console.warn);
  //});
} else {
  // React Native platforms - use AsyncStorage persistence
  try {
    // Import AsyncStorage
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    
    // Import Firebase Auth methods - the correct way for v9+
    const { getReactNativePersistence } = require('firebase/auth');
    
    console.log('Initializing Firebase Auth with AsyncStorage...');
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage)
    });
    console.log('Firebase Auth initialized with AsyncStorage persistence');
  } catch (error) {
    console.warn('Failed to initialize Firebase Auth with AsyncStorage, falling back to memory persistence:', error);
    // Fallback to default auth if AsyncStorage setup fails
    auth = getAuth(app);
  }
}

export { auth };