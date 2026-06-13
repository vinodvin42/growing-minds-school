# Domain Setup — growingmindsschool.org → Railway

The site runs on **Railway** with file storage at `/data`. DNS must point to Railway (not Vercel or old Terabytes hosting).

---

## Step 1 — Add custom domain in Railway

1. [railway.app](https://railway.app) → your project → web service
2. **Settings** → **Networking** → **Custom Domain**
3. Add:
   - `www.growingmindsschool.org`
   - `growingmindsschool.org` (apex)
4. Railway shows a **CNAME target** (e.g. `growing-minds-school-production.up.railway.app`)

Copy both targets — you need them for GoDaddy.

---

## Step 2 — Update GoDaddy DNS

Log in: [GoDaddy DNS](https://dcc.godaddy.com/) → **My Products** → domain → **DNS**

### Delete old records

Remove anything pointing to Vercel or Terabytes:

| Remove | Example |
|--------|---------|
| A `@` | `76.76.21.21`, `160.153.0.150` |
| CNAME `www` | `cname.vercel-dns.com` |

### Add Railway records

| Type | Name | Value |
|------|------|--------|
| **CNAME** | `www` | Railway CNAME target (from Step 1) |
| **CNAME** | `@` | Same Railway target *(GoDaddy supports CNAME on apex)* |

If GoDaddy will not CNAME the apex `@`, use:

- **Forwarding:** `growingmindsschool.org` → `https://www.growingmindsschool.org` (301)
- **CNAME** `www` → Railway target only

---

## Step 3 — Environment variable

In Railway → **Variables**:

```
NEXT_PUBLIC_SITE_URL=https://www.growingmindsschool.org
```

Redeploy after changing.

---

## Step 4 — Verify (wait 15 min – 48 hours)

### Browser (incognito)

Open: `https://www.growingmindsschool.org`

- New Growing Minds site (orange/lime theme)
- `/admin/login`, `/student/login` work

### Health check

```
https://www.growingmindsschool.org/api/health
```

Expected:

```json
{ "ok": true, "backend": "filesystem", "dataDirWritable": true }
```

### DNS propagation

[whatsmydns.net — CNAME for www.growingmindsschool.org](https://www.whatsmydns.net/#CNAME/www.growingmindsschool.org)

Should show your Railway hostname globally.

### PowerShell

```powershell
nslookup www.growingmindsschool.org 8.8.8.8
curl -sI https://www.growingmindsschool.org
```

---

## SSL

Railway provisions HTTPS automatically once DNS is correct. No manual certificate setup.

---

## Checklist

- [ ] Custom domains added in Railway
- [ ] GoDaddy: old Vercel/Terabytes records removed
- [ ] CNAME `www` → Railway target
- [ ] Apex `@` → Railway or forward to www
- [ ] `NEXT_PUBLIC_SITE_URL` set and redeployed
- [ ] `/api/health` returns 200
- [ ] Admin + student portal work on custom domain

---

## Legacy: Vercel DNS doc

If you temporarily keep Vercel running, see **`DOMAIN-SETUP.md`**. For file-storage production, use this Railway doc instead.
