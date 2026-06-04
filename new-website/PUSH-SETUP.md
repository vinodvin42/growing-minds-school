# Web Push — Student app phone notifications

When admin saves **homework**, **messages**, **fees**, or **calendar**, students who enabled notifications get an **OS alert** (even if the app is closed).

Works on:
- Android Chrome (installed PWA or browser)
- Desktop Chrome / Edge
- iOS 16.4+ **only if** the student added the app to Home Screen

---

## 1. Generate VAPID keys (once)

```bash
cd new-website
node scripts/generate-vapid.mjs
```

Copy the three lines into **Vercel → Project → Settings → Environment Variables** (Production + Preview):

| Variable | Notes |
|----------|--------|
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Public — safe in browser |
| `VAPID_PRIVATE_KEY` | Secret — never commit |
| `VAPID_SUBJECT` | `mailto:growingmindsenglishschool@gmail.com` |

**Redeploy** after adding env vars.

---

## 2. Student enables notifications

1. Student logs in at `/student/login`
2. Banner: **Get phone alerts** → **Enable**
3. Browser asks permission → **Allow**
4. Subscription saved in Blob: `portal/push/subscriptions.json`

---

## 3. Admin posts content

Saving in admin triggers push automatically:

| Admin action | Push title |
|--------------|------------|
| Save homework | New homework |
| Save messages | New school message |
| Save fees | Fees updated |
| Save calendar | Calendar updated |

In-app banner + tab badges still work without push.

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| No “Enable” banner | VAPID keys missing on Vercel — redeploy |
| iOS no push | Install app to Home Screen first (iOS limitation) |
| Permission denied | Reset in browser site settings |
| Push sent but not received | Old subscription — student re-enables notifications |

---

## Security

- Never commit `VAPID_PRIVATE_KEY`
- Push goes to all subscribed devices (no per-message targeting yet)
