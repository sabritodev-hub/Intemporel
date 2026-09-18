# 03 — Parcours public

Maquettes : `maquettes/Réservation Brunch.dc.html`, section « Parcours public », écrans 1 à 6. Frames mobile 390 px.

Parcours en trois étapes, annoncées dans l'en-tête de chaque écran : **date → créneau → coordonnées**.

---

## Point d'entrée

Bouton **« Réserver »** dans `components/layout/Header.tsx`, visible si `site_config.reservations_actives = 'true'`.

L'en-tête fait **exactement 60 px de haut** et ne passe jamais à deux lignes (`flex-wrap: nowrap`, logo en `text-overflow: ellipsis`) : la barre de filtres de la page carte se colle à `top: 60px` et un en-tête plus haut provoque un chevauchement au scroll.

---

## Écrans 1-2 — Calendrier · `/reservation`

Deux vues, une bascule en haut, **vue semaine par défaut sur mobile**, vue mois par défaut au-delà de 768 px.

### Commun aux deux vues

- En-tête bordeaux : « Réserver le brunch », sous-titre « Samedi et dimanche · 1 à 12 personnes ».
- Navigation bornée : pas de flèche vers un mois hors de la fenêtre mois courant + suivant, ni vers un mois sans créneau généré. Une flèche inactive reste visible mais grisée, en `cursor: not-allowed` — elle ne disparaît pas, sinon les deux flèches sautent de place.
- Encart de rappel : « Les réservations d'une journée ferment à l'heure du premier service de cette journée. »
- Légende de couleurs (dispo / presque complet / complet / fermé) accessible, jamais la couleur seule.

### Vue mois

Grille 7 colonnes, cellules en `aspect-ratio: 1/1`, en-têtes `L M M J V S D`.

| Jour | Rendu |
|---|---|
| Hors weekend | Chiffre en `#c4bda6`, aucun fond, aucun point, non cliquable |
| Disponible | Fond blanc, bordure `dispo`, point `dispo` |
| Presque complet | Fond blanc, bordure `presque`, point `presque` |
| Complet | Fond `#EFEDDB`, bordure `#e0c9cf`, point `bordeaux` |
| Passé ou journée close | Fond `#EFEDDB`, bordure `#e0ddc6`, chiffre et point `ferme` |

Un jour dont le premier service a commencé bascule en « passé », même s'il reste des services plus tard dans la journée (règle 3).

### Vue semaine

Plus directe en mobile : elle liste les créneaux sans second clic.

Une carte par jour de brunch de la semaine, en-tête beige avec le titre du jour et un badge d'état, puis une ligne par créneau : horaire, places restantes, action. Un créneau complet perd son action et passe en `#EFEDDB` avec du texte `ferme`.

---

## Écran 3 — Choix du créneau · `/reservation/[date]`

`[date]` au format `2026-09-19` (clé locale Europe/Paris, voir `lib/reservation/dates.ts`).

En-tête bordeaux : « Étape 2 sur 3 » + le jour en toutes lettres, avec une flèche retour.

Trois états de carte, tous les trois visibles dans la maquette :

**Disponible** — bordure 1,5 px `dispo`, fond blanc, horaire en Playfair 21 px, places restantes en `dispo`, jauge de remplissage, texte chiffré (« 12 couverts réservés sur 30 »), bouton « Choisir ce créneau ».

**Complet** — bordure `#d9d4b4`, fond `#EFEDDB`, horaire en `ferme`, mention « Complet » en `bordeaux`, jauge pleine en `bordeaux`, **pas de bouton**. Un bouton désactivé invite à cliquer ; l'absence de bouton, non.

**Réservations closes** — bordure **pointillée** `#c3bda2`, fond `#EFEDDB`, phrase « Réservations closes — le premier service de la journée a commencé. », pas de jauge, pas de bouton.

En bas, encart permanent : « Plus de 12 personnes ? **Contactez-nous par téléphone** au … », numéro en lien `tel:`.

---

## Écran 4 — Formulaire · `/reservation/[date]/[creneauId]`

En-tête « Étape 3 sur 3 · Vos coordonnées ».

### Récapitulatif modifiable

Carte blanche en tête : « Votre créneau », le jour et l'heure en Playfair, et un bouton **Modifier** (44 px) qui revient à l'étape 2. Sans lui, un client qui s'est trompé de créneau utilise le bouton retour du navigateur et perd sa saisie.

### Sélecteur de couverts

Boutons **− / +** de 44 × 44 px, nombre au centre en Playfair 26 px, libellé « personne » / « personnes » accordé. **Pas de `<select>`** : ciblage bien plus difficile au doigt.

Bornes 1 à 12. À 12, l'encart téléphone apparaît **sous** le sélecteur, sur fond bordeaux, texte beige, numéro en lien `tel:` en beige lui aussi.

### Champs

Nom, email, téléphone — chacun avec un `<label>` associé, hauteur minimale 48 px.

Le téléphone porte une aide sous le champ : « Pour vous joindre en cas d'imprévu. » C'est ce qui justifie de le demander, et ça évite qu'il soit perçu comme de la collecte gratuite.

Validation à la sortie du champ (`onBlur`). En erreur : bordure 1,5 px `bordeaux` et message sous le champ, 11 px, poids 600, en `bordeaux`. La maquette montre l'email en erreur (« Adresse email incomplète. »).

### Consentement et anti-robot

Case **non pré-cochée**, 22 px, avec lien vers `/confidentialite`. Puis le widget Cloudflare Turnstile.

Un **honeypot** invisible complète le dispositif : un champ texte masqué en CSS (jamais `type="hidden"`, que les robots ignorent) ; s'il est rempli, la server action renvoie un faux succès sans rien insérer.

### Trois états du bouton final

1. **Repos** — « Confirmer ma réservation », bordeaux, 52 px de haut.
2. **Envoi** — fond `#a8798a`, spinner, libellé « Envoi en cours… », bouton désactivé. Désactiver dès le premier clic, sinon un double-clic crée deux réservations.
3. **Échec de concurrence** — bandeau bordeaux : « Ce créneau vient d'être complété. **Choisir un autre horaire**. », le lien ramenant à l'étape 2. C'est le rendu de l'erreur `COMPLET` de `reserver()`.

---

## Écran 5 — Confirmation · `/reservation/confirmation/[id]`

En-tête bordeaux pleine largeur, coche dans un cercle, « Votre table est réservée », « Un email de confirmation vous a été envoyé. »

Récapitulatif en quatre lignes : Date · Heure · Personnes · **Référence** (`BR-7F42`).

**Aucune donnée sensible affichée** — ni email, ni téléphone, ni nom. L'URL contient un uuid non devinable, mais elle peut être partagée par inadvertance (capture d'écran, historique) ; le récapitulatif reste donc anonyme.

Encart beige « Annulation » : jusqu'à 24 h avant depuis le lien reçu par email, ensuite par téléphone (lien `tel:`).

Deux boutons : **Ajouter au calendrier** (télécharge `/reservation/confirmation/[id]/calendrier.ics`) et **Voir la carte**.

Si l'envoi de l'email a échoué, remplacer la phrase « Un email … envoyé » par : « Nous n'avons pas pu envoyer l'email de confirmation. Notez votre référence **BR-7F42** — votre table est bien réservée. » Passer l'information par un query param (`?email=ko`), pas par un état global.

### Fichier .ics

```
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//L'Intemporel//Reservation//FR
BEGIN:VEVENT
UID:<id>@lintemporel.fr
DTSTAMP / DTSTART / DTEND     ← en UTC, suffixe Z
SUMMARY:Brunch à L'Intemporel — 4 personnes
LOCATION:<site_config.adresse_restaurant>
DESCRIPTION:Référence BR-7F42. Annulation jusqu'à 24 h avant depuis votre email de confirmation.
END:VEVENT
END:VCALENDAR
```

En-têtes : `Content-Type: text/calendar; charset=utf-8` et `Content-Disposition: attachment; filename="brunch-lintemporel.ics"`.

---

## Écran 6 — Annulation · `/reservation/annuler?token=…`

**Une seule route, quatre rendus conditionnels.** Ne pas construire quatre pages.

Le serveur hache le jeton reçu et appelle `consulter_par_token()`. Selon le retour :

| Cas | Rendu |
|---|---|
| `annulable = true` | « Annuler ma réservation » — récapitulatif + bouton d'annulation. Pied : « Un email de confirmation d'annulation vous sera envoyé. » |
| Réservation confirmée mais < 24 h | « Annulation par téléphone » — récapitulatif + **numéro en grand** dans un bloc bordeaux cliquable (`tel:`). Pas de bouton d'annulation. Pied : « Merci de nous prévenir : cela libère la table pour d'autres clients. » |
| Statut déjà annulé | « Déjà annulée » — récapitulatif à `opacity: .55`, date et heure de l'annulation, bouton secondaire « Réserver un nouveau créneau » |
| Aucune ligne (jeton inconnu, tronqué, ou réservation anonymisée) | « Ce lien n'est plus valable » — **pas de récapitulatif**, message neutre, bouton « Réserver un créneau », pied avec le téléphone |

Le dernier cas ne doit rien révéler : même message qu'un jeton inventé. Sinon, la page devient un oracle qui confirme l'existence d'une réservation.

**Aucun lien vers cette route depuis le site.** `robots.txt` doit l'exclure et la page porter `<meta name="robots" content="noindex">`.

Après l'annulation, réafficher la même page dans l'état « Déjà annulée » et envoyer l'email de confirmation d'annulation.

---

## Responsive — non négociable

- Vérifier chaque écran à **360 px et 320 px** : aucun débordement horizontal, aucun chevauchement d'élément collant.
- Cibles tactiles ≥ 44 px ; boutons de formulaire 48 px ; bouton final 52 px.
- Marges et titres en `clamp()`.
- Rangées d'onglets et de filtres en **défilement horizontal** (`overflow-x: auto`, `flex-wrap: nowrap`, `scrollbar-width: none`), jamais en retour à la ligne : en mobile, un wrap mange trois lignes de hauteur d'écran.
- Une seule page fluide, pas de version mobile séparée à maintenir.
