# Growing Minds English School

Monorepo layout:

```
growing-minds-school/     ← Git repo root (this folder)
├── new-website/          ← Next.js app — deploy THIS folder on Vercel
└── old/                  ← Archived static HTML site
```

## Vercel deploy (required setting)

If the live site shows **404: NOT_FOUND**, Vercel is almost certainly building the wrong folder.

1. Open your project on [vercel.com](https://vercel.com)
2. **Settings** → **General** → **Root Directory**
3. Set to: `new-website`
4. Click **Save**, then **Deployments** → **Redeploy** (use existing build cache: No)

Full env vars and post-deploy steps: [`new-website/DEPLOYMENT.md`](new-website/DEPLOYMENT.md)

## Local development

```bash
cd new-website
npm install
npm run dev
```

Open http://localhost:3000
