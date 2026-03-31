// app/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { Shield, Clock, AlertCircle, CheckCircle } from 'lucide-react';

interface TokenLog {
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

export default function Dashboard() {
  const [logs, setLogs] = useState<TokenLog[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check user session
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        setUser(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    // Poll logs every second
    const interval = setInterval(() => {
      fetch('/api/request-token/logs')
        .then(res => res.json())
        .then(setLogs)
        .catch(console.error);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const revokeConnection = async (connection: string) => {
    if (!confirm(`Revoke all access to ${connection}? This will disconnect your account.`)) {
      return;
    }

    try {
      const res = await fetch('/api/auth/revoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connection }),
      });

      const data = await res.json();
      
      if (res.ok) {
        alert(`✓ ${data.message}`);
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      alert('Revocation failed');
    }
  };

  const formatTimeRemaining = (expiresAt: number) => {
    const remaining = Math.max(0, Math.round((expiresAt - Date.now()) / 1000));
    if (remaining === 0) return 'Expired';
    if (remaining < 60) return `${remaining}s`;
    return `${Math.floor(remaining / 60)}m ${remaining % 60}s`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <Shield className="w-16 h-16 text-green-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold mb-4">Sovereign Bridge</h1>
          <p className="text-gray-400 mb-8">
            Human-in-the-loop identity gateway for AI agents
          </p>
          <a
            href="/api/auth/login"
            className="inline-block px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition"
          >
            Login to Continue
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Shield className="w-10 h-10 text-green-500" />
              Sovereign Bridge Dashboard
            </h1>
            <p className="text-gray-400">
              Zero-standing-privilege identity gateway • Logged in as <span className="text-green-400">{user.email || user.name}</span>
            </p>
          </div>
          <a
            href="/api/auth/logout"
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-sm rounded-lg transition"
          >
            Logout
          </a>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Live Token Requests */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <Clock className="w-6 h-6 text-green-400" />
              Live Token Requests
              <span className="ml-auto text-sm text-gray-500">{logs.length} total</span>
            </h2>
            
            <div className="space-y-3 max-h-[600px] overflow-auto">
              {logs.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No token requests yet</p>
                  <p className="text-sm mt-2">Agents will appear here when they request access</p>
                </div>
              ) : (
                logs.map(log => (
                  <div
                    key={log.id}
                    className={`p-4 rounded-lg border ${
                      log.status === 'expired'
                        ? 'bg-gray-800 border-gray-700 opacity-60'
                        : 'bg-gray-900 border-green-500/30'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="font-mono text-sm text-green-400">{log.agent_id}</span>
                        <span className="text-gray-500 text-xs ml-2">• {log.team}</span>
                      </div>
                      {log.status === 'issued' ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : (
                        <span className="text-xs text-gray-500">Expired</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-300 mb-2">{log.reason}</p>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-500">
                        Service: <span className="text-green-400">{log.service}</span>
                      </span>
                      <span className={log.status === 'expired' ? 'text-red-400' : 'text-green-400'}>
                        {formatTimeRemaining(log.expires_at)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* ClawTeam Board Proxy */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              ClawTeam Swarm Board
              <span className="text-xs bg-blue-600 px-2 py-1 rounded">localhost:8080</span>
            </h2>
            <iframe
              src="http://localhost:8080"
              className="w-full h-[600px] border-2 border-gray-700 rounded-xl bg-white"
              title="ClawTeam Board"
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-gray-900 rounded-xl border border-gray-800 p-6">
          <h3 className="text-xl font-semibold mb-4">Connection Management</h3>
          <div className="flex gap-4">
            <button
              onClick={() => revokeConnection('google-oauth2')}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition font-semibold"
            >
              Revoke Google Access
            </button>
            <button
              onClick={() => revokeConnection('github')}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition font-semibold"
            >
              Revoke GitHub Access
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-3">
            Revoke connections when you no longer want agents to access these services
          </p>
        </div>
      </div>
    </div>
  );
}
