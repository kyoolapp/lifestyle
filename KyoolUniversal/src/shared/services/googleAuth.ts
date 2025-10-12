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
import * as Google from 'expo-auth-session/providers/google';
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
      
      // Use Expo's AuthSession proxy for mobile OAuth
      // Manually construct the Expo proxy URL since makeRedirectUri isn't working
      const redirectUri = AuthSession.makeRedirectUri({ 
          preferLocalhost: false,
          scheme: 'https',
          path:'auth.expo.io/@vcky8702/kyoolappuniversal'
          //https://auth.expo.io/@vcky8702/kyoolapp
      });

      const clientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
      
      if (!clientId) {
        throw new Error('Google Web Client ID not configured');
      }

      // Create the Google OAuth request
      const request = new AuthSession.AuthRequest({
        clientId: clientId,
        scopes: ['openid', 'profile', 'email'],
        redirectUri: redirectUri,
        responseType: AuthSession.ResponseType.IdToken,
        prompt: AuthSession.Prompt.SelectAccount,
        extraParams: {
          nonce: Math.random().toString(36).substring(2, 15),
        },
      });

      console.log('Google OAuth request configured:', {
        redirectUri: redirectUri,
        clientId: 'Set',
        note: 'Add this redirect URI to Google Console if not already added'
      });

      console.log('Opening Google OAuth...');
      const result = await request.promptAsync({
        authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
      });

      console.log('Google OAuth Result:', result);

      if (result.type === 'success') {
        const { params } = result;
        if (params.id_token) {
          console.log('Got ID token from Google, signing in with Firebase...');
          
          // Create credential and sign in with Firebase
          const credential = GoogleAuthProvider.credential(params.id_token);
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
        } else {
          throw new Error('No ID token received from Google');
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
      
      console.log('OAuth failed or incomplete');
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