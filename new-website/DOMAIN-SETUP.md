# Domain Setup — growingmindsschool.org → Vercel

Your **new website is live on Vercel**, but the custom domain still points to **old Terabytes/LiteSpeed hosting** for most visitors.

## Current problem (verified)

| Check | Result |
|-------|--------|
| `growing-minds-school.vercel.app` | ✅ New Next.js site (Vercel) |
| `www.growingmindsschool.org` | ❌ Old site (LiteSpeed / Terabytes) |
| Domain nameservers | `ns1.terabytesserver.com` / `ns2.terabytesserver.com` |
| Should be | Vercel nameservers **or** Vercel A/CNAME records |

Until DNS is fixed, browsers will keep showing the **old HTML site**. Contact form email (Resend) only works on the **new** Vercel site.

---

## Fix — Option A: Vercel nameservers (recommended)

Do this where you **bought the domain** (GoDaddy, Namecheap, etc.) — not in Terabytes hosting.

### 1. Get Vercel nameservers

1. [vercel.com](https://vercel.com) → your project **growing-minds-school**
2. **Settings** → **Domains**
3. Add `growingmindsschool.org` and `www.growingmindsschool.org` if not already added
4. Click **Set up Vercel DNS** (or open domain → DNS)
5. Copy the two nameservers, usually:
   - `ns1.vercel-dns.com`
   - `ns2.vercel-dns.com`

### 2. Change nameservers at your registrar

1. Log in where you registered `growingmindsschool.org`
2. Open **Domain** → **DNS** or **Nameservers**
3. Change from **Custom / Terabytes** (`terabytesserver.com`) to **Custom**
4. Enter Vercel’s nameservers above
5. **Save**

### 3. Remove old hosting DNS (important)

- In **Terabytes** (or old cPanel) hosting panel: stop using this domain for the old site, or delete old A records if you keep Terabytes NS (Option B)
- Old files on Terabytes will **not** be used once DNS points to Vercel

### 4. Wait and verify

DNS can take **15 minutes to 48 hours**.

Check propagation: [whatsmydns.net](https://www.whatsmydns.net/#A/www.growingmindsschool.org)

When correct, `www.growingmindsschool.org` should resolve to Vercel (not `216.198.79.x` or LiteSpeed).

### 5. Vercel project settings

- **Root Directory:** `new-website`
- **Environment variable:** `NEXT_PUBLIC_SITE_URL` = `https://www.growingmindsschool.org`
- **Redeploy** after DNS propagates

---

## Fix — Option B: Keep Terabytes nameservers, change records only

If you **cannot** change nameservers, log into **Terabytes hosting DNS** and set:

| Type | Name | Value |
|------|------|--------|
| **A** | `@` (root) | `76.76.21.21` |
| **CNAME** | `www` | `cname.vercel-dns.com` |

**Delete** old A records pointing to:
- `216.198.79.1`
- `216.198.79.65`
- `64.29.17.1`
- `209.42.28.136`

Save and wait for DNS propagation.

---

## How to know it’s fixed

Open **Incognito / Private** window (avoids cache):

```
https://www.growingmindsschool.org
```

You should see:
- New Growing Minds design (carousel, orange/lime theme)
- URL paths like `/contact`, `/gallery` (not `contact.html`)

Or run in terminal:
```bash
curl -I https://www.growingmindsschool.org
```
Response should include **`Server: Vercel`** — not `LiteSpeed`.

---

## Contact form email (after DNS is fixed)

Gmail App Passwords don’t work on your account. On the **new** Vercel site:

1. Sign up at [resend.com](https://resend.com) with `growingminds2025@gmail.com`
2. Create API key → add to Vercel:
   - `RESEND_API_KEY` = `re_...`
   - `ADMIN_EMAIL` = `growingminds2025@gmail.com`
3. Remove `GMAIL_USER`, `GMAIL_PASSWORD`, `GMAIL_APP_PASSWORD`
4. **Redeploy**

See **`new-website/EMAIL-SETUP.md`** for full steps.

---

## Quick checklist

- [ ] Nameservers → Vercel **OR** A/CNAME → Vercel IPs
- [ ] Old Terabytes A records removed
- [ ] Vercel Root Directory = `new-website`
- [ ] `NEXT_PUBLIC_SITE_URL` updated
- [ ] Redeploy on Vercel
- [ ] Test in incognito — `Server: Vercel`
- [ ] Add `RESEND_API_KEY` for contact/admission forms
