# 09 — Plan d'implémentation

Neuf étapes. Chacune est livrable et testable seule. Ne pas commencer une étape avant que la précédente soit vérifiée.

---

## Étape 0 — Préparation

- Lire `00-regles-metier.md` et `10-decisions-ouvertes.md`. Plus aucun point ne bloque le démarrage.
- Créer une branche, monter Supabase en local ou un projet de développement séparé, déployer Mailpit.
- Ajouter les quatre couleurs d'état à `tailwind.config.ts` (`06-design-system.md`, section 1).

## Étape 1 — Base de données

Migration `005_reservations.sql` complète : tables, vue, cinq fonctions, RLS, pg_cron, `site_config`. Puis `006_admin_policies.sql` en ayant peuplé `admin_profiles` **avant**. Régénérer `types/database.types.ts`.

**Vérifier :** insérer trois créneaux et deux réservations à la main, lire `creneaux_publics`, vérifier que `places_restantes` et `reservable` sont justes ; se reconnecter au back-office existant.

## Étape 2 — Paramètres et back-office des créneaux

D'abord les deux cartes de `/admin/settings` (coordonnées et réservations) : elles conditionnent tout le reste, puisque le téléphone et l'adresse alimentent onze endroits du site. Saisir les vraies valeurs immédiatement après.

Puis `/admin/creneaux`, onglet Modèles et onglet Calendrier avec la génération mensuelle et le panneau latéral.

Cette étape passe avant le public : **sans créneaux, il n'y a rien à tester côté client**.

**Vérifier :** le téléphone saisi ressort bien au format `06 12 34 56 78` et en lien `tel:` ; créer les modèles, générer octobre, relancer la génération (aucun doublon), modifier une capacité à la baisse sous le nombre de couverts réservés (message explicite), fermer puis rouvrir un créneau.

## Étape 3 — Parcours public

Écrans 1 à 5 : calendrier mois et semaine, choix du créneau, formulaire, confirmation, fichier `.ics`. Plus le bouton « Réserver » dans le Header.

**Vérifier :** réserver de bout en bout ; la jauge se met à jour ; un créneau plein perd son bouton ; à 12 personnes l'encart téléphone apparaît ; les trois états du bouton final s'affichent ; rendu correct à 360 px et 320 px.

## Étape 4 — Emails et annulation

Transport (Mailpit puis Resend), les trois templates React Email, puis `/reservation/annuler` et ses quatre états.

**Vérifier :** l'email arrive dans Mailpit avec le bon lien ; les quatre états s'affichent selon le jeton ; une annulation à plus de 24 h fonctionne, à moins de 24 h affiche le téléphone ; l'email d'annulation part.

## Étape 5 — Back-office des réservations

`/admin/reservations` en version desktop puis salle, recherche, ajout manuel, actions Venu / Absent / Annuler, puis la modal d'annulation de créneau en deux temps.

**Vérifier :** annuler un créneau de 6 réservations envoie 6 emails et affiche la liste à appeler ; un ajout manuel dépassant la capacité demande confirmation.

## Étape 6 — Widget dashboard

Bloc « Brunch ce weekend » sur `/admin/dashboard`.

## Étape 7 — Refonte de la carte

`app/(public)/page.tsx` et `components/menu/*` d'après `maquettes/Carte.dc.html` : bandeau de tête homogène 16/10, **traitement `plaque`** pour les plats sans photo (recette exacte en `06-design-system.md`, section 5), filtres à défilement horizontal, plat épuisé désaturé. Aligner `PlatModal.tsx`.

**Vérifier :** un plat sans photo ne casse pas l'alignement de la grille ; aucun placeholder « photo non disponible » nulle part.

## Étape 8 — Pages légales

`/confidentialite`, `/cgu`, bandeau et panneau cookies, `not-found.tsx`, `error.tsx`, rangée de liens dans le Footer.

## Étape 9 — Finitions

- Retirer `ignoreBuildErrors` et `ignoreDuringBuilds` de `next.config.js`, corriger les erreurs TypeScript qui apparaissent. Elles sont masquées depuis le début du projet ; certaines sont probablement réelles.
- Vérifier le job d'anonymisation sur une donnée ancienne.
- Dérouler la liste de contrôle de `08-securite-rgpd.md`.

---

## Tests à écrire

Ce ne sont pas des tests optionnels : ce sont les cinq cas où une erreur coûte une table ou une donnée.

**1 · Concurrence sur la dernière place**

Un créneau à 30 couverts, 28 déjà réservés. Deux appels simultanés de 2 couverts. Un seul doit réussir, l'autre lever `COMPLET`. Sans le `for update`, les deux passent et la salle est en surbooking.

```ts
const [a, b] = await Promise.allSettled([reserver(2), reserver(2)]);
// exactement un fulfilled, un rejected avec COMPLET
```

**2 · Clôture au premier service**

Journée à deux services, 10h00 et 12h30. À 10h01, réserver sur le créneau de 12h30 doit lever `RESERVATIONS_CLOSES`. C'est la règle la plus contre-intuitive du module, et la plus facile à casser lors d'une refactorisation.

**3 · Bornes de période**

Un créneau du mois suivant est réservable. Un créneau de dans deux mois lève `HORS_PERIODE`.

**4 · Fenêtre d'annulation**

À 25 h du créneau : annulation acceptée. À 23 h : `DELAI_DEPASSE`. Deux annulations successives : la seconde lève `DEJA_ANNULEE`.

**5 · Changement d'heure**

Générer les créneaux d'octobre (le changement d'heure a lieu le dernier dimanche) et vérifier qu'un service à 10h00 reste bien à 10h00 locales avant et après. Un décalage codé en dur donnerait 9h00 ou 11h00.

Ajouter aussi : anonymisation (un créneau terminé depuis 31 jours a ses coordonnées à `null`, ses couverts intacts) et garde-fou de capacité.

---

## Définition du « terminé »

Une étape est terminée quand :

- Le comportement correspond à la maquette, valeurs de `06-design-system.md` comprises.
- L'écran est correct à 360 px et 320 px, sans débordement horizontal.
- Toutes les cibles tactiles font au moins 44 px.
- Les messages d'erreur suivent le ton du tableau de `06-design-system.md` — ils expliquent et proposent une sortie.
- Aucune couleur ne porte seule une information.
- Aucune valeur en dur qui devrait venir de `site_config` (téléphone, adresse, email, rétention). Test : vider le téléphone dans les paramètres — aucun `tel:undefined`, aucun blanc au milieu d'une phrase, l'encart concerné disparaît proprement.
- `npm run build` passe sans erreur TypeScript à partir de l'étape 9.

---

## Ce qui viendra après

Hors périmètre aujourd'hui, mais le schéma le permet sans migration lourde :

- Rendre configurables dans `site_config` : taille de groupe maximale, délai d'annulation, horizon de réservation
- Liste d'attente sur les créneaux complets
- Rappel par email la veille du service
- Rappel par SMS si les absences deviennent un problème (le téléphone est déjà en base)
- Ouvrir d'autres services que le brunch — la colonne `service` est là pour ça
- Statistiques de fréquentation à partir des lignes anonymisées
