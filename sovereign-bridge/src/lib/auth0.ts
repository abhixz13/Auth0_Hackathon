// lib/auth0.ts
import { Auth0Client } from '@auth0/nextjs-auth0/server';

let _auth0: Auth0Client | null = null;

export function getAuth0(): Auth0Client {
  if (_auth0) return _auth0;

  if (!process.env.AUTH0_SECRET) throw new Error('AUTH0_SECRET is required');
  if (!process.env.AUTH0_ISSUER_BASE_URL) throw new Error('AUTH0_ISSUER_BASE_URL is required');
  if (!process.env.AUTH0_BASE_URL) throw new Error('AUTH0_BASE_URL is required');
  if (!process.env.AUTH0_CLIENT_ID) throw new Error('AUTH0_CLIENT_ID is required');
  if (!process.env.AUTH0_CLIENT_SECRET) throw new Error('AUTH0_CLIENT_SECRET is required');

  _auth0 = new Auth0Client({
    secret: process.env.AUTH0_SECRET,
    domain: process.env.AUTH0_ISSUER_BASE_URL.replace('https://', ''),
    appBaseUrl: process.env.AUTH0_BASE_URL,
    clientId: process.env.AUTH0_CLIENT_ID,
    clientSecret: process.env.AUTH0_CLIENT_SECRET,
    
    // Session configuration
    session: {
      rolling: true,
      inactivityDuration: 24 * 60 * 60, // 24 hours
      absoluteDuration: 7 * 24 * 60 * 60, // 7 days
    },
    
    // Routes
    routes: {
      callback: '/api/auth/callback',
      logout: '/api/auth/logout',
    },
    
    signInReturnToPath: '/dashboard',
  });

  return _auth0;
}


