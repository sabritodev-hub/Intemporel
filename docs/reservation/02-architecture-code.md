# 02 — Architecture du code

## Réutiliser, ne pas recréer

Ces briques existent et sont fonctionnelles :

| Existant | Usage |
|---|---|
| `components/ui/*` | shadcn/ui : button, card, dialog, input, label, select, switch, checkbox, toast, slider, textarea |
| `lib/supabase/client.ts` | Client navigateur |
| `lib/supabase/server.ts` | Client serveur (cookies) |
| `lib/supabase/middleware.ts` | Rafraîchissement de session |
| `lib/utils.ts` | `cn()`, `slugify()` |
| `app/admin/layout.tsx` | Sidebar bordeaux + déconnexion |
| `components/layout/Header.tsx` | En-tête public |
| `components/layout/Footer.tsx` | Pied de page |
| `app/actions.ts` | Server actions existantes (plats, catégories, options) |
| `tailwind.config.ts` | Tokens `bordeaux`, `beige`, `beige-darker`, `font-playfair`, `font-montserrat` |

Ne pas dupliquer un composant shadcn, ne pas créer un second client Supabase navigateur, ne pas réécrire la sidebar.

---

## Arborescence à créer

```
app/
├── (public)/
│   ├── reservation/
│   │   ├── page.tsx                          # 1-2 · calendrier mois/semaine
│   │   ├── [date]/
│   │   │   ├── page.tsx                      # 3 · choix du créneau
│   │   │   └── [creneauId]/page.tsx          # 4 · formulaire
│   │   ├── confirmation/[id]/
│   │   │   ├── page.tsx                      # 5 · confirmation
│   │   │   └── calendrier.ics/route.ts       # export .ics
│   │   ├── annuler/page.tsx                  # 6 · 4 états conditionnels
│   │   └── actions.ts                        # server actions publiques
│   ├── confidentialite/page.tsx
│   └── cgu/page.tsx
├── admin/
│   ├── reservations/
│   │   ├── page.tsx
│   │   ├── ReservationsClient.tsx
│   │   └── actions.ts
│   └── creneaux/
│       ├── page.tsx
│       ├── ModelesTab.tsx
│       ├── CalendrierTab.tsx
│       ├── AnnulerCreneauModal.tsx
│       └── actions.ts
└── not-found.tsx / error.tsx

components/
├── reservation/
│   ├── CalendrierMois.tsx
│   ├── CalendrierSemaine.tsx
│   ├── CreneauCard.tsx
│   ├── SelecteurCouverts.tsx
│   ├── FormulaireReservation.tsx
│   └── JaugeRemplissage.tsx           # partagé public ↔ admin
├── admin/
│   ├── ReservationsTable.tsx          # desktop
│   ├── ReservationsCartes.tsx         # mobile / salle
│   └── WidgetBrunch.tsx
└── legal/
    ├── BandeauCookies.tsx
    └── PanneauCookies.tsx

lib/
├── supabase/admin.ts                  # client service role
├── reservation/
│   ├── token.ts                       # génération + hash
│   ├── reference.ts                   # BR-7F42
│   ├── dates.ts                       # formatage Europe/Paris
│   ├── telephone.ts                   # normalisation E.164
│   ├── schemas.ts                     # zod
│   ├── erreurs.ts                     # code SQL → message FR
│   ├── etats.ts                       # places restantes → dispo/presque/complet/ferme
│   ├── rate-limit.ts
│   ├── turnstile.ts
│   └── ics.ts
├── email/
│   ├── envoyer.ts                     # transport Resend ou SMTP
│   └── templates/
│       ├── Confirmation.tsx
│       ├── AnnulationClient.tsx
│       └── AnnulationRestaurant.tsx
└── config.ts                          # lecture de site_config
```

---

## Dépendances à ajouter

```bash
npm i resend @react-email/components libphonenumber-js
npm i -D @types/nodemailer nodemailer     # transport Mailpit en dev
```

`zod` et `react-hook-form` sont déjà présents.

---

## Variables d'environnement

À ajouter dans `.env.example` **et** dans Vercel/Coolify :

```bash
# Supabase (NEXT_PUBLIC_* et SUPABASE_SERVICE_ROLE_KEY existent déjà)

# Emails
EMAIL_TRANSPORT=smtp                 # "smtp" en dev (Mailpit), "resend" en prod
RESEND_API_KEY=
EMAIL_FROM="L'Intemporel <reservations@VOTRE-DOMAINE.fr>"
SMTP_HOST=localhost                  # Mailpit
SMTP_PORT=1025

# Anti-robot
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=

# Divers
RATE_LIMIT_SEL=                       # chaîne aléatoire, sel du hash d'IP
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

`SUPABASE_SERVICE_ROLE_KEY` ne doit **jamais** franchir la frontière serveur. Le fichier qui l'utilise commence par `import "server-only";`.

---

## Client service role

```ts
// lib/supabase/admin.ts
import "server-only";
import { createClient } from "@supabase/supabase-js";

export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}
```

Utilisé **uniquement** pour les cinq appels `rpc` qui doivent contourner la RLS : `reserver`, `consulter_par_token`, `annuler_par_token`, et les envois d'emails qui ont besoin de l'adresse. Tout le reste passe par `lib/supabase/server.ts`.

---

## Jeton d'annulation

```ts
// lib/reservation/token.ts
import "server-only";
import { randomBytes, createHash } from "crypto";

export function genererToken() {
  const token = randomBytes(32).toString("base64url");   // 43 caractères
  return { token, hash: hasher(token) };
}

export function hasher(token: string) {
  return createHash("sha256").update(token).digest("hex");
}
```

Le jeton en clair part dans l'email et n'est **jamais** écrit en base ni journalisé. Une fuite de la base ne permet donc d'annuler aucune réservation.

---

## Référence client

```ts
// lib/reservation/reference.ts
const ALPHABET = "ACDEFGHJKLMNPQRTUVWXY3479";  // ni 0/O, ni 1/I, ni S/5, ni 8/B

export function genererReference() {
  const c = Array.from({ length: 4 }, () =>
    ALPHABET[Math.floor(Math.random() * ALPHABET.length)]
  ).join("");
  return `BR-${c}`;
}
```

Lisible au téléphone. En cas de collision (contrainte `unique`), réessayer trois fois avant d'échouer.

---

## Téléphone

Stocké en **E.164** (`+33612345678`), affiché au format français (`06 12 34 56 78`), toujours cliquable en `tel:`.

```ts
// lib/reservation/telephone.ts
import { parsePhoneNumberFromString } from "libphonenumber-js";

export function normaliser(saisie: string): string | null {
  const t = parsePhoneNumberFromString(saisie, "FR");
  return t?.isValid() ? t.number : null;     // +33612345678
}

export function afficher(e164: string): string {
  const t = parsePhoneNumberFromString(e164);
  return t?.formatNational() ?? e164;        // 06 12 34 56 78
}
```

---

## Dates

Jamais de `new Date().toLocaleString()` sans fuseau : le serveur tourne en UTC, le client en local, et l'affichage diverge.

```ts
// lib/reservation/dates.ts
const TZ = "Europe/Paris";

export const jourLong = (d: Date) =>
  new Intl.DateTimeFormat("fr-FR",
    { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: TZ }
  ).format(d);                                  // samedi 19 septembre 2026

export const heure = (d: Date) =>
  new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit", timeZone: TZ })
    .format(d).replace(":", "h");               // 10h00

export const plage = (debut: Date, fin: Date) => `${heure(debut)} – ${heure(fin)}`;

/** Clé de date locale, pour les segments d'URL /reservation/2026-09-19 */
export const cleJour = (d: Date) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(d);   // 2026-09-19
```

---

## États d'un créneau

Un seul endroit décide de la couleur, côté public comme côté admin :

```ts
// lib/reservation/etats.ts
export type Etat = "dispo" | "presque" | "complet" | "ferme";

export function etatCreneau(c: {
  places_restantes: number; capacite: number;
  statut: string; reservable: boolean; journee_close: boolean;
}): Etat {
  if (c.statut !== "ouvert" || c.journee_close) return "ferme";
  if (c.places_restantes <= 0) return "complet";
  if (c.places_restantes / c.capacite < 0.2) return "presque";   // seuil : 20 %
  return "dispo";
}
```

L'état d'une **journée** est le meilleur état de ses créneaux : un jour dont un service est complet mais l'autre disponible est `dispo`.

---

## Traduction des erreurs

Les fonctions Postgres lèvent des codes en majuscules. Un seul endroit les traduit, dans le ton décrit en `06-design-system.md` (expliquer la contrainte, proposer une sortie) :

```ts
// lib/reservation/erreurs.ts
export const MESSAGES: Record<string, string> = {
  COMPLET:               "Ce créneau vient d'être complété. Choisissez un autre horaire.",
  CRENEAU_INDISPONIBLE:  "Ce créneau n'est plus proposé à la réservation.",
  RESERVATIONS_CLOSES:   "Les réservations de cette journée sont closes : le premier service a commencé.",
  HORS_PERIODE:          "Les réservations ouvrent le mois précédant le service.",
  COUVERTS_INVALIDE:     "Pour un groupe de plus de 12 personnes, contactez-nous par téléphone.",
  CHAMPS_MANQUANTS:      "Merci de compléter tous les champs.",
  TOKEN_INVALIDE:        "Ce lien n'est plus valable.",
  DEJA_ANNULEE:          "Cette réservation a déjà été annulée.",
  DELAI_DEPASSE:         "Votre service commence dans moins de 24 h : appelez-nous, nous nous en occupons.",
  NON_AUTORISE:          "Action réservée à l'administration.",
  MOTIF_REQUIS:          "Indiquez le motif : il sera repris dans l'email envoyé aux clients.",
};

export function messageErreur(e: unknown): string {
  const brut = (e as { message?: string })?.message ?? "";
  const code = brut.split(":")[0].trim();
  if (code === "CAPACITE_TROP_BASSE") {
    const n = brut.split(":")[1]?.trim();
    return `${n} couverts déjà réservés : la capacité ne peut pas descendre sous ${n}.`;
  }
  return MESSAGES[code] ?? "Une erreur est survenue. Réessayez ou appelez-nous.";
}
```

---

## Server action de réservation — enchaînement exact

```
1. zod          → nom 2-80, email, téléphone normalisable FR, couverts 1-12,
                  consentement true, honeypot vide
2. honeypot     → champ caché non vide ⇒ renvoyer un faux succès, ne rien insérer
3. turnstile    → POST https://challenges.cloudflare.com/turnstile/v0/siteverify
4. rate limit   → 5 tentatives / 10 min / hash d'IP, sinon erreur douce
5. token        → genererToken(), reference → genererReference()
6. rpc reserver → client service role. Erreur ⇒ messageErreur(), aucun email
7. email        → HORS du chemin critique : try/catch, échec journalisé,
                  la réservation reste valide
8. redirect     → /reservation/confirmation/[id]
```

**L'étape 7 ne doit jamais faire échouer l'étape 6.** Si Resend est indisponible, le client a bien sa table : on l'affiche et on lui dit de noter sa référence.

L'inverse est vrai aussi : si l'étape 6 échoue, **aucun email ne part**.

---

## Revalidation

Les pages publiques de réservation lisent des disponibilités qui changent à la minute. Ne pas mettre de `revalidate` long dessus :

```ts
export const dynamic = "force-dynamic";   // pages /reservation/*
```

La page carte, elle, garde son `revalidate = 60` actuel.

Après une action admin, `revalidatePath()` sur `/admin/reservations`, `/admin/creneaux`, `/admin/dashboard` et `/reservation`.
