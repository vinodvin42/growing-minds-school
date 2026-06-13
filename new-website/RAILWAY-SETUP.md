# Railway setup — run after creating project in dashboard

## 1. Create project (browser)

1. https://railway.app/new → **GitHub Repo** → `vinodvin42/growing-minds-school`
2. Service **Settings** → **Root Directory** = `new-website`
3. **Volumes** → Add volume → mount path **`/data`**
4. **Variables** — copy from `.env.example` (see DEPLOY-PLAN.md)

## 2. CLI login (terminal)

```powershell
cd new-website
npx @railway/cli login
npx @railway/cli link
```

Select the project you created.

## 3. Migrate Blob data (one time)

Get `BLOB_READ_WRITE_TOKEN` from Vercel → **growing-minds-school** project → Storage → `.env.local` tab.

```powershell
cd new-website
$env:BLOB_READ_WRITE_TOKEN = "vercel_blob_xxx"
npm run migrate:blob-to-data
```

Or run on Railway temporarily:

```powershell
npx @railway/cli variables set BLOB_READ_WRITE_TOKEN=vercel_blob_xxx
npx @railway/cli run npm run migrate:blob-to-data
npx @railway/cli variables delete BLOB_READ_WRITE_TOKEN
```

## 4. Deploy

```powershell
npx @railway/cli up
```

Or push to `main` after adding `RAILWAY_TOKEN` to GitHub Secrets (see `.github/workflows/deploy-railway.yml`).

## 5. Verify

```powershell
curl https://YOUR-APP.up.railway.app/api/health
```

Expected: `"ok": true`, `"dataDirWritable": true`

## 6. Custom domain

Railway → Networking → add `www.growingmindsschool.org`  
Follow **`DOMAIN-SETUP-RAILWAY.md`**
