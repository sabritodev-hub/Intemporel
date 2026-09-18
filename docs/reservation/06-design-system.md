# 06 — Design system

Relevé directement des maquettes : aucune valeur ci-dessous n'est approximative. Version détaillée d'origine dans `maquettes/DESIGN-source.md`.

Les maquettes sont écrites en styles inline pour être lisibles telles quelles. À l'implémentation, **tout passe en classes Tailwind** avec les tokens ci-dessous. Pas de hex en dur dans les composants.

---

## 1. Couleurs

### Déjà dans `tailwind.config.ts`

| Token | Hex | Usage |
|---|---|---|
| `bordeaux` | `#800020` | Identité : en-tête, boutons primaires, titres, prix |
| `beige` | `#F5F5DC` | Fond de page, texte sur bordeaux |
| `beige-darker` | `#E8E8CC` | Sections secondaires, encarts, pied de page, pistes de jauges |

### À ajouter — états de disponibilité

```ts
// tailwind.config.ts › theme.extend.colors
dispo:   "#3F6B4A",   // disponible
presque: "#9A6B1F",   // < 20 % de places restantes
complet: "#800020",   // = bordeaux
ferme:   "#8A8778",   // fermé / passé / annulé
```

Utilisées **à l'identique** côté client et côté admin : un créneau presque complet est ocre partout.

`ferme` sert aux fonds, bordures et pastilles, **jamais au texte courant** — son contraste est insuffisant. Exception admise : un libellé déjà désactivé et redondant avec un autre signal (l'horaire d'un créneau complet, à côté du mot « Complet »).

### Valeurs de service — à ajouter comme tokens

| Hex | Rôle | Nom suggéré |
|---|---|---|
| `#600018` | Survol des boutons bordeaux | `bordeaux-dark` |
| `#A0223B` | Sur-titres, petites capitales, survol de lien | `bordeaux-light` |
| `#7d4152` | **Texte secondaire — le seul autorisé** | `encre-secondaire` |
| `#6b2135` | Texte de paragraphe long (pages légales, emails) | `encre-longue` |
| `#FBFAF0` | En-tête de tableau, bloc dans un panneau | `creme` |
| `#EFEDDB` | Carte désactivée ou complète | `beige-eteint` |
| `#e2dcc0` `#d9d4b4` `#cfc9a8` | Bordures, du plus clair au plus marqué | `bordure-1/2/3` |
| `#f0ead4` `#eee7cf` | Séparateurs internes | `filet-1/2` |

**Règle de contraste.** Tout texte est en `bordeaux`, `#6b2135` ou `#7d4152`. Jamais de gris désaturé, jamais d'opacité appliquée à un bloc de texte.

---

## 2. Typographie

| Rôle | Fonte | Graisse | Taille |
|---|---|---|---|
| Titre de page | Playfair Display | 600 | `clamp(32px, 7.5vw, 48px)` — carte jusqu'à 58 px |
| Titre de section | Playfair Display | 600 | `clamp(20px, 4.5vw, 25px)` |
| Nom de plat, titre de carte | Playfair Display | 600 | 19 px |
| Chiffre mis en avant (prix, heure, 404) | Playfair Display | 600 | 21 → 150 px selon contexte |
| Corps de texte | Montserrat | 400 | 14 px, `line-height: 1.75` |
| Texte de carte | Montserrat | 400 | 12,5 px, `line-height: 1.6` |
| Libellé, bouton | Montserrat | 600 | 13–14 px |
| Sur-titre | Montserrat | 400 | 10–11 px, `letter-spacing: .18em`–`.24em`, majuscules, `#A0223B` |
| Légende | Montserrat | 400 | 12 px, `#7d4152` |

`text-wrap: pretty` sur tous les paragraphes et titres longs.

**Minimum absolu : 12 px.** Les 9,5–11 px des maquettes sont réservés aux sur-titres en majuscules espacées, jamais à du texte à lire.

---

## 3. Formes et espacement

| Élément | Rayon |
|---|---|
| Carte, panneau, bloc de contenu | 12–14 px |
| Bouton, champ | 9–11 px |
| Pastille de filtre, badge, interrupteur | `999px` |
| Modal | 15 px |
| Cadre de téléphone (maquettes uniquement) | 34 px, bordure 9 px `#2a2622` |

- **Padding** — carte 16–17 px · section `clamp(18px, 4vw, 24px)` · page `clamp(14px, 4vw, 24px)`
- **Gaps** — 8 px (boutons groupés) · 12–14 px (éléments de carte) · 22 px (grille) · `clamp(22px, 4vw, 34px)` (sections de document)
- **Largeurs** — 1180 px (pages larges et admin) · 860 px (lecture) · 600 px (emails)
- **Ombres**, uniquement sur élément flottant — carte au survol `0 16px 34px rgba(128,0,32,.14)` · modal et bandeau `0 18px 44px rgba(60,20,30,.24)`

---

## 4. Composants — recettes exactes

**Bouton primaire** — fond `bordeaux`, texte `beige`, rayon 10 px, padding 14–16 px, poids 600, `min-height: 48px`. Survol : `#600018`.

**Bouton secondaire** — transparent, bordure 1 px `bordeaux`, texte `bordeaux`. Survol : **inversion complète** (fond bordeaux, texte beige), pas un simple changement de teinte.

**Bouton tertiaire** — bordure `#d9d4b4`, texte `#7d4152`. Survol : bordure et texte passent à `bordeaux`.

**Pastille de filtre / onglet** — rayon `999px`, padding `9px 16px`, `min-height: 44px`, `white-space: nowrap`, `flex: none`. Inactive : bordure `rgba(128,0,32,.22)`, fond transparent, texte `bordeaux`. Active : fond `bordeaux`, texte `beige`. Compteur à 11 px, `opacity: .6`.

La rangée est en **défilement horizontal**, jamais en retour à la ligne.

**Jauge de remplissage** — piste 6–9 px, rayon `999px`, fond `beige-darker`. Remplissage en pourcentage, couleur d'état. **Toujours** doublée d'un texte chiffré dessous (« 12 couverts réservés sur 30 »).

**Badge d'état** — 10,5–11 px, poids 600, `letter-spacing: .06em`, majuscules, rayon `999px`, padding `5px 10px`. Deux variantes : bordure + texte de la couleur d'état (sur fond clair), ou fond teinté + texte de la couleur d'état (en tableau).

Fonds de badge en tableau : `#EAF0EA` (dispo) · `#F5EFE0` (presque) · `#F3E7EA` (bordeaux) · `#EFEDDB` (fermé).

**Interrupteur** — piste 42 × 24 px rayon `999px`, pastille blanche 18 px décalée de 3 px ou 21 px. Actif `dispo`, inactif `#d9d4b4`, actif-mais-verrouillé `#b79aa2` en `cursor: not-allowed`. **Toujours** doublé du libellé « Activé » / « Désactivé ».

**Champ de formulaire** — fond blanc, bordure 1 px `#d9d4b4`, rayon 10 px, padding `13px 12px`, `min-height: 48px`. En erreur : bordure 1,5 px `bordeaux` + message sous le champ, 11 px, poids 600, `bordeaux`.

**En-tête de site** — collant, hauteur **fixe 60 px**, fond `bordeaux`, `flex-wrap: nowrap`. Logo Playfair 700 `clamp(17px, 4.6vw, 20px)` avec `text-overflow: ellipsis`. À droite, le bouton « Réserver » en fond `beige` / texte `bordeaux`, `flex: none`.

La hauteur doit rester constante : la barre de filtres se colle à `top: 60px`. Pas de lien vers la page courante dans la nav.

**Pied de page** — celui du repo, centré, fond `beige-darker`, nom en Playfair 20 px, baseline « Un moment de douceur hors du temps », copyright. Une seule rangée à ajouter : Mentions légales · Confidentialité · CGU · **Gérer les cookies**.

**Cadre de téléphone** — présent uniquement dans les planches pour situer le contexte mobile. **Ne pas implémenter.** Le contenu, lui, est à 390 px.

---

## 5. Le motif central de la carte : bandeau de tête homogène

Parti pris principal de la refonte, et le seul point à ne pas rater.

Toutes les cartes de plat partagent un bandeau de tête au **ratio 16/10**, même bordure basse `#e2dcc0`, même rythme interne. Seul son contenu change :

- **avec photo** → l'image
- **sans photo** → une plaque typographique : filet 26 × 1 px `rgba(128,0,32,.35)`, texte en Playfair 600 `#800020`, mention en majuscules espacées `#A0223B`, second filet. Fond `beige` avec rayures à 135° `rgba(128,0,32,.055)`, ou `#FBFAF0` uni pour le monogramme.

La grille reste ainsi parfaitement alignée, et un plat sans photo se lit comme un **choix éditorial**, pas comme un fichier manquant.

**Interdit** : tout placeholder « photo non disponible », carré gris, icône d'image cassée.

### Variante retenue : `plaque`

Trois variantes étaient maquettées (`plaque`, `prix`, `monogramme`). **Le client a tranché pour `plaque`.** Les deux autres ne sont pas à implémenter, et la prop `traitementSansPhoto` n'a pas à exister dans le code : c'était un réglage de maquette.

Recette exacte du bandeau d'un plat sans photo :

| Élément | Valeur |
|---|---|
| Ratio | 16/10, identique aux plats avec photo |
| Fond | `beige` + rayures à 135° `rgba(128,0,32,.055)`, pas de 1 px tous les 7 px |
| Bordure basse | `#e2dcc0`, identique aux autres cartes |
| Filet haut et bas | 26 × 1 px, `rgba(128,0,32,.35)` |
| Nom du plat | Playfair 600 `#800020`, 24 px — **20 px au-delà de 22 caractères** |
| Mention | Majuscules espacées `.22em`, 9,5 px, `#A0223B` |
| Gap interne | 12 px |

La mention par défaut est « Spécialité maison ». Si elle doit devenir modifiable plus tard, elle ira dans `site_config`, pas dans une prop de composant.

`PlatModal.tsx` doit être aligné sur ce traitement : l'en-tête de la modale d'un plat sans photo reprend la même plaque, au même ratio.

**Plat épuisé** : `filter: saturate(.35)` sur le **bandeau seul** + badge « Épuisé » en haut à gauche. Le texte de la carte garde son contraste plein — on ne baisse jamais l'opacité de la carte entière.

---

## 6. Responsive

Le client scanne un QR code à table : le mobile est le cas principal, pas une adaptation.

- Une seule page fluide, pas de version mobile séparée.
- Marges, titres et espacements en `clamp()`.
- Grille de cartes : `repeat(auto-fill, minmax(min(100%, 262px), 1fr))`. Le `min(100%, …)` est **indispensable**, sinon débordement horizontal sous 300 px.
- Rangées de filtres et d'onglets en défilement horizontal.
- Cibles tactiles ≥ 44 px ; boutons de formulaire 48 px.
- Vérifier à **360 px et 320 px** : aucun débordement, aucun chevauchement d'élément collant.
- Seules largeurs fixes autorisées : les formats d'export (emails 600 px, planches de maquettes).

---

## 7. Ton de la copie

Français, vouvoiement, phrases courtes. On explique la contrainte au lieu de l'énoncer sèchement, et chaque impasse propose une sortie.

| À éviter | Préférer |
|---|---|
| « Erreur : créneau indisponible » | « Ce créneau vient d'être complété. Choisissez un autre horaire. » |
| « Maximum 12 couverts » | « Pour un groupe de plus de 12 personnes, contactez-nous par téléphone. » |
| « Annulation impossible » | « Votre service commence dans moins de 24 h : appelez-nous, nous nous en occupons. » |
| « 404 — Page non trouvée » | « Cette page a quitté la carte. » |

Un numéro de téléphone est **toujours** un lien `tel:`, jamais du texte simple.

Pas d'emoji, pas d'icône décorative, pas d'illustration SVG dessinée à la main. La hiérarchie est portée par la typographie et les filets.

---

## 8. Accessibilité

- Jamais la couleur comme seul porteur d'information : chaque état a un texte ou un libellé.
- Chaque champ a un `<label>` associé, pas seulement un `placeholder`.
- Les messages d'erreur sont liés au champ (`aria-describedby`) et le champ porte `aria-invalid`.
- Le calendrier est navigable au clavier ; un jour non réservable est `aria-disabled`, pas simplement non cliquable.
- Les changements d'état après une action (réservation créée, statut modifié) sont annoncés dans une zone `aria-live="polite"`.
- Focus visible partout : ne jamais faire `outline: none` sans remplacement.
