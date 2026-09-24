# API FIFA26 / Control

Backend Node.js + Express + PostgreSQL Supabase.

## Local

À la racine du projet :

```powershell
npm install
npm run seed
npm run api:start
```

Le serveur écoute sur `http://localhost:4000`.

## Production

Le backend est chargé par Vercel via `api/[...path].js`. Il ne faut pas lancer un serveur permanent avec `app.listen()` sur Vercel.

Variables obligatoires :

- `DATABASE_URL`
- `JWT_SECRET` (32 caractères minimum)
- `JWT_EXPIRES_IN`
- `CORS_ORIGIN`
- `SEED_ADMIN_EMAIL`
- `SEED_ADMIN_PASSWORD`
