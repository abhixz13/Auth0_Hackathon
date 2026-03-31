// app/api/auth/revoke/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAuth0 } from '@/lib/auth0';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { connection } = body;

    if (!connection) {
      return NextResponse.json(
        { error: 'Missing required field: connection' },
        { status: 400 }
      );
    }

    const auth0 = getAuth0();

    // Verify active session
    const session = await auth0.getSession();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized - no active session' },
        { status: 401 }
      );
    }

    // For demo: simulate revocation
    // In production, this would call Auth0 Management API:
    // DELETE /api/v2/users/{id}/identities/{provider}/{user_id}
    
    console.log(`[revoke] Simulated revocation for connection: ${connection}, user: ${session.user.sub}`);

    return NextResponse.json({
      success: true,
      message: `Successfully revoked access to ${connection}`,
      connection,
      user: session.user.email || session.user.sub,
    });
  } catch (error: any) {
    console.error('[revoke] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Revocation failed' },
      { status: 500 }
    );
  }
}
