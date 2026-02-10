# Stack Technique - Site Menu Bar à Desserts

## 📋 Description du Projet

Site web servant de menu digital pour un bar à desserts avec interface d'administration complète.

### Fonctionnalités Principales

#### Interface Client (Public)
- **Page Menu** : Affichage de tous les desserts organisés par catégories
- Navigation intuitive entre les catégories
- Affichage des prix, photos et disponibilité des desserts
- Personnalisation des commandes via options (sauce, parfum, taille)
- Design élégant : fond beige clair avec textes bordeaux

#### Interface Admin (Privé)
- **Authentification sécurisée** pour l'administrateur
- **Gestion complète des desserts** :
  - Ajouter/Modifier/Supprimer des desserts
  - Gestion des photos
  - Définition des prix
  - Gestion des catégories
  - Contrôle de la disponibilité (en stock/rupture)
- **Gestion des options personnalisables** :
  - Définir les sauces disponibles
  - Définir les parfums
  - Définir les tailles
  - Associer les options aux desserts

---

## 🏗️ Architecture Technique

### Frontend

#### Framework Principal
- **Next.js 14** (App Router)
  - Server Components pour optimiser les performances
  - Image Optimization intégrée
  - SEO optimisé pour la visibilité en ligne

#### UI/UX
- **React 18**
- **TypeScript** pour la fiabilité du code
- **Tailwind CSS** pour le styling
  - Configuration personnalisée : couleurs beige clair (#F5F5DC) et bordeaux (#800020)
- **Framer Motion** pour les animations fluides
- **React Icons** pour les icônes

#### Composants UI
- **shadcn/ui** - Composants réutilisables
  - Forms avec validation
  - Dialogs et Modals
  - Data Tables pour l'admin
  - Toast notifications

### Backend

#### Plateforme Backend
- **Supabase (Version Gratuite)** - Solution complète tout-en-un
  - PostgreSQL Database hébergée (500 MB)
  - API REST et Realtime automatiquement générées
  - Storage pour les images (1 GB)
  - Authentification intégrée (50,000 utilisateurs actifs/mois)
  - Row Level Security (RLS) pour la sécurité
  - Bande passante : 2 GB/mois (largement suffisant pour un menu de bar)
  
  > **Note** : Les limites gratuites sont amplement suffisantes pour un site de menu avec interface admin

#### API
- **Supabase Client** pour les requêtes
- **Next.js Server Actions** pour la logique métier
- **Supabase Database Functions** (optionnel) pour la logique complexe

#### Base de Données
- **Supabase PostgreSQL**
  - Robuste et scalable
  - Interface d'administration web
  - Backups automatiques
  - Extensions PostgreSQL disponibles

#### ORM / Client
- **Supabase JS Client**
  - Type-safety avec TypeScript
  - Auto-génération des types depuis la DB
  - API intuitive et moderne

#### Authentification
- **Supabase Auth**
  - Authentification sécurisée pour l'admin
  - Session management automatique
  - Email/Password provider
  - Row Level Security (RLS) intégré

#### Upload d'Images
- **Supabase Storage**
  - Optimisation automatique des images
  - CDN intégré
  - Transformations à la volée
  - Policies de sécurité configurables
  - URLs publiques ou privées

---

## 📊 Modèle de Données

### Tables Principales (Supabase SQL)

```sql
-- Extension pour UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Catégories de desserts
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Desserts
CREATE TABLE desserts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image TEXT,
  available BOOLEAN DEFAULT true,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Types d'options (sauce, parfum, taille)
CREATE TABLE option_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL, -- "Sauce", "Parfum", "Taille"
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Options disponibles
CREATE TABLE options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  price_modifier DECIMAL(10, 2), -- Prix additionnel (peut être NULL)
  option_type_id UUID NOT NULL REFERENCES option_types(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Relation many-to-many entre Desserts et Options
CREATE TABLE dessert_options (
  dessert_id UUID NOT NULL REFERENCES desserts(id) ON DELETE CASCADE,
  option_id UUID NOT NULL REFERENCES options(id) ON DELETE CASCADE,
  PRIMARY KEY (dessert_id, option_id)
);

-- Administrateurs (utilise Supabase Auth, mais table supplémentaire pour profil)
CREATE TABLE admin_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Indexes pour les performances
CREATE INDEX idx_desserts_category_id ON desserts(category_id);
CREATE INDEX idx_desserts_available ON desserts(available);
CREATE INDEX idx_options_option_type_id ON options(option_type_id);
CREATE INDEX idx_dessert_options_dessert_id ON dessert_options(dessert_id);
CREATE INDEX idx_dessert_options_option_id ON dessert_options(option_id);

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Appliquer le trigger à toutes les tables
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_desserts_updated_at BEFORE UPDATE ON desserts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_option_types_updated_at BEFORE UPDATE ON option_types
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_options_updated_at BEFORE UPDATE ON options
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_profiles_updated_at BEFORE UPDATE ON admin_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Row Level Security (RLS) Policies

```sql
-- Activer RLS sur toutes les tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE desserts ENABLE ROW LEVEL SECURITY;
ALTER TABLE option_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE options ENABLE ROW LEVEL SECURITY;
ALTER TABLE dessert_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;

-- Policies pour les catégories
CREATE POLICY "Categories are viewable by everyone"
  ON categories FOR SELECT
  USING (true);

CREATE POLICY "Categories are editable by admins only"
  ON categories FOR ALL
  USING (auth.role() = 'authenticated' AND EXISTS (
    SELECT 1 FROM admin_profiles WHERE id = auth.uid()
  ));

-- Policies pour les desserts
CREATE POLICY "Desserts are viewable by everyone"
  ON desserts FOR SELECT
  USING (true);

CREATE POLICY "Desserts are editable by admins only"
  ON desserts FOR ALL
  USING (auth.role() = 'authenticated' AND EXISTS (
    SELECT 1 FROM admin_profiles WHERE id = auth.uid()
  ));

-- Policies pour option_types
CREATE POLICY "Option types are viewable by everyone"
  ON option_types FOR SELECT
  USING (true);

CREATE POLICY "Option types are editable by admins only"
  ON option_types FOR ALL
  USING (auth.role() = 'authenticated' AND EXISTS (
    SELECT 1 FROM admin_profiles WHERE id = auth.uid()
  ));

-- Policies pour options
CREATE POLICY "Options are viewable by everyone"
  ON options FOR SELECT
  USING (true);

CREATE POLICY "Options are editable by admins only"
  ON options FOR ALL
  USING (auth.role() = 'authenticated' AND EXISTS (
    SELECT 1 FROM admin_profiles WHERE id = auth.uid()
  ));

-- Policies pour dessert_options
CREATE POLICY "Dessert options are viewable by everyone"
  ON dessert_options FOR SELECT
  USING (true);

CREATE POLICY "Dessert options are editable by admins only"
  ON dessert_options FOR ALL
  USING (auth.role() = 'authenticated' AND EXISTS (
    SELECT 1 FROM admin_profiles WHERE id = auth.uid()
  ));

-- Policies pour admin_profiles
CREATE POLICY "Admin profiles are viewable by admins only"
  ON admin_profiles FOR SELECT
  USING (auth.role() = 'authenticated' AND id = auth.uid());

CREATE POLICY "Admin profiles are editable by self only"
  ON admin_profiles FOR UPDATE
  USING (auth.role() = 'authenticated' AND id = auth.uid());
```

### Types TypeScript Générés

```typescript
// Types auto-générés par Supabase CLI
export type Database = {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          order?: number
          created_at?: string
          updated_at?: string
        }
      }
      desserts: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          price: number
          image: string | null
          available: boolean
          category_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          price: number
          image?: string | null
          available?: boolean
          category_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          price?: number
          image?: string | null
          available?: boolean
          category_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      // ... autres tables
    }
  }
}
```

---

## 🎨 Design System

### Palette de Couleurs

```css
:root {
  --beige-light: #F5F5DC;      /* Fond principal */
  --beige-darker: #E8E8CC;     /* Nuances */
  --bordeaux: #800020;          /* Texte principal */
  --bordeaux-light: #A0223B;    /* Hover states */
  --bordeaux-dark: #600018;     /* Accent */
  --white: #FFFFFF;
  --shadow: rgba(128, 0, 32, 0.1);
}
```

### Typographie
- **Font principale** : Playfair Display (élégant, serif)
- **Font secondaire** : Montserrat (moderne, sans-serif)

---

## 🔐 Sécurité

- **Row Level Security (RLS)** avec Supabase pour la protection des données
- **Supabase Auth** avec sessions sécurisées
- Validation des données avec **Zod**
- Protection CSRF intégrée dans Next.js
- Variables d'environnement pour les secrets
- Sanitisation des inputs utilisateur
- HTTPS obligatoire en production
- **Storage Policies** pour sécuriser l'accès aux images
- Rate limiting via Supabase (selon le plan)

---

## 💡 Optimisations pour Supabase Gratuit

### Limites du Plan Gratuit
- **Database** : 500 MB (suffisant pour ~1000-2000 desserts)
- **Storage** : 1 GB (environ 500-1000 images optimisées)
- **Bande passante** : 2 GB/mois
- **Authentification** : 50,000 utilisateurs actifs/mois
- **Pas de backups automatiques** (faire des exports manuels)

### Stratégies d'Optimisation

#### 1. Optimisation des Images
```javascript
// Compresser et redimensionner les images avant upload
// Utiliser sharp ou browser-image-compression

// Exemple dans le composant ImageUpload
const optimizeImage = async (file: File): Promise<File> => {
  const options = {
    maxSizeMB: 0.5,          // Max 500KB par image
    maxWidthOrHeight: 1200,   // Max 1200px
    useWebWorker: true,
    fileType: 'image/webp'    // Format WebP pour meilleure compression
  };
  
  return await imageCompression(file, options);
};
```

#### 2. Lazy Loading des Images
```typescript
// Utiliser Next.js Image avec lazy loading
import Image from 'next/image';

<Image
  src={dessert.image}
  alt={dessert.name}
  width={400}
  height={300}
  loading="lazy"
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>
```

#### 3. Caching Stratégique
```typescript
// Cache les données publiques côté client
// Utiliser React Query ou SWR pour le caching

import { useQuery } from '@tanstack/react-query';

const { data: desserts } = useQuery({
  queryKey: ['desserts'],
  queryFn: fetchDesserts,
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 30 * 60 * 1000, // 30 minutes
});
```

#### 4. Pagination et Limites
```typescript
// Paginer les résultats pour réduire la bande passante
const { data, error } = await supabase
  .from('desserts')
  .select('*')
  .range(0, 19); // Charger seulement 20 desserts à la fois
```

#### 5. Compression des Réponses
```typescript
// Next.js compresse automatiquement les réponses
// S'assurer que gzip est activé (par défaut sur Vercel)
```

#### 6. Storage Bucket Configuration
```sql
-- Limiter la taille des fichiers uploadés
-- Politique de Storage dans Supabase Dashboard

-- Bucket "desserts-images" :
-- - Max file size: 2 MB
-- - Allowed MIME types: image/jpeg, image/png, image/webp
-- - Public: true (pour affichage direct)
```

#### 7. Nettoyage Régulier
```typescript
// Script de nettoyage des images non utilisées
// À exécuter manuellement ou via cron job

const cleanUnusedImages = async () => {
  // 1. Récupérer toutes les images dans Storage
  const { data: files } = await supabase
    .storage
    .from('desserts-images')
    .list();
  
  // 2. Récupérer toutes les images référencées en DB
  const { data: desserts } = await supabase
    .from('desserts')
    .select('image');
  
  // 3. Supprimer les images orphelines
  const usedImages = new Set(desserts.map(d => d.image));
  const toDelete = files.filter(f => !usedImages.has(f.name));
  
  // Supprimer les fichiers non utilisés
  await supabase.storage
    .from('desserts-images')
    .remove(toDelete.map(f => f.name));
};
```

#### 8. Monitoring de l'Usage
```typescript
// Dashboard pour surveiller l'utilisation
// Via Supabase Dashboard > Settings > Usage

// Créer des alertes personnalisées :
// - Storage > 800 MB (80%)
// - Bandwidth > 1.6 GB (80%)
```

### Recommandations Spécifiques

#### Format des Images
- **Format recommandé** : WebP (meilleure compression)
- **Fallback** : JPEG pour compatibilité
- **Résolution** : Max 1200x900px pour photos de desserts
- **Taille cible** : 200-500 KB par image

#### Stratégie de Données
- **Soft delete** : Marquer comme deleted au lieu de supprimer (pour historique)
- **Archives** : Exporter les anciennes données tous les mois
- **Backups manuels** : Export SQL hebdomadaire via Supabase CLI

```bash
# Backup manuel de la base de données
supabase db dump > backup-$(date +%Y%m%d).sql
```

### Migration vers Plan Payant (si nécessaire)

Si vous atteignez les limites :
- **Pro Plan** : $25/mois
  - 8 GB Database
  - 100 GB Storage
  - 50 GB Bandwidth
  - Backups automatiques (7 jours)
  - Support prioritaire

Pour votre projet de menu de bar, **le plan gratuit devrait suffire largement** pendant plusieurs mois, voire années selon le volume.

---

## 📱 Responsive Design

- Mobile First approach
- Breakpoints Tailwind :
  - `sm`: 640px (tablettes)
  - `md`: 768px (tablettes landscape)
  - `lg`: 1024px (desktop)
  - `xl`: 1280px (large desktop)

---

## 🚀 Déploiement

### Plateforme Recommandée
- **Vercel** (optimisé pour Next.js) - **Plan Gratuit Hobby**
  - CI/CD automatique depuis GitHub
  - Preview deployments pour chaque PR
  - Edge Functions
  - Analytics intégré
  - SSL automatique
  - Compatible avec Supabase gratuit

### Configuration Vercel + Supabase (Gratuit)
```bash
# 1. Connecter le repo GitHub à Vercel
# 2. Ajouter les variables d'environnement dans Vercel Dashboard
# 3. Deploy automatique à chaque push

# Variables d'environnement Vercel :
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

### Stack 100% Gratuit
- ✅ **Supabase Free** : Database + Auth + Storage
- ✅ **Vercel Hobby** : Hébergement Next.js
- ✅ **Total : 0€/mois** 🎉

### Alternatives Gratuites
- **Netlify** (plan gratuit)
- **Cloudflare Pages** (plan gratuit)
- **Railway** (plan gratuit avec limitations)

---

## 📦 Structure des Dossiers

```
/
├── app/
│   ├── (public)/
│   │   ├── page.tsx              # Page d'accueil/menu
│   │   └── layout.tsx
│   ├── admin/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── desserts/
│   │   │   ├── page.tsx          # Liste desserts
│   │   │   ├── new/
│   │   │   │   └── page.tsx      # Nouveau dessert
│   │   │   └── [id]/
│   │   │       └── edit/
│   │   │           └── page.tsx  # Éditer dessert
│   │   ├── categories/
│   │   │   └── page.tsx
│   │   ├── options/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── api/
│   │   └── auth/
│   │       └── callback/         # Supabase auth callback
│   │           └── route.ts
│   └── layout.tsx
├── components/
│   ├── ui/                        # shadcn components
│   ├── menu/
│   │   ├── CategoryFilter.tsx
│   │   ├── DessertCard.tsx
│   │   └── DessertModal.tsx
│   └── admin/
│       ├── DessertForm.tsx
│       ├── OptionManager.tsx
│       └── ImageUpload.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts              # Supabase client (browser)
│   │   ├── server.ts              # Supabase client (server)
│   │   └── middleware.ts          # Auth middleware
│   └── utils.ts
├── supabase/
│   ├── migrations/                 # Migrations SQL
│   │   └── 001_initial_schema.sql
│   └── seed.sql                    # Données de départ
├── types/
│   └── database.types.ts           # Types générés par Supabase
├── public/
│   └── images/
├── styles/
│   └── globals.css
└── package.json
```

---

## 🛠️ Installation et Setup

### Prérequis
- Node.js 18+
- npm ou pnpm
- Compte Supabase (gratuit sur supabase.com)
- Supabase CLI (optionnel mais recommandé)

### Setup Supabase

1. **Créer un projet sur Supabase.com**
   - Aller sur https://supabase.com
   - Créer un nouveau projet
   - Noter l'URL et les clés API

2. **Installer Supabase CLI (optionnel)**
```bash
npm install -g supabase
# ou
brew install supabase/tap/supabase
```

3. **Initialiser Supabase localement**
```bash
supabase init
supabase login
supabase link --project-ref votre-projet-ref
```

### Commandes Projet

```bash
# Installation des dépendances
npm install

# Lancer le projet en développement
npm run dev

# Générer les types TypeScript depuis Supabase
npx supabase gen types typescript --project-id "votre-project-id" > types/database.types.ts

# Appliquer les migrations SQL (via Supabase Dashboard ou CLI)
supabase db push

# Build production
npm run build
npm start
```

### Variables d'Environnement

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://votre-projet.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="votre-anon-key-publique"
SUPABASE_SERVICE_ROLE_KEY="votre-service-role-key" # Privé, server-side uniquement

# URL du site
NEXT_PUBLIC_SITE_URL="http://localhost:3000"

# Storage Bucket pour les images
NEXT_PUBLIC_STORAGE_BUCKET="desserts-images"
```

---

## 📝 Dépendances Principales

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "typescript": "^5.3.0",
    "@supabase/supabase-js": "^2.39.0",
    "@supabase/ssr": "^0.0.10",
    "tailwindcss": "^3.4.0",
    "framer-motion": "^10.16.0",
    "zod": "^3.22.0",
    "react-hook-form": "^7.49.0",
    "@hookform/resolvers": "^3.3.0",
    "react-icons": "^4.12.0",
    "react-dropzone": "^14.2.3",
    "browser-image-compression": "^2.0.2",
    "@tanstack/react-query": "^5.17.0"
  },
  "devDependencies": {
    "supabase": "^1.129.0",
    "@types/node": "^20.10.0",
    "@types/react": "^18.2.0",
    "eslint": "^8.56.0",
    "eslint-config-next": "^14.0.0",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32"
  }
}
```

---

## 🎯 Roadmap de Développement

### Phase 1 : Setup (Semaine 1)
- [ ] Créer compte et projet Supabase
- [ ] Initialiser le projet Next.js 14
- [ ] Configurer Tailwind avec thème personnalisé (beige/bordeaux)
- [ ] Installer Supabase CLI et configurer les clients
- [ ] Setup des variables d'environnement

### Phase 2 : Base de Données (Semaine 2)
- [ ] Créer les tables SQL dans Supabase
- [ ] Configurer Row Level Security (RLS)
- [ ] Créer les triggers et fonctions
- [ ] Générer les types TypeScript
- [ ] Setup Supabase Auth pour l'admin
- [ ] Créer Storage Bucket pour les images

### Phase 3 : Interface Admin (Semaine 3)
- [ ] Page de login admin
- [ ] Dashboard admin avec statistiques
- [ ] CRUD complet des desserts
- [ ] Gestion des catégories
- [ ] Gestion des options (sauces, parfums, tailles)
- [ ] Upload d'images via Supabase Storage

### Phase 4 : Interface Client (Semaine 4)
- [ ] Page menu publique avec design beige/bordeaux
- [ ] Filtres par catégories
- [ ] Cards desserts avec photos optimisées
- [ ] Modal de personnalisation des options
- [ ] Responsive design (mobile-first)
- [ ] Animations avec Framer Motion

### Phase 5 : Polish & Deploy (Semaine 5)
- [ ] Optimisation des images (compression WebP)
- [ ] Setup React Query pour le caching
- [ ] Tests de sécurité RLS
- [ ] Optimisation des performances
- [ ] SEO et métadonnées
- [ ] Configuration Storage Policies (limites de taille)
- [ ] Déploiement sur Vercel (gratuit)
- [ ] Test de la bande passante et monitoring Supabase
- [ ] Documentation backup manuel
- [ ] Configuration du domaine personnalisé (optionnel)

---

## 📞 Support & Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Supabase Storage](https://supabase.com/docs/guides/storage)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com)

---

**Dernière mise à jour** : Février 2026
