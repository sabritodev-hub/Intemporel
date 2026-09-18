# DESIGN.md — référence visuelle

À lire par Claude Code **avant de reproduire un écran**. Tout ce qui suit est relevé directement des maquettes de ce dossier : aucune valeur n'est approximative.

Les maquettes sont écrites en styles inline pour être lisibles telles quelles. À l'implémentation, tout passe en classes Tailwind avec les tokens ci-dessous.

---

## 1. Couleurs

### Déjà dans `tailwind.config.ts`

| Token | Hex | Usage |
|---|---|---|
| `bordeaux` | `#800020` | Couleur d'identité : en-tête, boutons primaires, titres, prix |
| `beige` | `#F5F5DC` | Fond de page, texte sur bordeaux |
| `beige-darker` | `#E8E8CC` | Fond de section secondaire, encarts, pied de page, pistes de jauges |

### À ajouter (états de disponibilité)

```ts
dispo:   "#3F6B4A", // disponible
presque: "#9A6B1F", // < 20 % de places restantes
complet: "#800020", // identique à bordeaux
ferme:   "#8A8778", // fermé / passé / annulé
```

Utilisées à l'identique côté client et côté admin. `ferme` sert aux **fonds, bordures et pastilles**, jamais au texte courant : le contraste est insuffisant.

### Valeurs de service (à ajouter comme tokens plutôt que répétées)

| Hex | Rôle |
|---|---|
| `#600018` | Survol des boutons bordeaux |
| `#A0223B` | Sur-titres, petites capitales, survol de lien |
| `#7d4152` | **Texte secondaire — le seul autorisé.** Descriptions, légendes, libellés de tableau |
| `#6b2135` | Texte de paragraphe long (pages légales, corps d'email) |
| `#ffffff` | Fond de carte, fond de champ |
| `#FBFAF0` | Fond d'en-tête de tableau, fond de bloc dans un panneau |
| `#EFEDDB` | Fond de carte désactivée / complète |
| `#e2dcc0` `#d9d4b4` `#cfc9a8` | Bordures, du plus clair au plus marqué |
| `#f0ead4` `#eee7cf` | Séparateurs internes (lignes de tableau, filets de carte) |

**Règle de contraste** : tout texte est à `#800020`, `#6b2135` ou `#7d4152`. Jamais de gris désaturé, jamais d'opacité sur un bloc de texte.

---

## 2. Typographie

| Rôle | Fonte | Graisse | Taille |
|---|---|---|---|
| Titre de page | Playfair Display | 600 | `clamp(32px, 7.5vw, 48px)` — carte : jusqu'à 58px |
| Titre de section | Playfair Display | 600 | `clamp(20px, 4.5vw, 25px)` |
| Nom de plat, titre de carte | Playfair Display | 600 | 19px |
| Chiffre mis en avant (prix, heure, 404) | Playfair Display | 600 | 21 → 150px selon le contexte |
| Corps de texte | Montserrat | 400 | 14px, `line-height: 1.75` |
| Texte de carte | Montserrat | 400 | 12,5px, `line-height: 1.6` |
| Libellé, bouton | Montserrat | 600 | 13–14px |
| Sur-titre | Montserrat | 400 | 10–11px, `letter-spacing: .18em`–`.24em`, majuscules, couleur `#A0223B` |
| Légende | Montserrat | 400 | 12px, couleur `#7d4152` |

`text-wrap: pretty` sur tous les paragraphes et titres longs.

**Minimum absolu** : 12px. Les 9,5–11px des maquettes sont réservés aux sur-titres en majuscules espacées, jamais à du texte à lire.

---

## 3. Formes et espacement

| Élément | Rayon |
|---|---|
| Carte, panneau, bloc de contenu | 12–14px |
| Bouton, champ | 9–11px |
| Pastille de filtre, badge, interrupteur | `999px` |
| Modal | 15px |
| Cadre de téléphone (maquettes uniquement) | 34px, bordure 9px `#2a2622` |

- Padding de carte : 16–17px · de section : `clamp(18px, 4vw, 24px)` · de page : `clamp(14px, 4vw, 24px)`
- Gaps : 8px (boutons groupés), 12–14px (éléments de carte), 22px (grille), `clamp(22px, 4vw, 34px)` (sections de document)
- Largeur de contenu : **1180px** pour les pages larges et l'admin, **860px** pour la lecture (pages légales), **520px** pour les emails
- Ombres, uniquement sur élément flottant : carte au survol `0 16px 34px rgba(128,0,32,.14)` · modal / bandeau `0 18px 44px rgba(60,20,30,.24)`

---

## 4. Composants — recettes exactes

### Bouton primaire

Fond `bordeaux`, texte `beige`, rayon 10px, padding 14–16px, poids 600, `min-height: 48px`. Survol : fond `#600018`.

### Bouton secondaire

Fond transparent, bordure 1px `bordeaux`, texte `bordeaux`. Survol : fond `bordeaux`, texte `beige` (inversion complète, pas un simple changement de teinte).

### Bouton tertiaire

Bordure `#d9d4b4`, texte `#7d4152`. Survol : bordure et texte passent à `bordeaux`.

### Pastille de filtre

Rayon `999px`, padding `9px 16px`, `min-height: 44px`, `white-space: nowrap`, `flex: none`. Inactive : bordure `rgba(128,0,32,.22)`, fond transparent, texte `bordeaux`. Active : fond `bordeaux`, texte `beige`. Le compteur suit le libellé à `font-size: 11px; opacity: .6`.

La rangée de pastilles est en **défilement horizontal** (`overflow-x: auto; flex-wrap: nowrap; scrollbar-width: none`), jamais en retour à la ligne : en mobile, un wrap consomme trois lignes de hauteur d'écran.

### Jauge de remplissage

Piste : hauteur 6–9px, rayon `999px`, fond `beige-darker`. Remplissage : largeur en pourcentage, couleur = état (`dispo` / `presque` / `complet`). Toujours accompagnée d'un texte chiffré en clair dessous (« 12 couverts réservés sur 30 ») — la couleur seule n'est pas une information accessible.

### Badge d'état

`font-size: 10,5–11px`, poids 600, `letter-spacing: .06em`, majuscules, rayon `999px`, padding `5px 10px`. Deux variantes : bordure + texte de la couleur d'état (sur fond clair), ou fond teinté + texte de la couleur d'état (dans un tableau).

Fonds de badge en tableau : `#EAF0EA` (dispo) · `#F5EFE0` (presque) · `#F3E7EA` (bordeaux) · `#EFEDDB` (fermé).

### Interrupteur

Piste 42×24px rayon `999px`, pastille 18px blanche décalée de 3px ou 21px. Actif `dispo`, inactif `#d9d4b4`, actif-mais-verrouillé `#b79aa2` avec `cursor: not-allowed`. Toujours doublé d'un libellé texte « Activé / Désactivé ».

### Champ de formulaire

Fond `#ffffff`, bordure 1px `#d9d4b4`, rayon 10px, padding `13px 12px`, `min-height: 48px`. En erreur : bordure 1,5px `bordeaux` + message sous le champ en `font-size: 11px`, poids 600, couleur `bordeaux`.

### En-tête de site

Collant, hauteur **fixe 60px**, fond `bordeaux`, `flex-wrap: nowrap`. Logo en Playfair 700 `clamp(17px, 4.6vw, 20px)` avec `text-overflow: ellipsis`. À droite : un lien secondaire puis le bouton « Réserver » en fond `beige` / texte `bordeaux`, `flex: none`.

La hauteur doit rester constante : la barre de filtres se colle à `top: 60px`. Un en-tête qui passe à deux lignes en mobile provoque un chevauchement au scroll.

On ne met pas de lien vers la page courante dans la nav.

### Pied de page

Celui du repo (`components/layout/Footer.tsx`) : centré, fond `beige-darker`, nom en Playfair 20px, baseline « Un moment de douceur hors du temps », copyright. Sur les pages légales s'ajoute une seule rangée : Mentions légales · Confidentialité · CGU · **Gérer les cookies**.

### Cadre de téléphone

Présent uniquement dans les planches de maquettes pour situer le contexte mobile. **Ne pas implémenter.** Le contenu, lui, est à 390px de large.

---

## 5. Le motif central : bandeau de tête homogène

C'est le parti pris principal de la refonte de la carte, et le seul point à ne pas rater.

Toutes les cartes de plat partagent un bandeau de tête **au ratio 16/10**, avec la même bordure basse `#e2dcc0` et le même rythme interne. Seul son contenu change :

- **avec photo** → l'image
- **sans photo** → une plaque typographique : filet de 26×1px `rgba(128,0,32,.35)`, texte en Playfair 600 `#800020`, mention en majuscules espacées `#A0223B`, second filet. Fond `beige` avec rayures à 135° `rgba(128,0,32,.055)`, ou `#FBFAF0` uni pour le monogramme.

La grille reste ainsi parfaitement alignée, et un plat sans photo se lit comme un **choix éditorial**, pas comme un fichier manquant.

**Interdit** : tout placeholder de type « photo non disponible », carré gris, icône d'image cassée.

Trois variantes de plaque sont maquettées (`plaque` / `prix` / `monogramme`) — le client doit en retenir une avant l'implémentation.

**Plat épuisé** : `filter: saturate(.35)` sur le **bandeau seul** + badge « Épuisé » en haut à gauche. Le texte de la carte garde son contraste plein — on ne baisse jamais l'opacité de la carte entière.

---

## 6. Règles responsive

Le client scanne un QR code à table : le mobile est le cas principal, pas une adaptation.

- Une seule page fluide, pas de version mobile séparée à maintenir.
- Marges, titres et espacements en `clamp()`.
- Grille : `repeat(auto-fill, minmax(min(100%, 262px), 1fr))`. Le `min(100%, …)` est indispensable, sinon débordement horizontal sous 300px.
- Rangées de filtres et d'onglets : défilement horizontal.
- Toute cible tactile ≥ 44px ; boutons de formulaire à 48px.
- Vérifier à **360px et 320px** : aucun débordement horizontal, aucun chevauchement d'élément collant.
- Les seules largeurs fixes autorisées sont les formats d'export : emails (520–600px) et planches de maquettes.

---

## 7. Ton de la copie

Français, vouvoiement, phrases courtes. On explique la contrainte au lieu de l'énoncer sèchement, et chaque impasse propose une sortie.

| À éviter | Préférer |
|---|---|
| « Erreur : créneau indisponible » | « Ce créneau vient d'être complété. Choisir un autre horaire. » |
| « Maximum 12 couverts » | « Pour un groupe de plus de 12 personnes, contactez-nous par téléphone. » |
| « Annulation impossible » | « Votre service commence dans moins de 24 h : appelez-nous, nous nous en occupons. » |
| « 404 — Page non trouvée » | « Cette page a quitté la carte. » |

Un numéro de téléphone est **toujours** un lien `tel:`, jamais du texte simple.

Pas d'emoji, pas d'icône décorative, pas d'illustration SVG dessinée à la main. La hiérarchie est portée par la typographie et les filets.
