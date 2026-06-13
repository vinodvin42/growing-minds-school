# Growing Minds English School — Next.js Website

School website with admin panel, student portal, admissions, and fees — data stored on **disk** (filesystem), not Vercel Blob.

## Features

- Public pages: Home, About, Admissions, News, Videos, Contact
- Admin panel at `/admin` — edit all content, upload images, manage video library
- Student portal — homework, messages, fees, calendar
- Admission form with document uploads
- Contact form with email notifications
- SEO: metadata, sitemap, robots.txt
- Works immediately with built-in default content (no env vars needed to view locally)

## Quick Start (Local)

```bash
cd new-website
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Data is saved under `./data/`.

**Admin login:** [http://localhost:3000/admin/login](http://localhost:3000/admin/login)
- Dev password: `admin123` (when `ADMIN_PASSWORD` is not set)
- Production: set `ADMIN_PASSWORD` in environment variables

## Deploy (file storage)

**Do not deploy to Vercel alone** — serverless has no persistent disk.

See **[DEPLOY-FILE-STORAGE.md](./DEPLOY-FILE-STORAGE.md)** for Railway, Docker, or VPS setup.

Quick summary:

1. Push repo to GitHub
2. Deploy on **Railway** (or Docker) with a volume at `/data`
3. Set `STORAGE_BACKEND=filesystem`, `DATA_DIR=/data`, `ADMIN_PASSWORD`, email vars
4. Migrate existing Blob data once: `BLOB_READ_WRITE_TOKEN=xxx npm run migrate:blob-to-data`

### Required Environment Variables (Production)

| Variable | Purpose |
|----------|---------|
| `STORAGE_BACKEND` | `filesystem` (default) |
| `DATA_DIR` | `/data` on server with mounted volume |
| `ADMIN_PASSWORD` | Admin panel login password |
| `GMAIL_USER` / `GMAIL_APP_PASSWORD` or `RESEND_API_KEY` | Email for forms |
| `ADMIN_EMAIL` | Where form submissions are sent |
| `NEXT_PUBLIC_SITE_URL` | Your domain (uploads + SEO) |

See `.env.example` and `STORAGE-SETUP.md`.

### Legacy: Vercel + Blob

Only if you cannot move hosting: see **[DEPLOYMENT.md](./DEPLOYMENT.md)** and set `STORAGE_BACKEND=blob`.

1. Create account at [resend.com](https://resend.com)
2. Add and verify your domain
3. Create API key → set as `RESEND_API_KEY`

## Admin Panel

Login at `/admin/login` to manage:

- **Site Settings** — name, contact, logo, address
- **Homepage** — hero text, admission banner
- **Carousel** — hero banner slides
- **Photo Gallery** — upload and manage images
- **Video Library** — YouTube embed URLs, thumbnails, featured video
- **News & Events** — announcements and news cards
- **Teachers** — profiles and photos
- **Testimonials** — parent quotes
- **About Page** — vision, mission, content

Click **Save Changes** after editing. Content is stored in Vercel Blob.

## Project Structure

```
new-website/
├── src/
│   ├── app/              # Pages and API routes
│   ├── components/       # UI components + admin
│   ├── data/             # Default content (fallback)
│   ├── lib/              # Content, auth, email helpers
│   └── types/            # TypeScript types
├── public/assets/css/    # School theme styles
├── PROGRESS.md           # Migration progress tracker
└── README.md
```

## Migration from Old Site

The old `old/` folder contained static HTML + PHP. This project replaces:

| Old | New |
|-----|-----|
| `index.html` etc. | Next.js pages |
| `submit-admission.php` | `/api/admission` |
| `submit-contact.php` | `/api/contact` |
| Hardcoded content | Admin panel + Blob storage |

See `PROGRESS.md` for full migration status.

## License

© 2026 Growing Minds English School. All rights reserved.
