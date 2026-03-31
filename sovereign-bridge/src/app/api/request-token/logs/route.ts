// app/api/request-token/logs/route.ts
import { NextResponse } from 'next/server';
import { tokenLogs } from '../route';

export async function GET() {
  // Update status of expired tokens
  const now = Date.now();
  tokenLogs.forEach(log => {
    if (log.status === 'issued' && log.expires_at < now) {
      log.status = 'expired';
    }
  });

  return NextResponse.json(tokenLogs);
}
