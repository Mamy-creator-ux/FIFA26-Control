# Déploiement final — GitHub + Supabase + Vercel

## 1. Préparer le projet

```powershell
npm install
npm run typecheck
npm test
npm run build
```

Ne passez à GitHub/Vercel que si ces trois vérifications réussissent.

## 2. Créer/configurer Supabase

Dans Supabase, créez un projet PostgreSQL. Récupérez la chaîne `DATABASE_URL` dans les paramètres Database/Connection string.

Pour le frontend, récupérez également :

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Le schéma est créé automatiquement par l'API au premier démarrage. Le seed de données doit être exécuté localement une fois avec les variables Supabase configurées :

```powershell
npm run seed
```

## 3. Variables locales

`.env` :

```env
DATABASE_URL=...
JWT_SECRET=secret-aleatoire-32-caracteres-ou-plus
JWT_EXPIRES_IN=12h
CORS_ORIGIN=http://localhost:3000
SEED_ADMIN_EMAIL=...
SEED_ADMIN_PASSWORD=...
```

`.env.local` :

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## 4. Tester localement

Terminal 1 :

```powershell
npm run api:start
```

Terminal 2 :

```powershell
npm run dev
```

Tester :

- `http://localhost:4000/`
- `http://localhost:4000/api`
- `http://localhost:3000/`
- `http://localhost:3000/connexion`
- `http://localhost:3000/admin`

## 5. GitHub

```powershell
git init
git add .
git commit -m "FIFA26 Control - version finale"
git branch -M main
git remote add origin URL_DU_DEPOT_GITHUB
git push -u origin main
```

Ne committez jamais `.env` ou `.env.local`.

## 6. Vercel

Importez le dépôt GitHub dans Vercel.

Le projet utilise Next.js sans `output: export`. Vercel héberge donc le frontend et la fonction Express `api/[...path].js`.

Ajoutez dans Vercel → Settings → Environment Variables :

```text
DATABASE_URL
JWT_SECRET
JWT_EXPIRES_IN
CORS_ORIGIN
SEED_ADMIN_EMAIL
SEED_ADMIN_PASSWORD
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

`CORS_ORIGIN` doit être exactement l'URL Vercel :

```text
https://votre-projet.vercel.app
```

`NEXT_PUBLIC_API_URL` n'est pas nécessaire en production : le frontend utilise automatiquement `/api` sur le même domaine.

## 7. Déploiement

Lancez le déploiement Vercel.

Après le build, testez immédiatement :

```text
https://votre-projet.vercel.app/api
```

Puis :

```text
https://votre-projet.vercel.app/connexion
https://votre-projet.vercel.app/admin
```

## 8. Vérification finale

- Accueil chargé
- Données équipes chargées
- Calendrier chargé
- Classement chargé
- Meilleurs buteurs chargés
- Inscription supporter
- Connexion supporter
- Connexion administrateur
- Enregistrement d'un résultat
- Recalcul du classement
- Ajout d'un but
- Ajout d'un carton jaune
- Ajout d'un carton rouge
- Statistiques mises à jour
- Notifications visibles
- Joueurs/entraîneurs accessibles
- Arbitres/stades accessibles
- Recherche/filtres fonctionnels
- Aucun rechargement nécessaire pour les actions Fetch
