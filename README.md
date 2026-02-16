# Intemporel - Bar à Desserts

Site web de menu digital pour un bar à desserts avec interface d'administration complète.

## 🍰 Fonctionnalités

### Interface Client (Public)
- Affichage de tous les desserts organisés par catégories
- Navigation intuitive entre les catégories
- Affichage des prix, photos et disponibilité
- Personnalisation des commandes via options

### Interface Admin (Privé)
- Authentification sécurisée
- Gestion complète des plats (CRUD)
- Gestion des catégories
- Gestion des options personnalisables (sauces, tailles, parfums...)
- Upload d'images optimisé

## 🛠️ Stack Technique

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Animations**: Framer Motion
- **Backend**: Supabase (Database, Auth, Storage)
- **Déploiement**: Vercel

## 🚀 Installation

### Prérequis
- Node.js 18+
- Compte Supabase (gratuit)

### 1. Cloner le projet

```bash
git clone <repo-url>
cd intemporel
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configurer Supabase

1. Créez un projet sur [supabase.com](https://supabase.com)
2. Exécutez les migrations SQL dans `supabase/migrations/001_initial_schema.sql`
3. (Optionnel) Exécutez `supabase/seed.sql` pour les données de départ
4. Créez un bucket Storage nommé `desserts-images` (public)

### 4. Configurer les variables d'environnement

Copiez `.env.local.example` vers `.env.local` et remplissez les valeurs :

```bash
cp .env.local.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL="https://votre-projet.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="votre-anon-key"
SUPABASE_SERVICE_ROLE_KEY="votre-service-role-key"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
NEXT_PUBLIC_STORAGE_BUCKET="desserts-images"
```

### 5. Créer un administrateur

Dans Supabase Dashboard > Authentication > Users, créez un utilisateur avec email/password.

### 6. Lancer le projet

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) pour le menu public.
Ouvrez [http://localhost:3000/admin](http://localhost:3000/admin) pour l'administration.

## 📁 Structure du Projet

```
├── app/
│   ├── (public)/           # Pages publiques (menu)
│   ├── admin/              # Interface admin
│   │   ├── login/
│   │   ├── dashboard/
│   │   ├── plats/
│   │   ├── categories/
│   │   └── options/
│   ├── api/auth/           # Callback auth
│   └── actions.ts          # Server Actions
├── components/
│   ├── ui/                 # Composants shadcn/ui
│   ├── menu/               # Composants menu public
│   ├── admin/              # Composants admin
│   └── layout/             # Header, Footer
├── lib/
│   ├── supabase/           # Clients Supabase
│   └── utils.ts            # Utilitaires
├── types/
│   └── database.types.ts   # Types TypeScript
├── styles/
│   └── globals.css
└── supabase/
    ├── migrations/         # Schéma SQL
    └── seed.sql            # Données initiales
```

## 🎨 Design

- **Fond principal**: Beige clair (#F5F5DC)
- **Couleur accent**: Bordeaux (#800020)
- **Police titre**: Playfair Display
- **Police texte**: Montserrat

## 📦 Scripts

```bash
npm run dev      # Développement
npm run build    # Build production
npm run start    # Démarrer en production
npm run lint     # Linter ESLint
```

## 🚀 Déploiement

### Vercel (Recommandé)

1. Connectez votre repo GitHub à Vercel
2. Ajoutez les variables d'environnement
3. Déployez !

## 📝 License

MIT
