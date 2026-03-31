# Complete Setup Guide for New Device / Recovery / Demo Runs

This guide covers **three scenarios** with the same core steps:
1. Setting up on a **new/personal device**
2. **Recovering** after uninstall (CSIRT compliance)
3. **Running a demo** 5 days later (or any time after restart)

---

## Prerequisites

### Required Software
- **macOS** (or Linux with Docker)
- **Docker Desktop** (running)
- **Node.js 20+** and npm
- **Python 3.11+**
- **Git**
- **Internet connection**

### Required Credentials (Have These Ready)
1. **Auth0 credentials** (from https://manage.auth0.com):
   - Tenant URL
   - Client ID
   - Client Secret
   - Generate new secret with: `openssl rand -hex 32`
2. **NVIDIA API Key** (from https://build.nvidia.com/settings/api-keys)
3. **GitHub personal access token** (optional, for agent features)

---

## Part 1: Clone Repository (Do Once Per Device)

### Time: 2 minutes

```bash
cd ~
git clone https://github.com/abhixz13/Auth0_Hackathon.git
cd Auth0_Hackathon
```

**Result:** You have all source code locally.

---

## Part 2: Setup Sovereign Bridge (Do Once Per Device)

### Time: 5 minutes

### 2.1 Install Dependencies
```bash
cd sovereign-bridge
npm install
```

### 2.2 Configure Environment Variables
```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:
```bash
nano .env.local
```

Paste:
```
AUTH0_ISSUER_BASE_URL=https://YOUR-TENANT.us.auth0.com
AUTH0_CLIENT_ID=your-client-id
AUTH0_CLIENT_SECRET=your-client-secret
AUTH0_BASE_URL=http://localhost:3000
AUTH0_SECRET=<output-of-openssl-rand-hex-32>
```

Save (Ctrl+O, Enter, Ctrl+X).

### 2.3 Verify Build
```bash
npm run build
```

**Expected:** ✓ Compiled successfully

### 2.4 Start Bridge (Every Time You Demo)
```bash
npm run dev
```

**Expected:** 
```
▲ Next.js 16.2.1
- Local: http://localhost:3000
✓ Ready
```

**Keep this terminal open.**

**Test:** Open browser → http://localhost:3000 → Click "Login with Auth0"

---

## Part 3: Setup NemoClaw Sandbox (Do Once Per Device)

### Time: 10-15 minutes

### 3.1 Verify Docker is Running
```bash
docker ps
```

**Expected:** Should list containers (or empty table, but no error)

### 3.2 Install NemoClaw
```bash
cd ~/Auth0_Hackathon/NemoClaw
./install.sh
```

**Follow prompts:**
- Accept defaults for most questions
- When asked for NVIDIA API key: paste yours
- Installation will download OpenShell (~5 min)

### 3.3 Create Sandbox
```bash
nemoclaw onboard
```

**Follow wizard:**
1. **Inference provider:** Select NVIDIA (option 1 or 2)
2. **Model:** Use default (or pick your preferred model)
3. **Sandbox name:** Type `my-assistant` (or your preferred name)
4. **Network policies:** Accept suggested (PyPI, npm) - press `Y`

**This takes 5-10 minutes** (downloads Docker images, creates k3s cluster, etc.)

**Expected final output:**
```
✓ Sandbox 'my-assistant' is ready
Run: nemoclaw my-assistant connect
```

---

## Part 4: Install ClawTeam in Sandbox (Do Once Per Sandbox)

### Time: 5 minutes

### 4.1 Transfer ClawTeam to Sandbox
```bash
cd ~/Auth0_Hackathon
tar czf - ClawTeam-OpenClaw | \
  ssh -F <(openshell sandbox ssh-config my-assistant) \
  openshell-my-assistant 'cd ~ && tar xzf -'
```

**Ignore warnings** about `LIBARCHIVE.xattr` - they're harmless.

### 4.2 Connect to Sandbox
```bash
nemoclaw my-assistant connect
```

**You're now inside the sandbox** (prompt shows `sandbox@my-assistant`).

### 4.3 Install ClawTeam (Inside Sandbox)
```bash
cd ~/ClawTeam-OpenClaw
rm -rf .venv
python3 -m venv .venv
.venv/bin/python3 -m pip install --upgrade pip
.venv/bin/python3 -m pip install -e .
```

**Expected:** `Successfully installed clawteam-0.2.0+openclaw1`

### 4.4 Integrate with OpenClaw (Inside Sandbox)
```bash
# Copy skill definition
mkdir -p ~/.openclaw/workspace/skills/clawteam
cp skills/openclaw/SKILL.md ~/.openclaw/workspace/skills/clawteam/SKILL.md

# Configure exec approvals
cat > /sandbox/.openclaw-data/exec-approvals.json <<'EOF'
{
  "defaults": {
    "security": "allowlist"
  },
  "allowlist": [
    {
      "agent": "*",
      "tool": "*/clawteam"
    }
  ]
}
EOF

# Verify
cat /sandbox/.openclaw-data/exec-approvals.json
ls -la ~/.openclaw/workspace/skills/clawteam/SKILL.md
```

**Expected:** JSON displayed + SKILL.md exists

### 4.5 Exit Sandbox
```bash
exit
```

**You're back on your host machine.**

---

## Part 5: Daily Demo / Testing (Every Time You Run)

### Time: 2 minutes

### 5.1 Ensure Docker Desktop is Running
- Open Docker Desktop app
- Wait for green "Engine running" indicator

### 5.2 Start Sovereign Bridge (Terminal 1)
```bash
cd ~/Auth0_Hackathon/sovereign-bridge
npm run dev
```

**Expected:** Server on http://localhost:3000  
**Action:** Open browser → login → go to /dashboard

### 5.3 Start ClawTeam Board (Terminal 2 - Optional)
```bash
nemoclaw my-assistant connect
cd ~/ClawTeam-OpenClaw
.venv/bin/python3 -m clawteam board serve --port 8080
```

**Expected:** Board at http://localhost:8080  
**Action:** Dashboard iframe will show ClawTeam activity

### 5.4 Verify System Health
```bash
# In Terminal 3 (on host)
nemoclaw status
openshell status
```

**Expected:** 
- Sandbox: `my-assistant` - Status: Ready
- Gateway: nemoclaw - Status: Connected

---

## Scenario-Specific Instructions

### Scenario A: Fresh Device (First Time Ever)
**Run in order:**
1. Part 1 (Clone) - Once
2. Part 2 (Sovereign Bridge) - Once
3. Part 3 (NemoClaw) - Once
4. Part 4 (ClawTeam) - Once
5. Part 5 (Daily) - Every demo

**Total first-time:** ~30-35 minutes  
**Subsequent demos:** 2 minutes (Part 5 only)

---

### Scenario B: After CSIRT Uninstall
**Assumptions:**
- ✅ Git repo still on disk
- ✅ `sovereign-bridge/node_modules/` still there
- ✅ `.env.local` backed up (or recreate)
- ❌ NemoClaw/OpenShell removed

**Run in order:**
1. Part 3 (NemoClaw) - Reinstall
2. Part 4 (ClawTeam) - Reinstall in new sandbox
3. Part 5 (Daily) - Start services

**Total:** ~15-20 minutes  
**Part 2 (Sovereign Bridge) NOT needed** - already configured

---

### Scenario C: Demo 5 Days Later (Nothing Uninstalled)
**Assumptions:**
- ✅ Everything was set up before
- ✅ Computer rebooted / Docker restarted
- ✅ Sandbox still exists

**Run:**
- Part 5 only (start services)

**Total:** 2 minutes

**If sandbox was destroyed:**
- Run Parts 3 → 4 → 5 (~20 min)

---

## Quick Verification Checklist

### Before Demo
- [ ] Docker Desktop running
- [ ] `npm run dev` in sovereign-bridge/ (port 3000)
- [ ] Logged into http://localhost:3000 in browser
- [ ] `nemoclaw status` shows sandbox Ready
- [ ] (Optional) ClawTeam board on port 8080

### During Demo
- [ ] Open http://localhost:3000/dashboard
- [ ] Test token request with curl (or via agent)
- [ ] Watch logs appear in dashboard
- [ ] Show expiry countdown
- [ ] Test revoke button

---

## Troubleshooting

### "Port 3000 already in use"
```bash
lsof -ti:3000 | xargs kill -9
npm run dev
```

### "Sandbox not found"
```bash
nemoclaw list  # Check if sandbox exists
nemoclaw onboard  # Recreate if needed
```

### "Docker daemon not running"
- Open Docker Desktop
- Wait for green status
- Retry command

### "NVIDIA API key invalid"
```bash
nemoclaw my-assistant connect
# Inside sandbox:
nano ~/.nemoclaw/credentials.json
# Update NVIDIA_API_KEY
```

---

## Time Investment Summary

| Activity | First Device | After Uninstall | Daily Demo |
|----------|-------------|-----------------|------------|
| Clone repo | 2 min | N/A (already have) | N/A |
| Sovereign Bridge | 5 min | 0 min (preserved) | 0 min |
| NemoClaw install | 10 min | 10 min | 0 min |
| ClawTeam install | 5 min | 5 min | 0 min |
| Start services | 2 min | 2 min | 2 min |
| **TOTAL** | **~24 min** | **~17 min** | **~2 min** |

---

## What NEVER Needs Redoing

✅ **Auth0 configuration** (in cloud)  
✅ **Git repository** (on GitHub)  
✅ **Your understanding** (documented in code/README)  
✅ **Phase 1 implementation** (complete, tested, secure)  

---

## Critical Files to Keep Safe

If you need to backup before uninstall:

```bash
# Auth0 credentials
cp sovereign-bridge/.env.local ~/Desktop/env-backup.txt

# NVIDIA API key (if not in Auth0_Hackathon repo)
cp ~/.nemoclaw/credentials.json ~/Desktop/nemoclaw-creds-backup.json 2>/dev/null || true
```

**Store these securely** (password manager), **not in Git**.

---

## Confirmation: Same Steps Every Time?

### ✅ **YES for Demo Runs**
After initial setup (Parts 1-4), **Part 5 is always the same:**
1. Start Docker Desktop
2. `npm run dev` in sovereign-bridge
3. Login to dashboard
4. Demo is ready

### ✅ **YES for Recovery**
Parts 3 & 4 are **identical** whether:
- New device
- After uninstall
- Sandbox got corrupted
- Need to rebuild

The **automation is repeatable** - same commands, same results.

---

**Total preparation time from zero:**
- **First device:** 30 minutes
- **Daily demo:** 2 minutes
- **After uninstall:** 20 minutes

**Your Phase 1 work is permanent and safe.**
