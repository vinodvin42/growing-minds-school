# Growing Minds English School — Next.js Website

Vercel-deployable website with admin panel for content, images, and video library management.

## Features

- Public pages: Home, About, Admissions, News, Videos, Contact
- Admin panel at `/admin` — edit all content, upload images, manage video library
- Admission form with document uploads (Vercel Blob)
- Contact form with email notifications (Resend)
- SEO: metadata, sitemap, robots.txt
- Works immediately with built-in default content (no env vars needed to view)

## Quick Start (Local)

```bash
cd new-website
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

**Admin login:** [http://localhost:3000/admin/login](http://localhost:3000/admin/login)
- Dev password: `admin123` (when `ADMIN_PASSWORD` is not set)
- Production: set `ADMIN_PASSWORD` in environment variables

## Deploy to Vercel

See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for the full step-by-step guide.

Quick summary:

1. Push repo to GitHub (root contains `old/` + `new-website/`)
2. Import in [Vercel Dashboard](https://vercel.com/new) — root directory: `new-website`
3. Connect Vercel Blob store + set env vars (see `.env.example`)
4. Deploy, then run `npm run seed` or save content via `/admin`

### Required Environment Variables (Production)

| Variable | Purpose |
|----------|---------|
| `ADMIN_PASSWORD` | Admin panel login password |
| `BLOB_READ_WRITE_TOKEN` | Content storage + file uploads ([Vercel Blob](https://vercel.com/docs/storage/vercel-blob)) |
| `RESEND_API_KEY` | Email for forms ([Resend](https://resend.com)) |
| `ADMIN_EMAIL` | Where form submissions are sent |
| `FROM_EMAIL` | Sender email address |
| `NEXT_PUBLIC_SITE_URL` | Your domain (for sitemap/SEO) |

### Setting up Vercel Blob

1. In Vercel project → Storage → Create Blob store
2. Connect to project — `BLOB_READ_WRITE_TOKEN` is added automatically

### Setting up Resend

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
