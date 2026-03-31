// app/api/auth/[auth0]/route.ts
import { getAuth0 } from '@/lib/auth0';
import { NextRequest } from 'next/server';

export function GET(request: NextRequest) {
  const auth0 = getAuth0();
  return auth0.middleware(request);
}
