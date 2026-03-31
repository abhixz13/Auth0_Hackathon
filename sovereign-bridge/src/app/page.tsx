// app/page.tsx
export default function Home() {
  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
      <div className="text-center max-w-2xl px-6">
        <div className="mb-8">
          <div className="inline-block p-4 bg-green-500/10 rounded-full mb-6">
            <svg className="w-16 h-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h1 className="text-5xl font-bold mb-4">Sovereign Bridge</h1>
          <p className="text-xl text-gray-400 mb-8">
            Zero-Standing-Privilege Identity Gateway for AI Agents
          </p>
        </div>

        <div className="bg-gray-900 rounded-xl border border-gray-800 p-8 mb-8 text-left">
          <h2 className="text-2xl font-semibold mb-4">How It Works</h2>
          <ul className="space-y-3 text-gray-300">
            <li className="flex items-start gap-3">
              <span className="text-green-500 mt-1">✓</span>
              <span><strong>Human-in-the-Loop:</strong> Every token request requires your active browser session</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-500 mt-1">✓</span>
              <span><strong>Short-Lived Tokens:</strong> Auth0 Token Vault issues 5-minute federated tokens</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-500 mt-1">✓</span>
              <span><strong>Air-Gapped AI:</strong> Agents run in NemoClaw sandbox with zero outbound access by default</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-500 mt-1">✓</span>
              <span><strong>Real-Time Monitoring:</strong> Live dashboard shows every token request and expiry</span>
            </li>
          </ul>
        </div>

        <div className="flex gap-4 justify-center">
          <a
            href="/api/auth/login"
            className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition text-lg"
          >
            Login with Auth0
          </a>
          <a
            href="/dashboard"
            className="px-8 py-4 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-lg transition text-lg"
          >
            View Dashboard
          </a>
        </div>

        <p className="text-sm text-gray-500 mt-8">
          Built for Devpost AI Hackathon • Powered by Auth0 Token Vault + NemoClaw + ClawTeam
        </p>
      </div>
    </div>
  );
}
