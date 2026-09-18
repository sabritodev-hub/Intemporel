# 08 — Sécurité et RGPD

---

## 1. La faille à corriger dans l'existant

C'est le point le plus important de ce dossier.

Les migrations `001` et `003` créent des policies de cette forme :

```sql
create policy "Enable insert for authenticated users" on plats
  for insert to authenticated with check (true);
```

`to authenticated` désigne **tout utilisateur connecté via Supabase Auth**, pas seulement un administrateur. Aujourd'hui l'impact est limité — seuls des plats et des catégories sont en base. Dès que le module de réservation stockera des **noms, emails et numéros de téléphone**, cette configuration devient une fuite de données personnelles.

La migration `006` la corrige.

```sql
-- =============================================================
-- 006_admin_policies.sql — restreindre l'écriture aux vrais admins
-- (is_admin() est défini dans 005)
-- =============================================================

-- CATEGORIES
drop policy if exists "Enable insert for authenticated users" on categories;
drop policy if exists "Enable update for authenticated users" on categories;
drop policy if exists "Enable delete for authenticated users" on categories;
create policy "admin_write_categories" on categories for all to authenticated
  using (is_admin()) with check (is_admin());

-- Répéter à l'identique pour : plats, option_types, options, plat_options, site_config.
-- Les policies de LECTURE publique (for select using (true)) sont conservées
-- pour categories, plats, option_types, options, plat_options et site_config.
```

Et pour le Storage :

```sql
drop policy if exists "Authenticated users can upload" on storage.objects;
drop policy if exists "Authenticated users can update" on storage.objects;
drop policy if exists "Authenticated users can delete" on storage.objects;

create policy "admin_upload" on storage.objects for insert to authenticated
  with check (bucket_id = 'desserts-images' and is_admin());
create policy "admin_update" on storage.objects for update to authenticated
  using (bucket_id = 'desserts-images' and is_admin())
  with check (bucket_id = 'desserts-images' and is_admin());
create policy "admin_delete" on storage.objects for delete to authenticated
  using (bucket_id = 'desserts-images' and is_admin());
-- "Public read access" est conservée.
```

### Conséquence à ne pas oublier

`is_admin()` teste la présence d'une ligne dans `admin_profiles`. **Tout compte admin existant doit y avoir sa ligne**, sinon il perd l'accès au back-office après cette migration :

```sql
insert into admin_profiles (id, name)
select id, coalesce(raw_user_meta_data->>'name', email) from auth.users
on conflict (id) do nothing;
```

À exécuter **avant** de basculer les policies, et à vérifier en se connectant avant de déployer.

### Une seconde barrière dans le middleware

`lib/supabase/middleware.ts` vérifie aujourd'hui qu'un utilisateur est connecté. Ajouter la vérification du rôle : un utilisateur connecté mais absent d'`admin_profiles` est redirigé vers `/`, pas vers `/admin/dashboard`.

La RLS reste la vraie barrière — le middleware ne fait qu'éviter d'afficher une page vide.

---

## 2. Protection du formulaire public

Quatre couches, dans cet ordre, dans la server action :

**Honeypot** — un champ texte masqué en CSS (`position: absolute; left: -9999px`, `tabindex="-1"`, `autocomplete="off"`). **Jamais `type="hidden"`** : les robots l'ignorent. S'il est rempli, renvoyer un faux succès sans rien insérer. Un robot qui reçoit une erreur réessaie ; un robot qui croit avoir réussi passe au suivant.

**Cloudflare Turnstile** — vérification **côté serveur** obligatoire :

```ts
const r = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ secret: process.env.TURNSTILE_SECRET_KEY, response: token, remoteip: ip }),
});
if (!(await r.json()).success) return { erreur: "Vérification anti-robot échouée. Réessayez." };
```

Turnstile est retenu plutôt que reCAPTCHA parce qu'il ne profile pas l'utilisateur : c'est ce que promet la politique de confidentialité.

**Limitation de débit** — 5 tentatives par tranche de 10 minutes et par IP :

```ts
const ipHash = sha256(ip + process.env.RATE_LIMIT_SEL);
```

L'IP n'est **jamais** stockée en clair : une IP est une donnée personnelle. Le journal est purgé au bout de 48 h par pg_cron.

**Validation zod** — nom 2 à 80 caractères, email au format valide, téléphone normalisable en E.164 français, couverts entiers entre 1 et 12, consentement strictement `true`. La validation côté client est du confort ; celle-ci fait foi.

---

## 3. Le jeton d'annulation

C'est le seul accès à une réservation : il doit être traité comme un mot de passe.

| Règle | Raison |
|---|---|
| 32 octets aléatoires (`randomBytes`), encodés base64url | Non devinable par force brute |
| Seul son **hash SHA-256** est stocké | Une fuite de la base ne permet d'annuler aucune réservation |
| En clair uniquement dans le corps de l'email | Aucun autre point d'exposition |
| Jamais journalisé, jamais renvoyé au navigateur | Les logs et l'historique du navigateur sont des fuites |
| Effacé à l'anonymisation (30 jours) | Un vieux lien ne rouvre rien |

La page `/reservation/annuler` porte `noindex` et est exclue du `robots.txt`.

Ne pas utiliser un simple `uuid` en colonne claire : c'est ce que proposait une première version du cahier des charges, et c'est moins sûr pour un coût d'implémentation identique.

---

## 4. Ce qui ne doit jamais fuiter vers le client

| Donnée | Où elle a le droit d'être |
|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` | Fichiers `import "server-only"` uniquement |
| `TURNSTILE_SECRET_KEY` | Server action uniquement |
| `RESEND_API_KEY` | `lib/email/*` uniquement |
| Email et téléphone d'un client | Back-office admin, et emails sortants |
| Jeton d'annulation en clair | Corps de l'email |

L'écran de confirmation public (`/reservation/confirmation/[id]`) n'affiche **ni nom, ni email, ni téléphone** : uniquement date, heure, nombre de personnes et référence.

La page d'annulation ne révèle rien sur un jeton inconnu : même message que pour un jeton inventé. Sinon elle devient un oracle qui confirme l'existence d'une réservation.

---

## 5. Minimisation et conservation

**Collecté** : nom, email, téléphone, nombre de personnes. Rien d'autre.

**Volontairement absent** :

- *Allergies et régimes* — données de santé au sens du RGPD, soumises à un régime bien plus strict. Un message invite à les signaler à l'arrivée.
- *Adresse postale, date de naissance, civilité* — sans usage pour tenir une table.
- *Case « recevoir nos actualités »* — ce serait une autre finalité, avec un autre consentement et une autre durée de conservation. Hors périmètre.

**Consentement** : case non pré-cochée, horodatée dans `consentement_at`. Une case pré-cochée est un consentement invalide.

**Conservation** : 30 jours après la fin du créneau, puis anonymisation automatique (`nom`, `email`, `telephone`, `token_annulation_hash` mis à `null`). Restent `couverts` et `statut`, qui ne permettent d'identifier personne et servent à préparer la production.

C'est une **anonymisation**, pas une pseudonymisation : rien ne permet de remonter à la personne, donc la ligne restante sort du champ du RGPD.

---

## 6. Droits des personnes

| Droit | Mise en œuvre |
|---|---|
| Accès | Sur demande email ou téléphone, réponse sous 30 jours |
| Rectification | Idem — l'admin modifie la réservation |
| Suppression | Le lien d'annulation, ou sur demande |
| Opposition / retrait du consentement | Sur demande |
| Recours | CNIL, mentionnée dans la politique de confidentialité |

Une fonction d'export ou de suppression en libre-service serait disproportionnée pour ce volume : le traitement manuel est acceptable et c'est ce qu'annonce la page.

---

## 7. Sous-traitants à déclarer

| Sous-traitant | Rôle | Localisation |
|---|---|---|
| Supabase | Hébergement, base de données | Union européenne (à confirmer dans les réglages du projet) |
| Resend | Envoi des emails | Envoi possible depuis l'Irlande ; **compte et logs aux États-Unis**, rétention 30 jours |
| Cloudflare | Turnstile | Mondial, sans profilage |

Le point Resend doit apparaître dans la politique de confidentialité, comme le fait déjà la maquette (« notre prestataire d'emailing »).

---

## 8. Avant la mise en ligne — liste de contrôle

- [ ] `006_admin_policies.sql` appliquée, et `admin_profiles` peuplée **avant**
- [ ] Connexion admin testée après la migration
- [ ] Un utilisateur connecté non-admin ne peut lire aucune réservation (test avec la clé anon)
- [ ] La vue `creneaux_publics` n'expose aucun nom, email ou téléphone
- [ ] `SUPABASE_SERVICE_ROLE_KEY` absente de tout bundle client (`grep` dans `.next/static`)
- [ ] Turnstile vérifié côté serveur, pas seulement affiché
- [ ] Limitation de débit active, IP hachée
- [ ] `/reservation/annuler` en `noindex` et exclue du `robots.txt`
- [ ] Job `anonymiser-reservations` planifié et testé sur une donnée ancienne
- [ ] HTTPS partout, cookies `secure` et `httpOnly`
- [ ] Politique de confidentialité et CGU publiées, liées depuis le formulaire et les emails
- [ ] `ignoreBuildErrors` et `ignoreDuringBuilds` retirés de `next.config.js`
