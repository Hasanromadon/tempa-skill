# 🚨 Security Incident Report - Exposed Midtrans API Keys

**Date**: November 30, 2025  
**Severity**: MEDIUM (Sandbox keys only)  
**Status**: ✅ Mitigated in current codebase, ⚠️ Still in git history

---

## 📋 Incident Summary

Midtrans Sandbox API keys were accidentally committed to the repository in **TODO.md** file.

**Exposed Commit**: `a7fef8187b684a8244e986ac17b5497a1cff0010`  
**Date of Exposure**: November 10, 2025 15:18:54 +0700  
**Commit Message**: "feat(payment): Implement payment processing with Midtrans integration"

---

## 🔑 Exposed Credentials

**File**: `TODO.md` (lines 409-410)

```env
MIDTRANS_SERVER_KEY=SB-Mid-server-c2zpenmQQVNAYOVHtxrx0I-S
MIDTRANS_CLIENT_KEY=SB-Mid-client-ZBuTiayOZocEGgLJ
```

**Key Type**: Sandbox (Test Environment)  
**Visibility**: Public git repository history  
**Impact**: Limited to test transactions only (no real money)

---

## ✅ Immediate Actions Taken

1. **Sanitized Current Files** (Commit: `dfa6d5d`)

   - Replaced actual keys with placeholders in TODO.md
   - Added Midtrans section to .env.example with safe placeholders
   - Added security warnings to documentation

2. **Updated .gitignore**

   - Already properly configured to ignore `.env` files

3. **Documentation Updated**
   - TODO.md now has clear warnings
   - .env.example has security comments

---

## ⚠️ Actions Still Required

### 1. **Revoke Exposed Keys** (CRITICAL)

Go to Midtrans Dashboard and revoke these keys:

1. Login to https://dashboard.midtrans.com/
2. Navigate to **Settings** → **Access Keys**
3. Click **"Regenerate"** for both Server Key and Client Key
4. Copy new keys to your local `.env` file (NOT `.env.example`)

**Why**: Even though these are sandbox keys, they can be used for:

- Creating test transactions
- Testing payment flows
- Potentially spamming your sandbox environment

### 2. **Remove from Git History** (OPTIONAL but RECOMMENDED)

⚠️ **WARNING**: This rewrites git history. Coordinate with team members!

**Option A: Using git filter-repo (Recommended)**

```bash
# Install git-filter-repo
pip install git-filter-repo

# Backup your repo first
git clone /path/to/tempa-skill /path/to/tempa-skill-backup

# Remove sensitive data from history
cd tempa-skill
git filter-repo --replace-text <(echo "SB-Mid-server-c2zpenmQQVNAYOVHtxrx0I-S==>***REMOVED***")
git filter-repo --replace-text <(echo "SB-Mid-client-ZBuTiayOZocEGgLJ==>***REMOVED***")

# Force push (after team coordination)
git push origin --force --all
```

**Option B: Using BFG Repo-Cleaner**

```bash
# Download BFG: https://rtyley.github.io/bfg-repo-cleaner/

# Create replacement file
echo "SB-Mid-server-c2zpenmQQVNAYOVHtxrx0I-S==>***REMOVED***" > passwords.txt
echo "SB-Mid-client-ZBuTiayOZocEGgLJ==>***REMOVED***" >> passwords.txt

# Run BFG
java -jar bfg.jar --replace-text passwords.txt tempa-skill.git

# Clean up and force push
cd tempa-skill
git reflog expire --expire=now --all
git gc --prune=now --aggressive
git push origin --force --all
```

**Option C: Accept the Risk**

Since these are **Sandbox keys** (not production), you may choose to:

1. Revoke and regenerate keys
2. Document incident (this file)
3. Improve security practices going forward
4. Accept that old keys remain in history

### 3. **Update Local Environment**

After regenerating keys in Midtrans Dashboard:

```bash
cd tempaskill-be
nano .env  # or use your preferred editor

# Update with NEW keys
MIDTRANS_SERVER_KEY=SB-Mid-server-NEW_KEY_HERE
MIDTRANS_CLIENT_KEY=SB-Mid-client-NEW_KEY_HERE
```

**DO NOT** update `.env.example` with real keys!

---

## 🛡️ Prevention Measures

### Implemented:

1. ✅ **`.gitignore`** properly configured

   - `.env` files are ignored
   - Firebase service account JSON ignored
   - All sensitive patterns covered

2. ✅ **Documentation Guidelines**

   - `.env.example` uses only placeholders
   - Security warnings in comments
   - Clear instructions in setup docs

3. ✅ **Code Review Checklist**
   - Check for hardcoded credentials
   - Verify `.env.example` uses placeholders
   - Review documentation for exposed keys

### Recommended:

1. **Pre-commit Hooks**

   Install `git-secrets`:

   ```bash
   git secrets --install
   git secrets --register-aws  # If using AWS
   git secrets --add 'SB-Mid-[a-z]+-[a-zA-Z0-9]+'  # Midtrans pattern
   ```

2. **GitHub Secret Scanning**

   Already enabled for public repos. Configure alerts:

   - Settings → Security → Code security and analysis
   - Enable "Secret scanning"

3. **Developer Training**

   - Never commit `.env` files
   - Always use `.env.example` with placeholders
   - Review git diff before committing
   - Use `git add -p` for careful staging

---

## 📊 Impact Assessment

### Actual Impact: **LOW**

**Reasons**:

- ✅ Sandbox keys only (no real financial risk)
- ✅ No production keys exposed
- ✅ Detected before production deployment
- ✅ Keys can be easily regenerated
- ✅ No evidence of unauthorized usage

### Potential Impact if Production Keys: **HIGH**

**Could have enabled**:

- Creating fraudulent transactions
- Processing refunds
- Accessing customer payment data
- Financial losses

---

## 📝 Timeline

| Date         | Time  | Event                                      |
| ------------ | ----- | ------------------------------------------ |
| Nov 10, 2025 | 15:18 | Keys committed to TODO.md (commit a7fef81) |
| Nov 10, 2025 | 15:18 | Pushed to GitHub                           |
| Nov 30, 2025 | -     | Incident discovered during security audit  |
| Nov 30, 2025 | -     | Current files sanitized (commit dfa6d5d)   |
| Nov 30, 2025 | -     | This incident report created               |
| **Pending**  | -     | Keys revoked in Midtrans Dashboard         |
| **Pending**  | -     | Git history cleaned (optional)             |

---

## ✅ Checklist

- [x] Remove keys from current codebase
- [x] Update .env.example with safe placeholders
- [x] Document incident
- [x] Add security warnings to docs
- [ ] **Revoke keys in Midtrans Dashboard** (CRITICAL)
- [ ] **Generate new sandbox keys**
- [ ] **Update local .env with new keys**
- [ ] Clean git history (optional)
- [ ] Implement pre-commit hooks (recommended)
- [ ] Team security training (recommended)

---

## 📚 References

- [Midtrans Dashboard](https://dashboard.midtrans.com/)
- [Git Filter-Repo](https://github.com/newren/git-filter-repo)
- [BFG Repo-Cleaner](https://rtyley.github.io/bfg-repo-cleaner/)
- [GitHub Secret Scanning](https://docs.github.com/en/code-security/secret-scanning)
- [OWASP Secrets Management](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)

---

**Report Author**: GitHub Copilot  
**Last Updated**: November 30, 2025
