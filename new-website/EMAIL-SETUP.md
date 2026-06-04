# Gmail Email Setup — Growing Minds English School

The website uses your **Gmail account** (`growingminds2025@gmail.com`) to:

1. **Receive** contact form and admission submissions in your inbox  
2. **Send** automatic acknowledgment emails to parents and visitors  

---

## How it works

| Event | To (receive) | To (acknowledgment) |
|-------|----------------|---------------------|
| Contact form submitted | `growingminds2025@gmail.com` | Visitor's email |
| Admission form submitted | `growingminds2025@gmail.com` | Parent email (from form) |

Emails are sent via **Gmail SMTP** using a Google **App Password** (not your regular Gmail password).

---

## Step 1: Enable 2-Step Verification on Gmail

1. Open [Google Account → Security](https://myaccount.google.com/security)
2. Sign in with `growingminds2025@gmail.com`
3. Under **How you sign in to Google**, enable **2-Step Verification**
4. Complete the setup (phone verification)

> App Passwords only work when 2-Step Verification is ON.

---

## Step 2: Create a Gmail App Password

1. Go to [Google App Passwords](https://myaccount.google.com/apppasswords)  
   (Or: Google Account → Security → 2-Step Verification → App passwords)
2. App name: `Growing Minds Website`
3. Click **Create**
4. Google shows a **16-character password** like: `abcd efgh ijkl mnop`
5. Copy it — you will not see it again

---

## Step 3: Add to Vercel Environment Variables

In Vercel → Project → **Settings** → **Environment Variables**:

| Variable | Value |
|----------|-------|
| `GMAIL_USER` | `growingminds2025@gmail.com` |
| `GMAIL_APP_PASSWORD` | `abcdefghijklmnop` (16 chars, no spaces) |
| `ADMIN_EMAIL` | `growingminds2025@gmail.com` |
| `EMAIL_FROM_NAME` | `Growing Minds English School` |

Redeploy after saving.

---

## Step 4: Local testing (optional)

Create `new-website/.env.local`:

```env
GMAIL_USER=growingminds2025@gmail.com
GMAIL_APP_PASSWORD=your-16-char-app-password
ADMIN_EMAIL=growingminds2025@gmail.com
EMAIL_FROM_NAME=Growing Minds English School
```

Then:

```bash
cd new-website
npm run dev
```

Submit the contact form or admission form and check:
- Admin inbox receives the submission
- Submitter receives acknowledgment email

---

## Acknowledgment email content

**Contact form** — sent to the person who wrote:
> "Thank you for contacting Growing Minds English School. We have received your message..."

**Admission form** — sent to parent email:
> "Thank you for applying... We have received the application for [Student Name]..."

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `Invalid login` / auth error | Use App Password, not regular Gmail password |
| No App Passwords option | Enable 2-Step Verification first |
| Emails go to spam | Normal for new senders; mark as "Not spam" |
| Acknowledgment not received | Check spam; verify parent email on admission form |
| Works locally, not on Vercel | Confirm env vars set for Production + redeploy |

---

## Alternative: Resend (optional)

If Gmail App Password is not preferred, you can use [Resend](https://resend.com) instead:

```env
RESEND_API_KEY=re_xxxx
ADMIN_EMAIL=growingminds2025@gmail.com
FROM_EMAIL=Growing Minds <noreply@yourdomain.com>
```

Gmail is used when `GMAIL_USER` + `GMAIL_APP_PASSWORD` are set. Resend is the fallback.

---

## Security notes

- Never commit `.env.local` or App Password to GitHub
- App Password is only for this website — revoke it anytime in Google Account settings
- Only store the password in Vercel Environment Variables (encrypted)
