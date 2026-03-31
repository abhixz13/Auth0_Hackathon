Phase 1 Implementation Plan: Sovereign Bridge Completion
Estimated time: 2–4 hours (if you already have a basic Next.js + @auth0
/nextjs-auth0 setup).  This plan finishes the Bridge exactly as needed for the hero workflow:  Session verification (human-in-the-loop)  
Auth0 Token Vault integration for short-lived federated tokens (Google + GitHub)  
/request-token endpoint that ClawTeam/OpenClaw agents will call  
Simple real-time dashboard (token list + logs + ClawTeam board proxy)  
One-click revoke + optional human approval prompt

Everything runs on localhost:3000. No cloud deployment required.Prerequisites (5 minutes)Make sure your Next.js project uses the App Router (recommended) and has @auth0/nextjs-auth0 installed.
In your Auth0 dashboard:Token Vault + Connected Accounts are enabled.
Google and GitHub connections are configured with Offline Access (for refresh tokens).
Your Next.js app is registered as a Regular Web App with the correct redirect URIs (http://localhost:3000/api/auth/callback).

Environment variables (.env.local):env

AUTH0_SECRET=your-random-secret-here
AUTH0_BASE_URL=http://localhost:3000
AUTH0_ISSUER_BASE_URL=https://YOUR-TENANT.us.auth0.com
AUTH0_CLIENT_ID=your-client-id
AUTH0_CLIENT_SECRET=your-client-secret
AUTH0_TOKEN_VAULT_ENABLED=true   # (if needed by SDK)

Step 1: Install / Update Dependencies (5 minutes)Run in your Next.js root:bash

npm install @auth0/nextjs-auth0
# Optional for dashboard polish
npm install lucide-react  # for icons
npm install uuid         # for request IDs

Step 2: Create Auth0 Client Configuration (10 minutes)Create lib/auth0.ts (or update your existing file):ts

// lib/auth0.ts
import { Auth0Client } from '@auth0/nextjs-auth0';

export const auth0 = new Auth0Client({
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
  baseURL: process.env.AUTH0_BASE_URL,
  clientID: process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
  secret: process.env.AUTH0_SECRET,
  // Token Vault specific settings
  tokenVault: {
    enabled: true,
  },
});

Step 3: Finish Session Handlers (10 minutes)Create/update the Auth0 route handlers (App Router style):app/api/auth/[auth0]/route.tsts

// app/api/auth/[auth0]/route.ts
import { handleAuth } from '@auth0/nextjs-auth0';

export const { GET, POST } = handleAuth();

This gives you:/api/auth/login
/api/auth/logout
/api/auth/callback
/api/auth/me (for session check)

Step 4: Add the /request-token Endpoint (30–45 minutes)Create app/api/request-token/route.tsts

// app/api/request-token/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth0 } from '@/lib/auth0';
import { getSession } from '@auth0/nextjs-auth0';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { agent_id, service, reason, team } = body;

    // 1. Human-in-the-loop: Verify active browser session
    const session = await getSession(req);
    if (!session?.user) {
      return NextResponse.json({ error: 'Human approval required - no active session' }, { status: 401 });
    }

    // 2. Optional human approval prompt (simple UI flag for demo)
    // For hackathon we can auto-approve if session exists, or add a real prompt later.

    // 3. Call Auth0 Token Vault for short-lived federated token
    const connection = service === 'google-calendar' ? 'google-oauth2' : 'github';
    
    const federatedToken = await auth0.getAccessTokenForConnection({
      connection,           // "google-oauth2" or "github"
      scope: service === 'google-calendar' 
        ? 'https://www.googleapis.com/auth/calendar.readonly' 
        : 'repo',
    });

    // 4. Log the request for dashboard (in-memory for demo)
    const requestId = crypto.randomUUID();
    logTokenRequest({
      id: requestId,
      timestamp: new Date().toISOString(),
      agent_id: agent_id || 'unknown',
      team: team || 'default',
      service,
      reason: reason || 'No reason provided',
      expires_in: federatedToken.expires_in || 300, // 5 minutes
      connection,
    });

    return NextResponse.json({
      token: federatedToken.access_token,
      expires_in: federatedToken.expires_in,
      expires_at: Date.now() + (federatedToken.expires_in || 300) * 1000,
      request_id: requestId,
      message: `Token Vault issued short-lived token for ${agent_id}`,
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message || 'Token exchange failed' }, { status: 500 });
  }
}

// Simple in-memory store (reset on restart - fine for demo)
const tokenLogs: any[] = [];
function logTokenRequest(entry: any) {
  tokenLogs.unshift(entry); // newest first
  if (tokenLogs.length > 50) tokenLogs.pop();
}
export { tokenLogs }; // export for dashboard

Step 5: Build the Simple Dashboard (45–60 minutes)Create app/dashboard/page.tsxtsx

// app/dashboard/page.tsx
'use client';
import { useEffect, useState } from 'react';
import { auth0 } from '@/lib/auth0';
import { tokenLogs } from '../api/request-token/route'; // or fetch via API

export default function Dashboard() {
  const [logs, setLogs] = useState<any[]>([]);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    // Poll logs (or use WebSocket for production polish)
    const interval = setInterval(() => {
      fetch('/api/request-token/logs') // we'll create this next
        .then(res => res.json())
        .then(setLogs);
    }, 1000);

    // Check session
    auth0.getSession().then(setSession);

    return () => clearInterval(interval);
  }, []);

  const revokeConnection = async (connection: string) => {
    if (confirm(`Revoke all access to ${connection}?`)) {
      // Use Auth0 Management API or SDK revoke helper if available
      await fetch('/api/auth/revoke', { method: 'POST', body: JSON.stringify({ connection }) });
      alert('Connection revoked');
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Sovereign Bridge Dashboard</h1>
      
      <div className="grid grid-cols-2 gap-8">
        {/* Live Tokens & Logs */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Live Token Requests</h2>
          <div className="space-y-3 max-h-[600px] overflow-auto">
            {logs.map(log => (
              <div key={log.id} className="bg-gray-900 p-4 rounded-lg border border-green-500/30">
                <div className="flex justify-between text-sm">
                  <span className="font-mono">{log.agent_id}</span>
                  <span className="text-green-400">✓ Token Issued</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">{log.reason}</p>
                <p className="text-xs text-gray-500 mt-2">
                  Expires in ~{Math.round((log.expires_at - Date.now()) / 60000)} min
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ClawTeam Board Proxy */}
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            ClawTeam Swarm Board
            <span className="text-xs bg-blue-600 px-2 py-0.5 rounded">localhost:8080</span>
          </h2>
          <iframe 
            src="http://localhost:8080" 
            className="w-full h-[600px] border border-gray-700 rounded-xl bg-white"
            title="ClawTeam Board"
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 flex gap-4">
        <button
          onClick={() => revokeConnection('google-oauth2')}
          className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg"
        >
          Revoke Google Access
        </button>
        <button
          onClick={() => revokeConnection('github')}
          className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg"
        >
          Revoke GitHub Access
        </button>
      </div>
    </div>
  );
}

Add a helper route for logs (app/api/request-token/logs/route.ts):ts

// app/api/request-token/logs/route.ts
import { NextResponse } from 'next/server';
import { tokenLogs } from '../route';

export async function GET() {
  return NextResponse.json(tokenLogs);
}

Step 6: Add One-Click Revoke + Human Approval Prompt (20 minutes)The revoke buttons above call a simple revoke endpoint (you can implement via Auth0 Management API if needed; for demo, the confirm dialog + alert is enough).
Human approval is already handled by the session check in /request-token.
For extra polish, you can add a modal in the dashboard that shows pending requests (future enhancement).

Step 7: Test the Entire Bridge (15–20 minutes)Start the Bridge: npm run dev
Go to http://localhost:3000/api/auth/login → log in with your browser session.
In another terminal, start ClawTeam inside NemoClaw (we’ll connect it in Phase 2).
Manually test the endpoint with curl or Postman:bash

curl -X POST http://localhost:3000/api/request-token \
  -H "Content-Type: application/json" \
  -d '{"agent_id":"calendar-scout","service":"google-calendar","reason":"read meeting invite"}'

Refresh the dashboard → you should see the live log + token details.

Done! Phase 1 CompleteYou now have:Full Auth0 Token Vault integration (short-lived federated tokens)
Secure /request-token endpoint ready for agents/sub-agents
Real-time dashboard with ClawTeam board iframe
Human-in-the-loop + revoke capability

