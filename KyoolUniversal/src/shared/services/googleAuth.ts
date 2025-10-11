import { Platform } from 'react-native';
import { 
  GoogleAuthProvider, 
  signInWithCredential 
} from 'firebase/auth';
// Only import web-specific methods conditionally
let signInWithPopup: any = null;
let signInWithRedirect: any = null;

if (Platform.OS === 'web') {
  // Only import these for web platform
  const webAuth = require('firebase/auth');
  signInWithPopup = webAuth.signInWithPopup;
  signInWithRedirect = webAuth.signInWithRedirect;
}

import { auth } from './firebase';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { getOAuthRedirectUri, logMetroInfo } from '../utils/metro';

// Complete the auth session for mobile
WebBrowser.maybeCompleteAuthSession();

export interface GoogleSignInResult {
  user: {
    uid: string;
    displayName: string | null;
    email: string | null;
    photoURL: string | null;
  };
}

export class GoogleSignIn {
  static async signIn(): Promise<GoogleSignInResult | null> {
    try {
      if (Platform.OS === 'web') {
        return await this.signInWeb();
      } else {
        return await this.signInMobile();
      }
    } catch (error) {
      console.error('Google Sign In Error:', error);
      throw error;
    }
  }

  private static async signInWeb(): Promise<GoogleSignInResult | null> {
    try {
      console.log('Starting Web Google Sign In...');
      console.log('Platform:', Platform.OS);
      
      if (!signInWithPopup) {
        throw new Error('signInWithPopup not available on this platform');
      }

      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');

      console.log('Attempting signInWithPopup...');
      const result = await signInWithPopup(auth, provider);
      
      console.log('Sign in successful:', result.user.email);
      
      return {
        user: {
          uid: result.user.uid,
          displayName: result.user.displayName,
          email: result.user.email,
          photoURL: result.user.photoURL,
        }
      };
    } catch (error: any) {
      console.error('signInWithPopup failed:', error);
      
      if (error.code === 'auth/popup-blocked' && signInWithRedirect) {
        console.log('Popup blocked, trying redirect...');
        const redirectProvider = new GoogleAuthProvider();
        redirectProvider.addScope('email');
        redirectProvider.addScope('profile');
        await signInWithRedirect(auth, redirectProvider);
        return null; // Will be handled by redirect
      }
      
      throw error;
    }
  }

  private static async signInMobile(): Promise<GoogleSignInResult | null> {
    try {
      console.log('Starting Mobile Google Sign In...');
      console.log('Platform:', Platform.OS);
      
      // Log Metro server information for debugging
      logMetroInfo();
      
      // Try multiple redirect URI strategies
      const redirectUri1 = AuthSession.makeRedirectUri({
        scheme: 'kyoolapp',
        preferLocalhost: false, // Disable localhost to avoid tunnel URLs
      });
      
      const redirectUri2 = getOAuthRedirectUri('kyoolapp');
      
      // Use the custom URI for better control
      const redirectUri = redirectUri2;

      console.log('OAuth Redirect URIs:', {
        authSession: redirectUri1,
        custom: redirectUri2,
        selected: redirectUri
      });

      const clientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
      
      if (!clientId) {
        throw new Error('Google Web Client ID not configured');
      }

      // Use implicit flow to get id_token directly
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${clientId}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=id_token&` +
        `scope=openid%20profile%20email&` +
        `nonce=${Math.random().toString(36).substring(2, 15)}&` +
        `prompt=select_account`;

      console.log('Opening Mobile OAuth...');

      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

      console.log('Mobile OAuth Result:', result);

      if (result.type === 'success' && result.url) {
        // Parse the URL fragment to get the id_token
        const fragment = result.url.split('#')[1];
        if (fragment) {
          const params = new URLSearchParams(fragment);
          const idToken = params.get('id_token');
          
          if (idToken) {
            console.log('Got ID token, signing in with Firebase...');
            
            // Create credential and sign in with Firebase
            const credential = GoogleAuthProvider.credential(idToken);
            const userCredential = await signInWithCredential(auth, credential);
            
            console.log('Mobile sign in successful:', userCredential.user.email);
            
            return {
              user: {
                uid: userCredential.user.uid,
                displayName: userCredential.user.displayName,
                email: userCredential.user.email,
                photoURL: userCredential.user.photoURL,
              }
            };
          }
        }
      }
      
      if (result.type === 'cancel') {
        console.log('User cancelled OAuth flow');
        return null;
      }

      if (result.type === 'dismiss') {
        console.log('OAuth dismissed');
        return null;
      }
      
      console.log('No valid OAuth result received');
      return null;
    } catch (error) {
      console.error('Mobile Google Sign In error:', error);
      throw error;
    }
  }

  static async signOut(): Promise<void> {
    try {
      await auth.signOut();
    } catch (error) {
      console.error('Google Sign Out Error:', error);
      throw error;
    }
  }
}