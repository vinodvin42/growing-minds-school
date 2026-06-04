# Gmail Email Setup — Growing Minds English School

The website sends:

1. **Admin notifications** → `growingminds2025@gmail.com` (contact + admission forms)
2. **Acknowledgment emails** → visitor / parent email

---

## Option A — Gmail password (simplest if App Password is unavailable)

Google no longer shows **App Passwords** on every account. You can use your **normal Gmail sign-in password** instead.

### Vercel environment variables

In Vercel → Project → **Settings** → **Environment Variables**:

| Variable | Value |
|----------|-------|
| `GMAIL_USER` | `growingminds2025@gmail.com` |
| `GMAIL_PASSWORD` | Your normal Gmail password for this account |
| `ADMIN_EMAIL` | `growingminds2025@gmail.com` |
| `EMAIL_FROM_NAME` | `Growing Minds English School` |

You can **remove** `GMAIL_APP_PASSWORD` if it was set incorrectly.

Click **Save**, then **Redeploy** the project.

### If Gmail still rejects the password (535 error)

Google often blocks normal passwords for website SMTP. Try these in order:

1. **Turn on 2-Step Verification**, then open [App Passwords](https://myaccount.google.com/apppasswords) directly and create one → use it in `GMAIL_APP_PASSWORD` (remove `GMAIL_PASSWORD`).
2. **Use Resend instead** (Option B below) — works without Gmail App Passwords.

---

## Option B — Gmail App Password (more reliable long-term)

1. Enable [2-Step Verification](https://myaccount.google.com/security) on `growingminds2025@gmail.com`
2. Create an app password at [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
3. In Vercel set:

| Variable | Value |
|----------|-------|
| `GMAIL_USER` | `growingminds2025@gmail.com` |
| `GMAIL_APP_PASSWORD` | 16-character app password (spaces optional) |

Remove `GMAIL_PASSWORD` when using an app password.

---

## Option C — Resend (no Gmail SMTP)

If Gmail keeps failing:

1. Sign up at [resend.com](https://resend.com) with `growingminds2025@gmail.com`
2. Add domain `growingmindsschool.org` in Resend → copy the DNS records → add them in **Vercel → Domains → DNS**
3. Create an API key in Resend
4. In Vercel, **remove** `GMAIL_USER`, `GMAIL_PASSWORD`, and `GMAIL_APP_PASSWORD`
5. Add:

| Variable | Value |
|----------|-------|
| `RESEND_API_KEY` | `re_...` from Resend |
| `FROM_EMAIL` | `Growing Minds English School <noreply@growingmindsschool.org>` |
| `ADMIN_EMAIL` | `growingminds2025@gmail.com` |

6. Redeploy

---

## Local testing

Create `new-website/.env.local`:

```env
GMAIL_USER=growingminds2025@gmail.com
GMAIL_PASSWORD=your-gmail-password
ADMIN_EMAIL=growingminds2025@gmail.com
EMAIL_FROM_NAME=Growing Minds English School
```

```bash
cd new-website
npm run dev
```

Submit the contact form and check the admin inbox.

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| No **App Passwords** menu in Google | Use `GMAIL_PASSWORD` (Option A) or Resend (Option C) |
| `535` / Invalid login | Wrong password, or Google blocked SMTP — try App Password or Resend |
| Works locally, not on Vercel | Redeploy after changing env vars |
| Emails in spam | Mark as “Not spam” in Gmail |

---

## Security

- Never commit passwords to GitHub
- Store values only in Vercel **Environment Variables**
- Revoke app passwords anytime in Google Account settings
