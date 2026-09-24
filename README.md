# FIFA26 / Control — Projet complet

Plateforme de gestion d'un championnat de football avec Next.js/TypeScript côté client, Node.js + Express côté serveur, PostgreSQL Supabase pour les données et Supabase Auth pour l'inscription/connexion des supporters.

## Architecture de production

GitHub → Vercel → Next.js + API Express (`/api`) → Supabase PostgreSQL.

Le frontend et l'API utilisent le même domaine en production : il n'y a donc pas de dépendance à `localhost:4000`.

## Fonctionnalités du cahier des charges

- équipes
- inscription / connexion
- joueurs / entraîneurs
- calendrier et matchs
- résultats
- classement automatique
- buts et cartons jaunes/rouges
- statistiques joueurs et meilleur buteur
- arbitres
- stades
- comptes utilisateurs
- espace administrateur
- notifications
- recherche et filtres
- Fetch API et mise à jour sans rechargement
- API REST Node.js + Express
- PostgreSQL Supabase

## 1. Installation locale

```powershell
npm install
```

Créer `.env.local` pour le frontend et `.env` pour le backend à partir des exemples.

Variables backend minimales :

```env
DATABASE_URL=...
JWT_SECRET=un-secret-aleatoire-d-au-moins-32-caracteres
JWT_EXPIRES_IN=12h
CORS_ORIGIN=http://localhost:3000
SEED_ADMIN_EMAIL=admin@fifa26.control
SEED_ADMIN_PASSWORD=ChangezCeMotDePasse!
```

Variables frontend :

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## 2. Base Supabase

Le backend crée le schéma automatiquement au premier démarrage et le seed prépare les données de démonstration.

```powershell
npm run seed
```

## 3. Vérifications locales

```powershell
npm run typecheck
npm test
npm run build
```

Terminal 1 :

```powershell
npm run api:start
```

Terminal 2 :

```powershell
npm run dev
```

Ouvrir `http://localhost:3000` et tester `/connexion` puis `/admin`.

## 4. Déploiement Vercel

1. Pousser le dépôt sur GitHub.
2. Importer le dépôt dans Vercel.
3. Ne pas utiliser `output: export`.
4. Ajouter les variables d'environnement dans Vercel : `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `CORS_ORIGIN`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`.
5. Mettre `CORS_ORIGIN` à l'URL exacte Vercel, par exemple `https://mon-projet.vercel.app`.
6. Déployer.
7. Tester `https://mon-projet.vercel.app/api`.
8. Tester l'inscription, la connexion, `/admin`, les scores, les événements et le classement.

## Sécurité

- aucun secret réel ne doit être commité dans GitHub ;
- `JWT_SECRET` doit être long et aléatoire ;
- la création de comptes organisateurs est réservée à un administrateur authentifié ;
- les comptes supporters utilisent Supabase Auth ;
- les routes de gestion utilisent JWT + rôle ;
- les entrées API sont validées.
