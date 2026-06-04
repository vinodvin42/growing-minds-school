# Domain Setup — growingmindsschool.org → Vercel

The **new site runs on Vercel**. The custom domain must point DNS to Vercel (not the old Terabytes/GoDaddy parking server).

## Status (check anytime)

| URL | Expected |
|-----|----------|
| `https://growing-minds-school.vercel.app` | ✅ New Next.js site (`Server: Vercel`) |
| `https://www.growingmindsschool.org` | Must show same site + `Server: Vercel` |
| `https://growingmindsschool.org` | Same (apex) |

**If the custom domain fails or shows the old site:** DNS still points to the wrong IP.

Your domain uses **GoDaddy** nameservers (`ns11.domaincontrol.com`, `ns12.domaincontrol.com`). DNS is edited in **GoDaddy**, not in Terabytes.

---

## Step 1 — Add domains in Vercel (if not done)

1. [vercel.com](https://vercel.com) → project **growing-minds-school**
2. **Settings** → **Domains**
3. Add:
   - `growingmindsschool.org`
   - `www.growingmindsschool.org`
4. Vercel shows **Valid Configuration** when DNS is correct (can take up to 48 hours)

**Project settings (same screen):**

| Setting | Value |
|---------|--------|
| Root Directory | `new-website` |
| `NEXT_PUBLIC_SITE_URL` | `https://www.growingmindsschool.org` |

Redeploy after changing env vars.

---

## Step 2 — Fix DNS at GoDaddy (choose one)

### Option A — Vercel nameservers (easiest long-term)

1. In Vercel → **Domains** → `growingmindsschool.org` → **DNS Records** / **Set up Vercel DNS**
2. Copy nameservers (usually `ns1.vercel-dns.com`, `ns2.vercel-dns.com`)
3. [GoDaddy](https://dcc.godaddy.com/) → **My Products** → **DNS** next to your domain
4. **Nameservers** → **Change** → **Enter my own nameservers**
5. Paste Vercel’s two nameservers → **Save**
6. Vercel manages all records automatically

### Option B — Keep GoDaddy DNS, change records only

1. GoDaddy → domain → **DNS** → **DNS Records**

2. **Delete** old records that point away from Vercel, for example:
   - **A** `@` → `160.153.0.150` or any Terabytes IP
   - **A** `@` → `216.198.79.x`, `64.29.17.x`, `209.42.28.x`
   - **CNAME** `www` → anything except Vercel

3. **Add or update:**

| Type | Name | Value | TTL |
|------|------|--------|-----|
| **A** | `@` | `76.76.21.21` | 600 (or default) |
| **CNAME** | `www` | `cname.vercel-dns.com` | 600 |

4. **Save**

> GoDaddy sometimes shows Name as `@` or blank for the root domain.  
> For `www`, Name is `www` only (not `www.growingmindsschool.org`).

---

## Step 3 — Remove old hosting (optional but recommended)

- In **Terabytes** / old cPanel: remove this domain or stop using it for the old HTML site
- Old files on Terabytes are **not** used once DNS points to Vercel

---

## Step 4 — Wait and verify

DNS can take **15 minutes to 48 hours**.

### Check propagation

- [whatsmydns.net — A record for growingmindsschool.org](https://www.whatsmydns.net/#A/growingmindsschool.org)  
  Should show **`76.76.21.21`** (not `160.153.0.150`)

### Check the live site (incognito / private window)

Open: `https://www.growingmindsschool.org`

You should see:

- New Growing Minds design (carousel, orange/lime theme)
- URLs like `/contact`, `/student/login` (not `contact.html`)

### Check headers (PowerShell)

```powershell
curl -sI https://www.growingmindsschool.org
```

Look for: **`Server: Vercel`** — not `LiteSpeed` or SSL errors.

### Check DNS (PowerShell)

```powershell
nslookup growingmindsschool.org 8.8.8.8
nslookup www.growingmindsschool.org 8.8.8.8
```

After fix: apex may show `76.76.21.21`; `www` may CNAME to `cname.vercel-dns.com`.

---

## Errors you may see before DNS is fixed

| Error | Cause | Fix |
|-------|--------|-----|
| `SSL_ERROR_NO_CYPHER_OVERLAP` (Firefox) | Old server at domain IP | Point DNS to Vercel |
| Old HTML site / “Not Secure” | DNS → Terabytes / parking | Update GoDaddy records |
| Vercel “Invalid Configuration” | DNS not matching Vercel | Complete Step 2 |

---

## After DNS works

1. Set `NEXT_PUBLIC_SITE_URL=https://www.growingmindsschool.org` on Vercel → **Redeploy**
2. Email: see **`EMAIL-SETUP.md`** (`GMAIL_USER`, `GMAIL_APP_PASSWORD`, `ADMIN_EMAIL`)
3. Blob store connected for admin + student portal

---

## Quick checklist

- [ ] Domains added in Vercel project
- [ ] GoDaddy: Vercel nameservers **OR** A `@` = `76.76.21.21` + CNAME `www` = `cname.vercel-dns.com`
- [ ] Old A records (`160.153.0.150`, etc.) **deleted**
- [ ] Root Directory = `new-website`
- [ ] `NEXT_PUBLIC_SITE_URL` = `https://www.growingmindsschool.org`
- [ ] Redeploy on Vercel
- [ ] Test incognito — `Server: Vercel` on www
- [ ] whatsmydns shows `76.76.21.21` globally

---

## Registrar login

Domain appears registered via **GoDaddy** (`domaincontrol.com` nameservers).  
Log in: [https://sso.godaddy.com](https://sso.godaddy.com) → **My Products** → **DNS**.

If you use a different GoDaddy account or reseller, use the panel where you renew `growingmindsschool.org` each year.
