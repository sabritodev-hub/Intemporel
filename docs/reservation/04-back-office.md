# 04 — Back-office

Maquettes : `maquettes/Réservation Brunch.dc.html`, section « Back-office », écrans 7 à 11.

Tout se place dans le layout admin existant (`app/admin/layout.tsx`), sidebar bordeaux de 232 px, en-tête de 60 px.

## Sidebar

Ajouter deux entrées à `navItems`, **avant** Plats :

```ts
{ href: "/admin/reservations", label: "Réservations", icon: CalendarCheck },
{ href: "/admin/creneaux",     label: "Créneaux",     icon: CalendarClock },
```

Ordre final : Dashboard · Réservations · Créneaux · Plats · Catégories · Options · Paramètres.

---

## Écran 7 — `/admin/reservations`

**Deux rendus des mêmes données**, au même point de rupture (`lg`, 1024 px). Pas deux pages, pas deux jeux de requêtes : un composant serveur qui charge, deux composants d'affichage.

### Barre d'en-tête

Titre « Réservations », champ de recherche par nom (200 px), bouton « + Ajouter une réservation ».

### Barre d'outils

- Bascule **Jour / Semaine** (fond `beige-darker`, pastille active bordeaux).
- Flèches de navigation et date en Playfair 16 px.
- À droite, deux compteurs : « Couverts du jour **42** / 60 » et « Réservations **14** ».

Les compteurs excluent les réservations annulées. Ils sont la première chose que le responsable regarde le matin.

### Bloc par créneau (desktop)

En-tête : horaire en Playfair 18 px · jauge de remplissage 8 px avec son texte chiffré (« 24 couverts sur 30 · 6 places restantes ») · badge d'état (Ouvert / Complet / Fermé).

Tableau, en-tête sur fond `#FBFAF0` :

| Nom | Pers. | Téléphone | Statut | Réservé le | Actions |
|---|---|---|---|---|---|

- Téléphone **toujours** en lien `tel:` — le personnel appelle depuis un téléphone posé sur le comptoir.
- Statut en badge teinté : Confirmée `#EAF0EA`/`dispo` · Venue `#F3E7EA`/`bordeaux` · Absent `#F5EFE0`/`presque` · Annulée `#EFEDDB`/`ferme`.
- Actions : **Venu** (bordure `dispo`) · **Absent** (bordure `presque`) · **Annuler** (bordure `bordeaux`). Chacune inverse ses couleurs au survol.

### Version salle (mobile)

Mêmes données en cartes empilées. Pensée pour être utilisée **debout, en service, d'une seule main** : boutons pleine largeur de 44 px minimum, téléphone en gros et cliquable, statut en badge.

En tête de page : une carte « Remplissage » avec la jauge du créneau en cours, puis la recherche, puis les cartes, puis le bouton d'ajout manuel.

### Actions

| Action | Effet |
|---|---|
| Venu | `statut = 'venue'`. Ne libère pas de place |
| Absent | `statut = 'absent'`. Ne libère pas de place non plus — la table a été perdue |
| Annuler | `statut = 'annulee_restaurant'`, libère les places, **envoie l'email d'annulation restaurant** |

Annuler depuis l'admin demande une confirmation : c'est irréversible et ça déclenche un email.

### Ajout manuel

Modal : nom, téléphone, couverts, email (facultatif — le personnel n'a pas toujours l'adresse au téléphone). Source `admin`.

- Pas de limite à 12 : les groupes passent par le téléphone.
- Si l'ajout dépasse la capacité, **ne pas bloquer** : afficher « Ce créneau passera à 34 couverts sur 30. Confirmer ? ». Le personnel sait parfois qu'il peut ajouter une table.
- Sans email, pas de jeton d'annulation ni d'email de confirmation.

---

## Écrans 8-9 — `/admin/creneaux`, deux onglets

### Onglet Modèles

Texte d'explication en tête, indispensable pour que la distinction soit comprise : *« Un modèle décrit un service récurrent. La génération mensuelle crée les créneaux réels à partir des modèles actifs. »*

Liste groupée par jour de semaine (Samedi, Dimanche), une carte blanche par groupe avec en-tête `#FBFAF0`. Chaque ligne : horaires · capacité · interrupteur actif/inactif doublé du libellé « Actif » / « Inactif » · boutons Modifier / Supprimer.

Bouton « + Nouveau modèle » en haut à droite. Création et modification en modal : jour, heure de début, heure de fin, capacité, actif.

Règles :
- Désactiver un modèle **ne supprime pas** les créneaux déjà générés — il cesse simplement d'en produire de nouveaux.
- Supprimer un modèle met `modele_id` à `null` sur les créneaux existants (`on delete set null`), qui restent réservables.
- Refuser deux modèles actifs au même jour et même heure de début.

### Onglet Calendrier

À gauche, le mois en grille 7 colonnes, cellules d'au moins 92 px, chaque cellule affichant ses créneaux sous forme de pastilles (`10h00 · 30`). Un créneau fermé passe en `#EFEDDB` avec du texte `ferme`.

En haut : navigation de mois et bouton **« Générer les créneaux du mois »**.

La génération est **idempotente** (`on conflict do nothing` sur `(service, debut)`). Relancer ne duplique rien et ne touche pas aux capacités modifiées à la main. Après l'appel, afficher le nombre créé : « 8 créneaux créés » ou « Aucun nouveau créneau : le mois est déjà généré ».

À droite, panneau du créneau sélectionné (288 px) :

- Titre en Playfair : « Dim. 11 oct. · 12h30 – 14h30 »
- **Capacité** : champ + bouton Enregistrer, avec le garde-fou — « 18 couverts déjà réservés : la capacité ne peut pas descendre sous 18 ». Message affiché sous le champ **avant** la tentative si l'on connaît déjà le nombre, et en erreur sinon.
- **Fermer le créneau** (secondaire) : plus de nouvelles réservations, les existantes tiennent.
- **Rouvrir le créneau** (tertiaire).
- **Annuler le créneau…** (primaire, bordeaux) → ouvre la modal de l'écran 10.
- Note de bas de panneau : « L'annulation prévient les clients par email et fournit la liste à appeler. »

**Fermer et annuler ne sont pas la même chose.** Fermer suspend les nouvelles réservations ; annuler supprime le service et prévient tout le monde. L'interface doit rendre cette différence évidente.

---

## Écran 10 — Modal « Annuler un créneau », deux temps

### Avant

- En-tête : « Annuler le créneau » + le jour et l'horaire.
- Bandeau bordeaux : « **6 réservations · 18 couverts** seront annulés. Un email d'annulation sera envoyé à chaque client. » Volume calculé au moment de l'ouverture.
- Champ **Motif** (`textarea`, 80 px minimum), libellé « Motif (visible dans l'email) ». Obligatoire — la fonction SQL lève `MOTIF_REQUIS` sur un motif vide.
- Boutons : Retour (tertiaire) · « Annuler le créneau et prévenir » (primaire).

### Après

- En-tête : « Clients à appeler » · « Emails envoyés · cochez au fur et à mesure ».
- Une ligne par client : case à cocher 22 px, nom, nombre de personnes, **téléphone en lien `tel:`**, état « À appeler » / « Appelé ». Une ligne cochée passe son nom en `ferme`.
- Bouton « Terminer ».

L'état des cases peut rester **local, non persisté** : c'est un outil de session pour ne pas perdre le fil pendant une série d'appels, pas une donnée métier.

Pourquoi cet écran : quand le service est le lendemain, l'email seul ne suffit pas. Beaucoup de clients ne le liront pas à temps.

---

## Écran 11 — Widget dashboard

Sur `/admin/dashboard`, bloc **« Brunch ce weekend »**, carte blanche 520 px, lien « Voir les réservations » en haut à droite.

Pour chacun des deux prochains jours de service :

- Nom du jour et « **42** / 60 couverts »
- Jauge de remplissage 9 px, couleur d'état
- Ligne de détail : « 14 réservations · 2 services »

« Les deux prochains jours de service » = les deux premiers créneaux à venir groupés par jour, pas forcément le weekend calendaire en cours — un lundi, ce sont le samedi et le dimanche suivants.

---

## Paramètres — `/admin/settings`

La page existe déjà (`app/admin/settings/SettingsClient.tsx`) : mise en page en `Card` shadcn, bouton « Enregistrer » en haut à droite, sauvegarde via `updateSiteConfig(key, value)` de `app/actions.ts`, retour par toast. **Ne pas la réécrire** — y ajouter une carte.

### Nouvelle carte « Coordonnées du restaurant »

| Champ | Clé `site_config` | Contrôle |
|---|---|---|
| Téléphone | `telephone_restaurant` | `Input type="tel"`, aide : « Affiché pour les groupes de plus de 12 personnes et les annulations de dernière minute » |
| Adresse | `adresse_restaurant` | `Textarea` 2 lignes, aide : « Reprise dans les emails et les pages légales » |
| Email de contact | `email_contact` | `Input type="email"`, aide : « Adresse de réponse des emails de réservation » |

Ces trois valeurs apparaissent dans **onze endroits** du site. Une carte d'aide sous les champs le rappelle, pour que le responsable comprenne qu'une correction ici se propage partout.

### Nouvelle carte « Réservations »

| Champ | Clé | Contrôle |
|---|---|---|
| Réservation en ligne | `reservations_actives` | `Switch`, doublé de « Activée » / « Désactivée ». Désactivé, le bouton du Header disparaît et `/reservation` affiche « Les réservations en ligne sont momentanément fermées » avec le téléphone |
| Table gardée | `retention_table_min` | `Input type="number"`, min 0, max 60, suffixe « minutes ». Aide : « Reprise à l'article 3 des conditions de réservation » |

### Validation

- **Téléphone** : normalisé en E.164 à l'enregistrement (`lib/reservation/telephone.ts`), affiché au format national dans le champ. Une saisie invalide est refusée avec un message sous le champ, pas un toast d'erreur générique.
- **Email** : format vérifié.
- **Rétention** : entier entre 0 et 60.

Un champ vide est accepté et enregistré tel quel. Côté affichage, un téléphone vide masque l'encart « plus de 12 personnes » et le bloc d'appel de la page d'annulation plutôt que d'afficher un lien `tel:` creux — **ne jamais rendre `tel:undefined`**.

---

## Composant partagé

`components/reservation/JaugeRemplissage.tsx` sert aux écrans 3, 7, 9 et 11. Une seule implémentation :

- Piste : hauteur 6 à 9 px selon le contexte, rayon `999px`, fond `beige-darker`
- Remplissage : largeur en pourcentage, couleur donnée par `etatCreneau()`
- **Toujours** accompagnée du texte chiffré en clair dessous. La couleur seule n'est pas une information accessible, et le personnel a besoin du chiffre exact.
