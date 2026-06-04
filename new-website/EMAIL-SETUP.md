# Email Setup — Growing Minds English School

Gmail **App Passwords are not available** on your account, and normal Gmail passwords are blocked by Google for websites. Use **Resend** instead (5 minutes).

---

## Quick fix — Resend (recommended)

### 1. Create Resend account
1. Go to [resend.com](https://resend.com) → sign up with **`growingminds2025@gmail.com`**
2. Dashboard → **API Keys** → **Create API Key** → copy `re_...`

### 2. Add to Vercel
**Settings → Environment Variables:**

| Variable | Value |
|----------|-------|
| `RESEND_API_KEY` | `re_...` (paste your key) |
| `ADMIN_EMAIL` | `growingminds2025@gmail.com` |
| `EMAIL_FROM_NAME` | `Growing Minds English School` |

You can **remove** `GMAIL_USER`, `GMAIL_PASSWORD`, and `GMAIL_APP_PASSWORD` (Gmail will not work without App Passwords).

Click **Save** → **Deployments** → **Redeploy**.

### 3. Test
Submit the contact form at `/contact`. You should receive the message at `growingminds2025@gmail.com`.

> **Note:** With only `onboarding@resend.dev` (default), Resend delivers admin notifications to your signup email. To send **acknowledgment emails to visitors**, verify your domain (step below).

---

## Verify domain (for visitor acknowledgment emails)

1. Resend → **Domains** → **Add** → `growingmindsschool.org`
2. Copy the DNS records Resend shows (SPF, DKIM)
3. Vercel → **Domains** → `growingmindsschool.org` → **DNS Records** → add them
4. Wait for verification (usually 5–30 minutes)
5. In Vercel add:

| Variable | Value |
|----------|-------|
| `FROM_EMAIL` | `Growing Minds English School <noreply@growingmindsschool.org>` |

6. Redeploy

---

## Gmail (only if App Passwords become available)

App Passwords require [2-Step Verification](https://myaccount.google.com/security) and must appear at [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords).

If unavailable on your account, use Resend above.

| Variable | Value |
|----------|-------|
| `GMAIL_USER` | `growingminds2025@gmail.com` |
| `GMAIL_APP_PASSWORD` | 16-character app password |

The site tries **Resend first**, then Gmail as fallback.

---

## Local testing

```env
RESEND_API_KEY=re_your_key
ADMIN_EMAIL=growingminds2025@gmail.com
EMAIL_FROM_NAME=Growing Minds English School
```

```bash
cd new-website
npm run dev
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Contact form still fails | Confirm `RESEND_API_KEY` is set for **Production** and redeploy |
| Admin email works, visitor ack fails | Verify domain in Resend + set `FROM_EMAIL` |
| Emails in spam | Mark as “Not spam” in Gmail |

---

## Security

- Never commit API keys to GitHub
- Store values only in Vercel Environment Variables
