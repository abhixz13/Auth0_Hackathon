// app/api/request-token/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAuth0 } from '@/lib/auth0';
import { v4 as uuidv4 } from 'uuid';

// Token log entry interface
interface TokenLogEntry {
  id: string;
  timestamp: string;
  agent_id: string;
  team: string;
  service: string;
  reason: string;
  expires_in: number;
  expires_at: number;
  connection: string;
  status: 'issued' | 'expired';
}

// Simple in-memory store (reset on restart - fine for demo)
const tokenLogs: TokenLogEntry[] = [];

function logTokenRequest(entry: Omit<TokenLogEntry, 'id' | 'timestamp' | 'status' | 'expires_at'>) {
  const requestId = uuidv4();
  const timestamp = new Date().toISOString();
  const expires_at = Date.now() + entry.expires_in * 1000;
  
  const logEntry: TokenLogEntry = {
    id: requestId,
    timestamp,
    status: 'issued',
    expires_at,
    ...entry,
  };
  
  tokenLogs.unshift(logEntry); // newest first
  if (tokenLogs.length > 50) tokenLogs.pop();
  
  return requestId;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { agent_id, service, reason, team } = body;

    // Validate required fields
    if (!agent_id || !service || !reason) {
      return NextResponse.json(
        { error: 'Missing required fields: agent_id, service, reason' },
        { status: 400 }
      );
    }

    const auth0 = getAuth0();

    // 1. Human-in-the-loop: Verify active browser session
    const session = await auth0.getSession();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Human approval required - no active session. Please log in at /api/auth/login' },
        { status: 401 }
      );
    }

    // 2. Map service to Auth0 connection
    const connectionMap: Record<string, string> = {
      'google-calendar': 'google-oauth2',
      'github': 'github',
      'google': 'google-oauth2',
    };
    
    const connection = connectionMap[service.toLowerCase()] || service;

    // 3. For demo: simulate Token Vault response
    // In production, this would call Auth0 Token Vault API:
    // const tokenVaultResponse = await fetch(`${process.env.AUTH0_ISSUER_BASE_URL}/api/v2/token-vault/exchange`, { ... });
    
    const mockToken = `mock_token_${connection}_${Date.now()}`;
    const expires_in = 300; // 5 minutes

    // 4. Log the request for dashboard
    const requestId = logTokenRequest({
      agent_id: agent_id || 'unknown',
      team: team || 'default',
      service,
      reason: reason || 'No reason provided',
      expires_in,
      connection,
    });

    return NextResponse.json({
      token: mockToken,
      expires_in,
      expires_at: Date.now() + expires_in * 1000,
      request_id: requestId,
      message: `Token Vault issued short-lived token for ${agent_id}`,
      session_user: session.user.email || session.user.sub,
    });
  } catch (error: any) {
    console.error('[request-token] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Token exchange failed' },
      { status: 500 }
    );
  }
}

// Export logs for the logs endpoint
export { tokenLogs };
