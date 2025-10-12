import { Platform } from 'react-native';

/**
 * Get the proper development URL for Metro bundler
 */
export function getMetroURL(): string {
  if (Platform.OS === 'web') {
    return typeof window !== 'undefined' ? window.location.origin : 'http://localhost:8081';
  }

  // For mobile development, try to detect the Metro server
  // This is a simplified version - in production you'd use expo-constants
  return 'http://localhost:8081';
}

/**
 * Get proper redirect URI for OAuth flows
 */
export function getOAuthRedirectUri(scheme: string = 'kyoolapp'): string {
  if (Platform.OS === 'web') {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:8081';
    return `${origin}/oauth`;
  }

  // For mobile development, we need to use Expo tunnel URL or localhost
  // Custom schemes like 'kyoolapp://oauth' don't work with Google Web OAuth clients
  // Instead, use AuthSession.makeRedirectUri() which handles tunnel URLs properly
  return 'Use AuthSession.makeRedirectUri() for mobile OAuth';
}

/**
 * Get development server info for debugging
 */
export function getDevServerInfo(): object {
  return {
    platform: Platform.OS,
    metroURL: getMetroURL(),
    oauthRedirectUri: getOAuthRedirectUri(),
    timestamp: new Date().toISOString(),
  };
}

/**
 * Log Metro/development server information
 */
export function logMetroInfo(): void {
  console.log('=== Metro/Development Server Info ===');
  const info = getDevServerInfo();
  Object.entries(info).forEach(([key, value]) => {
    console.log(`${key}:`, value);
  });
  console.log('=====================================');
}