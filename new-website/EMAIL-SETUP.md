# Email Setup — Growing Minds English School

School inbox: **`growingmindsenglishschool@gmail.com`**

---

## Why your Gmail password does not work

Google **blocks normal sign-in passwords** for website SMTP. The password you use to log into Gmail (`School@123` etc.) will always fail with error **535 BadCredentials**.

You must use a **Google App Password** (16 characters, like `abcd efgh ijkl mnop`).

---

## Option A — Gmail App Password (recommended if you have this inbox)

### 1. Turn on 2-Step Verification
1. Sign in to [growingmindsenglishschool@gmail.com](https://mail.google.com)
2. Open [Google Account Security](https://myaccount.google.com/security)
3. Enable **2-Step Verification** (required for App Passwords)

### 2. Create an App Password
1. Open [App Passwords](https://myaccount.google.com/apppasswords)
2. App name: `Growing Minds Website`
3. Copy the **16-character password** (remove spaces when pasting)

> If “App Passwords” is missing, your Google account type may not support it — use **Option B (Resend)** below.

### 3. Add to Vercel
**Project → Settings → Environment Variables** (Production + Preview):

| Variable | Value |
|----------|-------|
| `GMAIL_USER` | `growingmindsenglishschool@gmail.com` |
| `GMAIL_APP_PASSWORD` | 16-char app password (not your login password) |
| `ADMIN_EMAIL` | `growingmindsenglishschool@gmail.com` |
| `EMAIL_FROM_NAME` | `Growing Minds English School` |

Click **Save** → **Deployments** → **Redeploy** (required after env changes).

### 4. Test
```bash
cd new-website
npm run test:email
```

Or submit the contact form at `/contact`.

---

## Option B — Resend (if App Passwords unavailable)

1. Sign up at [resend.com](https://resend.com) with `growingmindsenglishschool@gmail.com`
2. Create API key → copy `re_...`
3. In Vercel:

| Variable | Value |
|----------|-------|
| `RESEND_API_KEY` | `re_...` |
| `ADMIN_EMAIL` | `growingmindsenglishschool@gmail.com` |
| `EMAIL_FROM_NAME` | `Growing Minds English School` |

4. Redeploy and test `/contact`

For **visitor confirmation emails**, verify your domain in Resend and set:
`FROM_EMAIL=Growing Minds English School <noreply@growingmindsschool.org>`

---

## Local testing

Copy `.env.example` to `.env.local` and fill in `GMAIL_APP_PASSWORD`:

```bash
cp .env.example .env.local
# Edit .env.local — use App Password only
npm run test:email
npm run dev
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Error 535 / BadCredentials | Use **App Password**, not login password |
| Form says success but no email | Env vars missing on Vercel — redeploy after adding them |
| App Passwords page missing | Use Resend (Option B) |
| Emails in spam | Mark as “Not spam” in Gmail |

---

## Security

- **Never** commit passwords or API keys to GitHub
- Store values only in Vercel Environment Variables or local `.env.local`
- If a password was shared in chat, change it and use an App Password instead
