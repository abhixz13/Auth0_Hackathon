# Sovereign Bridge - Auth0 Hackathon 2026

Zero-Standing-Privilege Identity Gateway for AI Agent Swarms

## Overview

Sovereign Bridge is a human-in-the-loop identity gateway that enables AI agents to securely access external services (Google Calendar, GitHub, etc.) using **short-lived tokens** from **Auth0 Token Vault**, without ever storing long-lived credentials inside the AI sandbox.

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Browser (Human)                                        │
│  └─ Auth0 Login → Connected Accounts (Google + GitHub) │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│  Sovereign Bridge (Next.js @ localhost:3000)            │
│  ├─ Session Verification (human present?)              │
│  ├─ Token Vault Exchange (5-min federated tokens)      │
│  ├─ Dashboard (live logs, agent activity, revoke)      │
│  └─ /request-token API                                 │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│  NemoClaw Sandbox ("The Cage")                          │
│  └─ OpenClaw + ClawTeam                                │
│     ├─ Leader Agent                                     │
│     ├─ Dynamic Sub-Agents (spawned as needed)          │
│     ├─ Custom Tool: request-ephemeral-token            │
│     └─ Zero outbound access (except approved)          │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│  External Services (Google Calendar, GitHub)            │
│  └─ Accessed ONLY via short-lived tokens from Bridge   │
└─────────────────────────────────────────────────────────┘
```

## Key Features

### 🔒 Zero-Standing-Privilege
- Agents never hold long-lived credentials
- Tokens expire in 5 minutes
- Auth0 Token Vault manages refresh tokens securely

### 👤 Human-in-the-Loop
- Every token request requires active browser session
- Real-time dashboard shows all agent activity
- One-click revoke for any connected service

### 🛡️ Air-Gapped AI
- Agents run in NemoClaw sandbox with default-deny network policy
- Outbound connections require explicit approval
- Multi-layer security: Landlock + seccomp + network namespace

### 🤖 Multi-Agent Coordination
- ClawTeam enables dynamic sub-agent spawning
- Agents collaborate via inboxes and shared task board
- Visible swarm intelligence for demos

## Project Structure

```
AuthO_Hackathon/
├── sovereign-bridge/       # Next.js bridge application (Phase 1 ✅)
│   ├── src/app/
│   │   ├── api/auth/       # Auth0 OAuth handlers
│   │   ├── api/request-token/ # Token endpoint + logs
│   │   └── dashboard/      # Live monitoring UI
│   └── .env.example        # Configuration template
├── NemoClaw/               # NVIDIA OpenShell sandbox runtime
└── ClawTeam-OpenClaw/      # Multi-agent coordination framework
```

## Setup Instructions

### Prerequisites

- Node.js 20+
- Python 3.11+
- Docker Desktop (for NemoClaw)
- Auth0 account with Token Vault enabled

### 1. Configure Auth0

1. Create an Auth0 Regular Web Application
2. Enable Token Vault in your tenant
3. Configure Connected Accounts:
   - Google OAuth (with Calendar scope + offline access)
   - GitHub OAuth (with repo scope + offline access)
4. Set callback URL: `http://localhost:3000/api/auth/callback`

### 2. Setup Sovereign Bridge

```bash
cd sovereign-bridge
npm install
cp .env.example .env.local
```

Edit `.env.local` with your Auth0 credentials:
- `AUTH0_ISSUER_BASE_URL` - Your Auth0 tenant URL
- `AUTH0_CLIENT_ID` - Application client ID
- `AUTH0_CLIENT_SECRET` - Application client secret
- `AUTH0_SECRET` - Generate with `openssl rand -hex 32`

Start the bridge:
```bash
npm run dev
```

Visit `http://localhost:3000` and login.

### 3. Setup NemoClaw Sandbox

```bash
cd NemoClaw
./install.sh  # Follow prompts
nemoclaw onboard  # Create sandbox
```

### 4. Install ClawTeam (inside sandbox)

Transfer ClawTeam to sandbox and install:
```bash
# On host
cd /Users/YOUR-USER/AuthO_Hackathon
tar czf - ClawTeam-OpenClaw | ssh -F <(openshell sandbox ssh-config my-assistant) openshell-my-assistant 'cd ~ && tar xzf -'

# Inside sandbox (nemoclaw my-assistant connect)
cd ~/ClawTeam-OpenClaw
python3 -m venv .venv
source .venv/bin/activate
python3 -m pip install -e .
```

Copy ClawTeam skill to OpenClaw:
```bash
mkdir -p ~/.openclaw/workspace/skills/clawteam
cp skills/openclaw/SKILL.md ~/.openclaw/workspace/skills/clawteam/SKILL.md
```

## Usage

### Basic Flow

1. **Human logs in** to Sovereign Bridge at `http://localhost:3000`
2. **Agent requests token** via HTTP POST to `/api/request-token`:
   ```json
   {
     "agent_id": "calendar-scout",
     "service": "google-calendar",
     "reason": "read Q2 planning meeting",
     "team": "pm-squad"
   }
   ```
3. **Bridge validates** active browser session
4. **Token Vault issues** 5-minute federated token
5. **Agent uses token** for external API call
6. **Dashboard shows** request in real-time
7. **Token expires** automatically

### Hero Workflow (Demo)

Multi-agent swarm auto-resolves a product blocker from a meeting invite:

1. **Trigger:** Paste meeting text mentioning a blocker
2. **Leader agent** spawns 4-5 specialized sub-agents via ClawTeam
3. **Calendar Scout** → requests token → reads invite → broadcasts blocker
4. **GitHub Investigator** → requests token → scans repo/issues
5. **Code Analyst** → analyzes locally (no token needed)
6. **Executor** → requests token → creates GitHub issue with solution
7. **Dashboard lights up** with each token request/expiry
8. **GitHub issue appears** with full context and solution

## Security Features

- ✅ Human-in-the-loop on every token request
- ✅ 5-minute token expiry (configurable)
- ✅ Session-based authorization
- ✅ Audit trail for all requests
- ✅ One-click service revocation
- ✅ Air-gapped AI execution environment
- ✅ Network policy enforcement (default-deny egress)
- ✅ No secrets stored in sandbox

## Implementation Status

- ✅ **Phase 1**: Sovereign Bridge (Complete)
  - Auth0 integration
  - Token request endpoint
  - Dashboard UI
  - Mock Token Vault (production TODO)

- ✅ **Phase 2**: ClawTeam Integration (In Progress)
  - ClawTeam installed
  - OpenClaw configuration
  - Custom tool creation (next step)

- 🔲 **Phase 3**: Hero Workflow
  - PM blocker resolution template
  - End-to-end testing
  - Demo video

## Documentation

- [`PHASE1_COMPLETE.md`](./sovereign-bridge/PHASE1_COMPLETE.md) - Phase 1 implementation details
- [`Spec.md`](./sovereign-bridge/Spec.md) - Original implementation plan
- [`Design.md`](./sovereign-bridge/Design.md) - System architecture

## Production TODOs

- [ ] Replace mock Token Vault with real Auth0 API calls
- [ ] Implement actual connection revocation via Auth0 Management API
- [ ] Add persistent storage for logs (Redis/database)
- [ ] Configure production domain and HTTPS
- [ ] Add rate limiting on token endpoint
- [ ] Implement token refresh/rotation strategy

## Tech Stack

- **Frontend/Bridge:** Next.js 16, React 19, Tailwind CSS
- **Auth:** Auth0 (Token Vault, Connected Accounts)
- **AI Runtime:** NVIDIA NemoClaw (OpenShell sandbox)
- **Agent Framework:** OpenClaw + ClawTeam-OpenClaw
- **Deployment:** Local-first (localhost only for hackathon)

## License

See individual component licenses:
- Sovereign Bridge: MIT (this project)
- NemoClaw: Apache 2.0
- ClawTeam-OpenClaw: Check repo license

## Hackathon Submission

Built for **Devpost AI Hackathon 2026**  
**Category:** Auth0 Token Vault Integration  
**Demo:** 3-minute video showing multi-agent swarm with live token requests

---

**Status:** Phase 1 Complete ✅ | Phase 2 In Progress 🔨 | Phase 3 Pending 🔲
