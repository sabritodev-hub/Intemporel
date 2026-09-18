# 10 — Décisions

Six points ont été tranchés le 18 septembre 2026. Trois restent ouverts, aucun n'est bloquant.

---

## Décisions du 18 septembre

### 1 · Coordonnées du restaurant → paramétrables

Aucune valeur en dur. Le téléphone, l'adresse et l'email de contact sont **des champs éditables par l'admin** dans `/admin/settings`, stockés dans `site_config`.

Ils alimentent les onze endroits où ils apparaissent : encart « plus de 12 personnes », page d'annulation, écran de confirmation, 404, 500, les trois emails, la politique de confidentialité et les CGU.

Implémentation : `04-back-office.md`, section « Paramètres ».

Les valeurs des maquettes (`01 23 45 67 89`, `12 rue des Arts`, `contact@lintemporel.fr`) sont du remplissage : elles ne doivent apparaître **nulle part** dans le code livré, pas même en valeur par défaut.

### 2 · Horaires et capacités → paramétrables

Même principe : les services de chaque jour et leur capacité se règlent dans `/admin/creneaux`, onglet Modèles. Le `seed.sql` fournit un jeu de démarrage pour que le module ne soit pas vide au premier lancement, rien de plus.

Le restaurant doit pouvoir ouvrir un troisième service un dimanche, ou passer une capacité de 30 à 24, sans appeler un développeur.

### 3 · Plats sans photo → traitement `plaque`

Le nom du plat en gros dans le bandeau, avec la mention « Spécialité maison ». Les variantes `prix` et `monogramme` sont abandonnées ; la prop `traitementSansPhoto` n'a pas à exister dans le code.

Recette exacte : `06-design-system.md`, section 5.

### 4 · Rétention de table → 20 minutes

Valeur par défaut de `site_config.retention_table_min`, éditable dans `/admin/settings`. L'article 3 des CGU lit cette valeur au lieu de l'écrire en dur : changer le réglage met le texte à jour.

### 5 · Pages légales → version `Pages légales.dc.html`

La plus complète, et la seule des deux à être une vraie page responsive. Les écrans 13-16 de `Réservation Brunch.dc.html` sont des planches de présentation à largeur fixe.

On en reprend les deux documents et le texte de la 404 (« Cette page a quitté la carte »). Une seule chose est reprise de l'autre fichier : **l'écran 500**, qui n'existe que là.

### 6 · Policies RLS → à corriger

La migration `006_admin_policies.sql` fait partie du périmètre, à l'étape 1 du plan.

Rappel du piège : peupler `admin_profiles` **avant** de basculer les policies, et vérifier la connexion au back-office avant de déployer. Sinon, plus personne n'est admin.

---

## Encore ouverts

### A · Mode du bandeau cookies

`information` (une simple mention) ou `consentement` (trois boutons de poids égal).

**Recommandation : `information`.** Le site ne dépose que des cookies strictement nécessaires — session de réservation et Turnstile — qui sont exemptés de consentement. Un bandeau à trois boutons serait une friction injustifiée.

À basculer en `consentement` le jour où une mesure d'audience est installée. Ce jour-là, refuser devra être aussi simple qu'accepter.

**Non bloquant** : le choix se fait à l'étape 8. En son absence, coder `information`.

### B · Mentions légales

La page `/mentions-legales` est liée depuis le pied de page mais reste à écrire. Elle demande des informations que seul le client possède :

- Raison sociale et forme juridique
- Adresse du siège
- Numéro SIRET
- Numéro de TVA intracommunautaire
- Nom du directeur de la publication
- Nom et adresse de l'hébergeur

**Non bloquant** : le reste du module fonctionne sans. Le lien peut être ajouté au pied de page une fois la page écrite.

### C · Récapitulatif quotidien par email à l'admin

Aucun email n'est envoyé à l'admin dans la conception actuelle : le responsable consulte le back-office, ce qui préserve le quota gratuit de Resend.

**Question :** faut-il un récapitulatif du matin — « 14 réservations · 42 couverts aujourd'hui » ? Ce serait **un seul** email par jour de service, donc sans impact sur le quota.

*Avis :* utile, peu coûteux, mais à ajouter après la mise en production si le besoin se confirme.

---

## À fournir avant la mise en ligne

Ce ne sont plus des décisions, ce sont des données à saisir :

| Quoi | Où |
|---|---|
| Téléphone, adresse, email de contact | `/admin/settings`, à la première connexion |
| Services et capacités réels | `/admin/creneaux`, onglet Modèles |
| Nom de domaine | Chez Resend, avec les enregistrements DNS SPF, DKIM et DMARC |
| Raison sociale, SIRET, TVA, hébergeur | Page mentions légales |

---

## Décisions antérieures — pour mémoire

| Sujet | Décision |
|---|---|
| Table d'association créneau ↔ réservation | Abandonnée : relation 1-N, une colonne `creneau_id` suffit |
| Colonne « places disponibles » | Abandonnée : calculée, jamais stockée |
| Clôture des réservations | À l'heure du premier service de la journée |
| Validation | Automatique, pas de statut « en attente » |
| Téléphone | Obligatoire, pour prévenir en cas d'imprévu |
| Allergies | Pas de champ : données de santé, régime RGPD bien plus strict |
| SMS | Écarté — payant, et contraire à la minimisation |
| Fournisseur d'emails | Resend, offre gratuite (3 000/mois, 100/jour) |
| Jeton d'annulation | Hash SHA-256 en base, jeton en clair uniquement dans l'email |
| Purge à 30 jours | Anonymisation, pas suppression |
| Nom de la colonne | `couverts`, pas `nb_personnes` |
