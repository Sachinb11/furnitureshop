# 🛋️ Furnishop — Production-Ready Furniture eCommerce

A full-stack IKEA-style furniture store built with Next.js 14 + NestJS + PostgreSQL.

## ⚡ Quick Start (3 commands)

```bash
# 1. Start database
docker-compose up -d

# 2. Install + seed
npm install && npm run db:seed

# 3. Run
npm run dev
```

That's it. Open http://localhost:3000

---

## 🔑 Default Credentials

| Role  | Email                   | Password   |
|-------|-------------------------|------------|
| Admin | admin@furnishop.com     | Admin@123  |

Admin panel: http://localhost:3000/admin

---

## 📍 URLs

| Service      | URL                              |
|--------------|----------------------------------|
| Storefront   | http://localhost:3000            |
| Admin panel  | http://localhost:3000/admin      |
| API          | http://localhost:3001/api/v1     |
| Swagger docs | http://localhost:3001/docs       |
| DB Browser   | http://localhost:8080            |

---

## 🏗️ Tech Stack

| Layer    | Tech                                    |
|----------|-----------------------------------------|
| Frontend | Next.js 14 (App Router), Tailwind CSS   |
| State    | Zustand + React Query                   |
| Backend  | NestJS, TypeORM, PostgreSQL             |
| Auth     | JWT (email/password) + Firebase (optional) |
| Payments | Razorpay                                |
| Images   | Local disk (dev) / AWS S3 (prod)        |
| Build    | Turborepo monorepo                      |

---

## 🔧 Environment Setup

### Backend: `apps/api/.env`
```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/furnishop
JWT_SECRET=any_long_string_here
JWT_REFRESH_SECRET=different_long_string_here
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000
```

### Frontend: `apps/web/.env.local`
```bash
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Both files are pre-configured. Just run `npm run dev`.

---

## 🐛 Troubleshooting

**"Network Error" on login:**
→ Backend not running. Run `npm run dev` or check port 3001.

**Database connection failed:**
→ Docker not running. Run `docker-compose up -d`

**Module not found errors:**
→ Run `npm install` from project root.

**Admin panel shows "Unauthorized":**
→ Log in at `/login` with admin@furnishop.com / Admin@123

---

## 📦 Project Structure

```
furnishop/
├── apps/
│   ├── api/          # NestJS backend (port 3001)
│   │   └── src/
│   │       ├── modules/   # auth, products, orders, payments...
│   │       └── common/    # filters, interceptors, dto
│   └── web/          # Next.js frontend (port 3000)
│       ├── app/           # App Router pages
│       ├── components/    # UI components
│       └── lib/           # API client, stores, utils
├── docker-compose.yml
├── docs/DEPLOYMENT.md
└── package.json
```

---

## 🚀 Deployment

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for complete deployment guide.

Quick deploy:
- **Frontend → Vercel** (connect GitHub, set root to `apps/web`)
- **Backend → Railway** (connect GitHub, set root to `apps/api`)
- **Database → Railway PostgreSQL** or **Supabase** (free tier)
