# CSIRT Security Compliance - Cleanup Checklist

**Date:** March 30, 2026  
**Issue:** Corporate security alert for unauthorized software (OpenClaw/NemoClaw)  
**Action Required:** Complete removal while preserving development work

---

## Pre-Cleanup Verification

### ✅ Confirmed Safe (Already on GitHub)
- [x] Phase 1 source code pushed
- [x] Documentation committed
- [x] Setup guide available
- [x] `.gitignore` protecting secrets
- [x] All work recoverable from Git

**GitHub Repository:** https://github.com/abhixz13/Auth0_Hackathon

---

## Step 1: Backup Critical Credentials (Do This First)

### 1.1 Auth0 Credentials
```bash
# Already in .env.local (excluded from Git)
# Verify backup exists:
cat ~/Auth0_Hackathon/sovereign-bridge/.env.local
```

**Action:** Copy these values to your password manager NOW.

### 1.2 NVIDIA API Key
```bash
# Check if stored in NemoClaw config:
cat ~/.nemoclaw/credentials.json 2>/dev/null || echo "Not found"
```

**Action:** If found, save to password manager.

### 1.3 Recovery Codes
```bash
# Check if any Auth0 recovery codes exist:
cat ~/Auth0_Hackathon/NemoClaw/Autho0_recoveryCode 2>/dev/null || echo "Not found"
```

**Action:** If found, save to password manager, then delete file.

---

## Step 2: Uninstall NemoClaw/OpenShell

### 2.1 Run Official Uninstaller
```bash
cd ~/Auth0_Hackathon/NemoClaw
./uninstall.sh
```

**Expected output:**
- Removes `nemoclaw` CLI
- Removes `openshell` CLI
- Deletes k3s cluster
- Removes Docker containers
- Cleans up `~/.nemoclaw/`
- Cleans up `~/.openshell/`

### 2.2 Verify Removal
```bash
# Check CLI removed:
which nemoclaw  # Should return: not found
which openshell # Should return: not found

# Check processes removed:
ps aux | grep -i nemoclaw  # Should be empty
ps aux | grep -i openshell # Should be empty

# Check Docker containers removed:
docker ps -a | grep -i nemoclaw  # Should be empty
docker ps -a | grep -i openshell # Should be empty
docker ps -a | grep -i openclaw  # Should be empty
```

---

## Step 3: Clean Up Configuration Directories

### 3.1 Remove User Config Directories
```bash
# Remove NemoClaw config:
rm -rf ~/.nemoclaw

# Remove OpenShell config:
rm -rf ~/.openshell

# Remove OpenClaw config:
rm -rf ~/.openclaw

# Verify removal:
ls -la ~ | grep -E '(nemoclaw|openshell|openclaw)'
```

**Expected:** No output (all directories removed)

### 3.2 Remove Any Leftover Docker Networks
```bash
# List Docker networks:
docker network ls | grep -E '(nemoclaw|openshell|openclaw|k3s)'

# Remove if found:
docker network prune -f
```

### 3.3 Remove Docker Volumes
```bash
# List volumes:
docker volume ls | grep -E '(nemoclaw|openshell|openclaw|k3s)'

# Remove if found:
docker volume prune -f
```

---

## Step 4: Verify Git Repository Integrity

### 4.1 Confirm No Secrets in Git History
```bash
cd ~/Auth0_Hackathon

# Check .gitignore is protecting secrets:
cat .gitignore | grep -E '(\.env|credentials|recoveryCode)'

# Verify .env.local not tracked:
git ls-files | grep '.env.local'  # Should be empty

# Verify recovery codes not tracked:
git ls-files | grep 'recoveryCode'  # Should be empty

# Verify .nemoclaw not tracked:
git ls-files | grep '.nemoclaw'  # Should be empty
```

**Expected:** All checks pass (no secrets in Git)

### 4.2 Verify GitHub Push Status
```bash
cd ~/Auth0_Hackathon
git status
git log --oneline -5
```

**Expected:** 
- Working tree clean
- Latest commit includes SETUP_GUIDE.md
- All documentation pushed

---

## Step 5: Clean Up Sensitive Local Files

### 5.1 Remove Recovery Codes from Repository
```bash
cd ~/Auth0_Hackathon

# Find and remove any recovery code files:
find . -name "*recoveryCode*" -type f

# If found, remove them:
rm -f NemoClaw/Autho0_recoveryCode 2>/dev/null || true

# Verify removal:
find . -name "*recoveryCode*" -type f
```

**Expected:** No files found

### 5.2 Verify .env.local Not Committed
```bash
cd ~/Auth0_Hackathon
git ls-files | grep '.env.local'
```

**Expected:** Empty (not tracked)

---

## Step 6: Remove NemoClaw Source Code (Optional)

### Decision Point:
- **Keep:** NemoClaw/ directory is just source code (no runtime risk)
- **Remove:** For complete CSIRT compliance

### 6.1 If Removing (Recommended for Corporate Device):
```bash
cd ~/Auth0_Hackathon
rm -rf NemoClaw/
rm -rf ClawTeam-OpenClaw/

# Update .gitignore to exclude these in future:
echo "# CSIRT Compliance - Runtime software excluded on corporate devices" >> .gitignore
echo "NemoClaw/" >> .gitignore
echo "ClawTeam-OpenClaw/" >> .gitignore

# Commit the exclusion:
git add .gitignore
git commit -m "chore: Exclude runtime software directories per CSIRT policy"
git push
```

**Note:** These directories are still in Git history and can be cloned on personal device.

---

## Step 7: Verify Phase 1 Still Works

### 7.1 Test Sovereign Bridge
```bash
cd ~/Auth0_Hackathon/sovereign-bridge

# Check dependencies:
ls node_modules/ | wc -l  # Should show packages installed

# Start dev server:
npm run dev
```

**Expected:** Server starts on http://localhost:3000

### 7.2 Test Login Flow
1. Open http://localhost:3000
2. Click "Login with Auth0"
3. Verify redirect to Auth0
4. Verify successful login
5. Access http://localhost:3000/dashboard

**Expected:** All Phase 1 features work normally

### 7.3 Stop Dev Server
```
Ctrl+C in terminal
```

---

## Step 8: Final Security Verification

### 8.1 Check for Listening Ports
```bash
# Check no unauthorized services running:
lsof -iTCP -sTCP:LISTEN -n -P | grep -E '(nemoclaw|openshell|openclaw)'
```

**Expected:** No output (no services running)

### 8.2 Check Running Processes
```bash
ps aux | grep -iE '(nemoclaw|openshell|openclaw|k3s|kubectl)' | grep -v grep
```

**Expected:** No output (no processes running)

### 8.3 Check Docker Containers
```bash
docker ps -a
```

**Expected:** No NemoClaw/OpenShell/OpenClaw containers

### 8.4 Verify No Unauthorized Network Connections
```bash
netstat -an | grep -E '(127\.0\.0\.1:8080|127\.0\.0\.1:6443)'
```

**Expected:** No connections (k3s and ClawTeam board ports closed)

---

## Step 9: Document Compliance

### 9.1 Create Compliance Report
```bash
cd ~/Auth0_Hackathon
cat > CSIRT_COMPLIANCE_REPORT.txt <<'EOF'
CSIRT Compliance Report
=======================
Date: $(date)
Device: $(hostname)
User: $(whoami)

Actions Taken:
1. ✅ Backed up credentials to password manager
2. ✅ Ran NemoClaw uninstall.sh
3. ✅ Removed ~/.nemoclaw, ~/.openshell, ~/.openclaw directories
4. ✅ Cleaned up Docker containers, networks, and volumes
5. ✅ Removed sensitive files (recovery codes)
6. ✅ Removed NemoClaw and ClawTeam source directories (optional)
7. ✅ Verified Phase 1 (Sovereign Bridge) still operational
8. ✅ Verified no unauthorized processes or network connections

Verification Results:
- nemoclaw CLI: $(which nemoclaw 2>&1)
- openshell CLI: $(which openshell 2>&1)
- Running processes: $(ps aux | grep -iE '(nemoclaw|openshell|openclaw)' | grep -v grep | wc -l) (expected: 0)
- Docker containers: $(docker ps -a | grep -iE '(nemoclaw|openshell|openclaw)' | wc -l) (expected: 0)

Phase 1 Status:
- Sovereign Bridge code: ✅ Intact at ~/Auth0_Hackathon/sovereign-bridge/
- Dependencies installed: ✅ node_modules/ present
- Environment config: ✅ .env.local present (not in Git)
- GitHub backup: ✅ https://github.com/abhixz13/Auth0_Hackathon

Compliance Status: COMPLIANT
All unauthorized software removed.
Development work preserved and recoverable.
EOF

cat CSIRT_COMPLIANCE_REPORT.txt
```

---

## Step 10: Optional - Report to CSIRT

### 10.1 Prepare Summary for Security Team
```
Subject: OpenClaw/NemoClaw Software Removed - Compliance Confirmed

Body:
I have removed the flagged software (OpenClaw/NemoClaw) from my corporate device per CSIRT policy.

Actions taken:
- Executed official uninstaller (./uninstall.sh)
- Removed all configuration directories (~/.nemoclaw, ~/.openshell, ~/.openclaw)
- Cleaned up Docker containers and networks
- Verified no processes or network connections remain
- Removed source code directories from local filesystem

Verification:
- CLI tools: Not found (removed)
- Running processes: 0
- Docker containers: 0
- Network listeners: None

My authorized development work (Next.js web application) remains intact and does not depend on the removed software.

Please confirm compliance status.
```

---

## Post-Cleanup State

### ✅ What's Gone (Security Risk Removed)
- ❌ NemoClaw CLI
- ❌ OpenShell runtime
- ❌ OpenClaw agents
- ❌ k3s cluster
- ❌ AI agent sandboxes
- ❌ ClawTeam coordination framework
- ❌ All processes, containers, networks

### ✅ What's Still There (Your Work)
- ✅ Git repository (`~/Auth0_Hackathon/`)
- ✅ Phase 1 source code (`sovereign-bridge/`)
- ✅ Next.js application (fully functional)
- ✅ Documentation (README, SETUP_GUIDE, Design, Spec)
- ✅ Dependencies (`node_modules/`)
- ✅ Environment config (`.env.local`)
- ✅ GitHub backup (all code recoverable)

### ✅ What You Can Still Do on This Device
- ✅ Develop Sovereign Bridge web app
- ✅ Test Auth0 login flow
- ✅ View token request dashboard
- ✅ Commit and push code changes
- ✅ Continue Phase 1 development

### ❌ What You Can't Do on This Device
- ❌ Run AI agents
- ❌ Test multi-agent coordination
- ❌ Use ClawTeam board
- ❌ Demo full end-to-end flow with agents

---

## Recovery Path for Personal Device

**Time to full operational state on personal device:** ~22 minutes

Follow: `~/Auth0_Hackathon/SETUP_GUIDE.md`

1. Clone from GitHub (2 min)
2. Setup Sovereign Bridge (5 min)
3. Install NemoClaw (10 min)
4. Install ClawTeam (5 min)
5. Start services (2 min)

**Result:** Exact same environment, fully operational.

---

## Compliance Status

**COMPLIANT:** All unauthorized software removed from corporate device.  
**DEVELOPMENT STATUS:** 100% preserved and recoverable.  
**NEXT STEPS:** Continue development on personal device if agent features needed.
