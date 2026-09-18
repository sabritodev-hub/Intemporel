# Module de réservation Brunch — dossier d'implémentation

Dossier de référence pour **Claude Code**. Projet : `Intemporel-main` — Next.js 14 (App Router), TypeScript, Tailwind, shadcn/ui, Supabase (Postgres + Auth + Storage + RLS).

Déposer ce dossier tel quel à la racine du repo, sous `docs/reservation/`.

---

## Ordre de lecture

| # | Fichier | À lire |
|---|---|---|
| — | **`README.md`** (ce fichier) | En premier, intégralement |
| 00 | `00-regles-metier.md` | En premier, intégralement. Rien ne doit le contredire |
| 01 | `01-base-de-donnees.md` | Avant d'écrire la migration |
| 02 | `02-architecture-code.md` | Avant de créer le moindre fichier |
| 03 | `03-parcours-public.md` | Avant les écrans publics |
| 04 | `04-back-office.md` | Avant les écrans admin |
| 05 | `05-emails.md` | Avant les templates d'emails |
| 06 | `06-design-system.md` | Avant **tout** rendu visuel |
| 07 | `07-pages-legales.md` | Avant les pages légales, cookies, 404, 500 |
| 08 | `08-securite-rgpd.md` | Avant la mise en ligne. Contient une correction de l'existant |
| 09 | `09-plan-implementation.md` | Pour l'ordre des étapes et les tests |
| 10 | `10-decisions-ouvertes.md` | Décisions tranchées, et les 3 points encore ouverts (aucun bloquant) |

`maquettes/` contient les planches visuelles. Les ouvrir dans un navigateur ; `support.js` doit rester à côté.

| Maquette | Couvre |
|---|---|
| `Réservation Brunch.dc.html` | 16 écrans : public, admin, emails, pages légales |
| `Carte.dc.html` | Refonte de la page carte publique |
| `Pages légales.dc.html` | Confidentialité, CGU, cookies, 404 — **variante plus complète** |
| `DESIGN-source.md` | Relevé visuel d'origine (condensé dans `06-design-system.md`) |

---

## Ce que construit ce module

Réservation en ligne du **brunch du weekend**, sans compte client, validée automatiquement s'il reste de la place, confirmée par email, annulable par un lien reçu dans cet email. Plus un back-office pour gérer les créneaux et le service.

**Hors périmètre :** paiement, acompte, empreinte bancaire, SMS, compte client, liste d'attente, réservation d'autre chose que le brunch. Le schéma prévoit une colonne `service` pour ouvrir d'autres services plus tard sans migration.

---

## Arbitrages déjà tranchés

Le cahier des charges initial et le HANDOFF issu des maquettes divergeaient sur quelques points. Voici ce qui fait foi dans ce dossier :

| Sujet | Décision retenue | Pourquoi |
|---|---|---|
| Nom de la colonne du nombre de personnes | **`couverts`** | Le vocabulaire du métier, et celui de l'admin. L'UI publique dit « personnes », l'UI admin dit « couverts » |
| Jeton d'annulation | **Hash SHA-256 en base**, jeton en clair uniquement dans l'email | Une fuite de la base ne donne alors accès à aucune réservation |
| Unicité d'un créneau | **`(service, debut)`** | Rend la génération mensuelle idempotente même si l'heure de fin change |
| Purge à 30 jours | **Anonymisation**, pas suppression | Conserve le décompte de couverts par service, comme l'annonce la politique de confidentialité |
| Routes publiques | Segments d'URL (`/reservation/[date]/[creneauId]`) | Retenu du HANDOFF, plus propre que des query params |
| Référence client | Colonne `reference` (format `BR-7F42`) | Visible sur l'écran de confirmation maquetté, absente du schéma initial |

Et, tranché par le client le 18 septembre : coordonnées et horaires **paramétrables** par l'admin · plats sans photo en traitement **`plaque`** · rétention de table **20 minutes** · pages légales en version `Pages légales.dc.html` · correction des policies RLS **dans le périmètre**. Détail en `10-decisions-ouvertes.md`.

---

## Rien en dur

Le restaurant doit pouvoir changer un horaire, une capacité ou un numéro de téléphone **sans redéploiement et sans développeur**.

| Réglage | Où l'admin le change |
|---|---|
| Téléphone, adresse, email de contact | `/admin/settings` |
| Durée de rétention de table | `/admin/settings` |
| Ouverture des réservations en ligne | `/admin/settings` |
| Horaires et capacité de chaque service | `/admin/creneaux`, onglet Modèles |

Les valeurs des maquettes — `01 23 45 67 89`, `12 rue des Arts`, les horaires 10h00–12h00 — sont du remplissage. Aucune ne doit apparaître dans le code livré, pas même en valeur par défaut d'un composant.

---

## Trois choses à ne pas rater

1. **La concurrence.** Deux clients peuvent réserver la dernière place en même temps. L'insertion passe obligatoirement par la fonction Postgres `reserver()` qui verrouille le créneau (`select … for update`). Jamais de vérification de place côté client. Voir `01-base-de-donnees.md`.
2. **La sécurité de l'existant.** Les policies RLS actuelles traitent **tout utilisateur connecté comme un admin** (`to authenticated using (true)`). Avec des numéros de téléphone en base, c'est une faille. La migration `006` la corrige — elle n'est pas optionnelle. Voir `08-securite-rgpd.md`.
3. **Le mobile.** Les clients scannent un QR code à table. Tout doit être correct à **360 px et 320 px**, cibles tactiles ≥ 44 px. Ce n'est pas une adaptation, c'est le cas principal.

---

## Environnement de développement

Supabase local ou projet de développement séparé, jamais la base de production. Les emails partent dans **Mailpit** (faux serveur SMTP, déployable sur le Coolify existant) tant que le nom de domaine n'est pas configuré chez Resend : aucun email réel n'est envoyé pendant le développement.

Variables d'environnement : voir `02-architecture-code.md`, section « Variables d'environnement ».
