# Furnishop — Deployment Guide

## Local Development (Quick Start)

```bash
# 1. Start database
docker-compose up -d

# 2. Install dependencies
npm install

# 3. Seed database (creates admin user + sample data)
npm run db:seed

# 4. Start both servers
npm run dev
```

Access:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001/api/v1
- Swagger: http://localhost:3001/docs
- Adminer: http://localhost:8080 (postgres/postgres)
- Admin panel: http://localhost:3000/admin (admin@furnishop.com / Admin@123)

---

## Production Deployment

### Option A: Vercel (Frontend) + Railway (Backend)

#### Step 1 — Deploy Backend to Railway

1. Create account at railway.app
2. Click "New Project" → "Deploy from GitHub repo"
3. Select `apps/api` as the root directory
4. Set build command: `npm run build`
5. Set start command: `node dist/main`
6. Add environment variables (see below)
7. Railway auto-provisions PostgreSQL if you add the plugin

Railway backend environment variables:
```
DATABASE_URL=postgresql://postgres:PASSWORD@HOST:PORT/furnishop
JWT_SECRET=<generate: openssl rand -base64 64>
JWT_REFRESH_SECRET=<generate: openssl rand -base64 64>
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://your-app.vercel.app
RAZORPAY_KEY_ID=rzp_live_xxxx
RAZORPAY_KEY_SECRET=xxxx
RAZORPAY_WEBHOOK_SECRET=xxxx
```

After deploy, run seed: `railway run npm run seed`

#### Step 2 — Deploy Frontend to Vercel

1. Connect GitHub repo to vercel.com
2. Set Root Directory to `apps/web`
3. Framework: Next.js (auto-detected)
4. Add environment variables:

```
NEXT_PUBLIC_API_URL=https://your-backend.railway.app/api/v1
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxxx
NEXT_REVALIDATE_SECRET=your_secret
```

5. Deploy — Vercel handles build automatically.

---

### Option B: Render (Backend) + Vercel (Frontend)

#### Backend on Render

1. New Web Service → Connect GitHub
2. Root Directory: `apps/api`
3. Build: `npm install && npm run build`
4. Start: `node dist/main`
5. Plan: Free (for testing) or Starter ($7/mo)

Same environment variables as Railway above.

For database, use:
- Render PostgreSQL (free 90 days)
- Or Supabase (free tier, 500MB)
- Or Neon (free tier, serverless Postgres)

---

### Option C: Docker (VPS/EC2)

```bash
# Build API image
cd apps/api
docker build -t furnishop-api .

# Run with env
docker run -d \
  --name furnishop-api \
  -p 3001:3001 \
  -e DATABASE_URL="postgresql://..." \
  -e JWT_SECRET="..." \
  -e NODE_ENV=production \
  furnishop-api
```

For frontend on VPS:
```bash
cd apps/web
npm run build
npm start  # or use pm2
```

---

## Environment Variables Reference

### Backend (apps/api/.env.production)
```bash
DATABASE_URL=postgresql://USER:PASS@HOST:5432/furnishop
JWT_SECRET=<64+ random chars>
JWT_REFRESH_SECRET=<64+ random chars, different from above>
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://your-domain.com

# Razorpay (live keys)
RAZORPAY_KEY_ID=rzp_live_xxxx
RAZORPAY_KEY_SECRET=xxxx
RAZORPAY_WEBHOOK_SECRET=xxxx

# AWS S3 (optional - for image uploads in production)
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=xxxx
AWS_SECRET_ACCESS_KEY=xxxx
AWS_S3_BUCKET=furnishop-prod
AWS_CLOUDFRONT_DOMAIN=dxxxx.cloudfront.net

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=noreply@yourdomain.com
```

### Frontend (apps/web/.env.production)
```bash
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api/v1
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxxx
NEXT_REVALIDATE_SECRET=your_revalidate_secret
```

---

## Build Commands

```bash
# Build everything
npm run build

# Build only backend
cd apps/api && npm run build

# Build only frontend
cd apps/web && npm run build

# Start production backend
cd apps/api && node dist/main

# Start production frontend
cd apps/web && npm start
```

---

## Database Management

```bash
# Run seed (production)
NODE_ENV=production npm run db:seed --workspace=apps/api

# Revert a migration
npm run migration:revert --workspace=apps/api
```

---

## Common Issues

**"Network Error" on login:**
- Backend not running → `npm run dev` in api folder
- CORS issue → check `FRONTEND_URL` in backend `.env`
- Wrong API URL → check `NEXT_PUBLIC_API_URL` in web `.env.local`

**Database connection failed:**
- Docker not running → `docker-compose up -d`
- Wrong DATABASE_URL → check `.env`

**Admin panel access denied:**
- Not logged in as admin → use admin@furnishop.com / Admin@123
- Wrong role → check database: `SELECT email, role FROM users;`
