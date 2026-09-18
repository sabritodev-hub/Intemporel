-- =============================================================
-- 005_reservations.sql — Module de réservation brunch
-- Voir docs/reservation/00-regles-metier.md et 01-base-de-donnees.md
-- =============================================================

create extension if not exists pgcrypto;   -- gen_random_uuid, digest

-- ---------- Types ----------
create type statut_creneau as enum ('ouvert', 'ferme', 'annule');
create type statut_resa as enum (
  'confirmee', 'venue', 'absent', 'annulee_client', 'annulee_restaurant'
);

-- ---------- Rôle admin ----------
-- Remplace le "tout utilisateur connecté est admin" des migrations existantes.
create or replace function is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from admin_profiles where id = auth.uid());
$$;

-- ---------- Modèles de créneaux ----------
-- Un modèle = un service récurrent. Gabarit de la génération mensuelle,
-- jamais réservable directement.
create table modeles_creneaux (
  id            uuid primary key default gen_random_uuid(),
  service       text not null default 'brunch',
  jour_semaine  smallint not null check (jour_semaine between 0 and 6), -- 0=dim, 6=sam (= getDay() JS = extract(dow))
  heure_debut   time not null,
  heure_fin     time not null,
  capacite      int  not null check (capacite > 0),
  actif         boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  check (heure_fin > heure_debut)
);

-- ---------- Créneaux ----------
-- Les services réels, datés.
create table creneaux (
  id               uuid primary key default gen_random_uuid(),
  service          text not null default 'brunch',
  modele_id        uuid references modeles_creneaux(id) on delete set null, -- null si créé à la main
  debut            timestamptz not null,
  fin              timestamptz not null,
  capacite         int not null check (capacite > 0),
  statut           statut_creneau not null default 'ouvert',
  motif_annulation text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  check (fin > debut),
  unique (service, debut)     -- rend la génération mensuelle idempotente
);
create index idx_creneaux_debut on creneaux (debut);
create index idx_creneaux_jour  on creneaux (service, ((debut at time zone 'Europe/Paris')::date));

-- ---------- Réservations ----------
create table reservations (
  id                    uuid primary key default gen_random_uuid(),
  creneau_id            uuid not null references creneaux(id) on delete restrict,
  reference             text not null unique,        -- BR-7F42, affiché au client
  nom                   text,                        -- null après anonymisation
  email                 text,
  telephone             text,                        -- E.164 : +33612345678
  couverts              int not null check (couverts between 1 and 50),
  statut                statut_resa not null default 'confirmee',
  source                text not null default 'en_ligne'
                        check (source in ('en_ligne', 'admin')),
  token_annulation_hash text unique,                 -- sha256 du jeton ; le jeton en clair n'est jamais stocké
  consentement_at       timestamptz,
  annule_at             timestamptz,
  anonymise_at          timestamptz,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  -- tant que la réservation n'est pas anonymisée, nom et téléphone sont obligatoires
  check (anonymise_at is not null or (nom is not null and telephone is not null)),
  check (telephone is null or telephone ~ '^\+[1-9][0-9]{7,14}$')
);
create index idx_reservations_creneau on reservations (creneau_id, statut);
create index idx_reservations_purge   on reservations (anonymise_at) where anonymise_at is null;

-- ---------- Limitation de débit (anti-spam) ----------
create table reservation_tentatives (
  id       bigserial primary key,
  ip_hash  text not null,          -- sha256(ip + sel), jamais l'IP en clair
  creee_le timestamptz not null default now()
);
create index idx_tentatives on reservation_tentatives (ip_hash, creee_le);

-- ---------- Triggers updated_at ----------
-- update_updated_at_column() est déjà défini en 001_initial_schema.sql
create trigger trg_modeles_updated before update on modeles_creneaux
  for each row execute function update_updated_at_column();
create trigger trg_creneaux_updated before update on creneaux
  for each row execute function update_updated_at_column();
create trigger trg_reservations_updated before update on reservations
  for each row execute function update_updated_at_column();

-- ---------- RLS ----------
alter table modeles_creneaux       enable row level security;
alter table creneaux               enable row level security;
alter table reservations           enable row level security;
alter table reservation_tentatives enable row level security;

create policy "admin_all_modeles" on modeles_creneaux for all to authenticated
  using (is_admin()) with check (is_admin());

create policy "admin_all_creneaux" on creneaux for all to authenticated
  using (is_admin()) with check (is_admin());

create policy "admin_select_resa" on reservations for select to authenticated
  using (is_admin());
create policy "admin_insert_resa" on reservations for insert to authenticated
  with check (is_admin());
create policy "admin_update_resa" on reservations for update to authenticated
  using (is_admin()) with check (is_admin());

-- Aucune policy pour anon, nulle part. Le public ne touche la base
-- qu'à travers la vue creneaux_publics et les fonctions appelées côté serveur.

-- ---------- Vue publique des disponibilités ----------
-- security_invoker reste à false (défaut) : la vue s'exécute avec les droits
-- de son propriétaire et contourne la RLS de reservations. C'est voulu — elle
-- n'expose que des agrégats, jamais une ligne nominative.
create view creneaux_publics
with (security_barrier = true) as
with occupation as (
  select creneau_id, sum(couverts)::int as occupees
  from reservations
  where statut in ('confirmee', 'venue')
  group by creneau_id
),
premiers as (
  select service,
         (debut at time zone 'Europe/Paris')::date as jour,
         min(debut) as premier_debut
  from creneaux
  where statut <> 'annule'
  group by 1, 2
)
select
  c.id,
  c.service,
  c.debut,
  c.fin,
  p.jour,
  c.statut,
  c.capacite,
  coalesce(o.occupees, 0) as couverts_reserves,
  greatest(c.capacite - coalesce(o.occupees, 0), 0) as places_restantes,
  (c.statut = 'ouvert'
   and now() < p.premier_debut
   and c.capacite - coalesce(o.occupees, 0) > 0) as reservable,
  (now() >= p.premier_debut) as journee_close
from creneaux c
join premiers p
  on p.service = c.service
 and p.jour = (c.debut at time zone 'Europe/Paris')::date
left join occupation o on o.creneau_id = c.id
where c.statut <> 'annule'
  and c.debut >= (date_trunc('month', now() at time zone 'Europe/Paris'))
                 at time zone 'Europe/Paris'
  and c.debut <  (date_trunc('month', now() at time zone 'Europe/Paris') + interval '2 months')
                 at time zone 'Europe/Paris';

grant select on creneaux_publics to anon, authenticated;

-- ---------- Fonction reserver() — le point critique ----------
create or replace function reserver(
  p_creneau_id uuid,
  p_nom        text,
  p_email      text,
  p_telephone  text,
  p_couverts   int,
  p_token_hash text,
  p_reference  text
) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_c       creneaux%rowtype;
  v_premier timestamptz;
  v_occupees int;
  v_id      uuid;
begin
  -- VERROU : sérialise les réservations concurrentes sur ce créneau.
  -- Sans ce for update, deux clients peuvent prendre la même dernière place.
  select * into v_c from creneaux where id = p_creneau_id for update;

  if not found or v_c.statut <> 'ouvert' then
    raise exception 'CRENEAU_INDISPONIBLE';
  end if;

  -- Période réservable : mois courant + mois suivant
  if v_c.debut >= (date_trunc('month', now() at time zone 'Europe/Paris') + interval '2 months')
                  at time zone 'Europe/Paris' then
    raise exception 'HORS_PERIODE';
  end if;

  -- Clôture au premier service de la journée
  select min(debut) into v_premier
  from creneaux
  where service = v_c.service
    and statut <> 'annule'
    and (debut at time zone 'Europe/Paris')::date = (v_c.debut at time zone 'Europe/Paris')::date;

  if now() >= v_premier then
    raise exception 'RESERVATIONS_CLOSES';
  end if;

  if p_couverts is null or p_couverts < 1 or p_couverts > 12 then
    raise exception 'COUVERTS_INVALIDE';
  end if;

  if coalesce(trim(p_nom), '') = ''
     or coalesce(trim(p_email), '') = ''
     or coalesce(trim(p_telephone), '') = '' then
    raise exception 'CHAMPS_MANQUANTS';
  end if;

  select coalesce(sum(couverts), 0) into v_occupees
  from reservations
  where creneau_id = p_creneau_id and statut in ('confirmee', 'venue');

  if v_occupees + p_couverts > v_c.capacite then
    raise exception 'COMPLET';
  end if;

  insert into reservations
    (creneau_id, reference, nom, email, telephone, couverts,
     token_annulation_hash, consentement_at, source)
  values
    (p_creneau_id, p_reference, trim(p_nom), lower(trim(p_email)), p_telephone,
     p_couverts, p_token_hash, now(), 'en_ligne')
  returning id into v_id;

  return v_id;
end $$;

revoke all on function reserver(uuid, text, text, text, int, text, text)
  from public, anon, authenticated;
grant execute on function reserver(uuid, text, text, text, int, text, text)
  to service_role;

-- ---------- Consulter et annuler par jeton ----------
-- Deux fonctions séparées : consulter ne modifie rien et ne renvoie aucune
-- coordonnée ; annuler renvoie l'email parce que le serveur doit envoyer la
-- confirmation d'annulation (cet email ne repasse jamais au navigateur).

create or replace function consulter_par_token(p_token_hash text)
returns table (
  reference  text,
  debut      timestamptz,
  fin        timestamptz,
  couverts   int,
  statut     statut_resa,
  annulable  boolean,
  annule_at  timestamptz
)
language sql stable security definer set search_path = public as $$
  select r.reference, c.debut, c.fin, r.couverts, r.statut,
         (r.statut = 'confirmee' and now() <= c.debut - interval '24 hours'),
         r.annule_at
  from reservations r
  join creneaux c on c.id = r.creneau_id
  where r.token_annulation_hash = p_token_hash
    and r.anonymise_at is null;
$$;

create or replace function annuler_par_token(p_token_hash text)
returns table (id uuid, reference text, email text, nom text,
               debut timestamptz, fin timestamptz, couverts int)
language plpgsql security definer set search_path = public as $$
declare
  v_id    uuid;
  v_debut timestamptz;
  v_statut statut_resa;
begin
  select r.id, c.debut, r.statut into v_id, v_debut, v_statut
  from reservations r
  join creneaux c on c.id = r.creneau_id
  where r.token_annulation_hash = p_token_hash
    and r.anonymise_at is null
  for update of r;

  if v_id is null              then raise exception 'TOKEN_INVALIDE'; end if;
  if v_statut <> 'confirmee'   then raise exception 'DEJA_ANNULEE';  end if;
  if now() > v_debut - interval '24 hours' then raise exception 'DELAI_DEPASSE'; end if;

  update reservations
     set statut = 'annulee_client', annule_at = now()
   where reservations.id = v_id;

  return query
    select r.id, r.reference, r.email, r.nom, c.debut, c.fin, r.couverts
    from reservations r join creneaux c on c.id = r.creneau_id
    where r.id = v_id;
end $$;

revoke all on function consulter_par_token(text) from public, anon, authenticated;
revoke all on function annuler_par_token(text)   from public, anon, authenticated;
grant execute on function consulter_par_token(text) to service_role;
grant execute on function annuler_par_token(text)   to service_role;

-- ---------- Génération mensuelle ----------
create or replace function generer_creneaux(p_mois date) returns int
language plpgsql security definer set search_path = public as $$
declare v_count int;
begin
  if not is_admin() then raise exception 'NON_AUTORISE'; end if;

  insert into creneaux (service, modele_id, debut, fin, capacite)
  select m.service,
         m.id,
         (d::date + m.heure_debut) at time zone 'Europe/Paris',
         (d::date + m.heure_fin)   at time zone 'Europe/Paris',
         m.capacite
  from generate_series(
         date_trunc('month', p_mois)::date,
         (date_trunc('month', p_mois) + interval '1 month - 1 day')::date,
         interval '1 day'
       ) d
  join modeles_creneaux m
    on m.actif and m.jour_semaine = extract(dow from d)
  on conflict (service, debut) do nothing;    -- idempotent

  get diagnostics v_count = row_count;
  return v_count;
end $$;

-- ---------- Annulation d'un créneau par le restaurant ----------
create or replace function annuler_creneau(p_creneau_id uuid, p_motif text)
returns table (id uuid, reference text, email text, nom text,
               telephone text, couverts int)
language plpgsql security definer set search_path = public as $$
begin
  if not is_admin() then raise exception 'NON_AUTORISE'; end if;
  if coalesce(trim(p_motif), '') = '' then raise exception 'MOTIF_REQUIS'; end if;

  update creneaux
     set statut = 'annule', motif_annulation = trim(p_motif)
   where creneaux.id = p_creneau_id;

  return query
    update reservations r
       set statut = 'annulee_restaurant', annule_at = now()
     where r.creneau_id = p_creneau_id and r.statut = 'confirmee'
    returning r.id, r.reference, r.email, r.nom, r.telephone, r.couverts;
end $$;

-- ---------- Modifier la capacité d'un créneau ----------
create or replace function modifier_capacite(p_creneau_id uuid, p_capacite int)
returns int
language plpgsql security definer set search_path = public as $$
declare v_occupees int;
begin
  if not is_admin() then raise exception 'NON_AUTORISE'; end if;

  select coalesce(sum(couverts), 0) into v_occupees
  from reservations
  where creneau_id = p_creneau_id and statut in ('confirmee', 'venue');

  if p_capacite < v_occupees then
    raise exception 'CAPACITE_TROP_BASSE:%', v_occupees;  -- le front lit le nombre après ':'
  end if;

  update creneaux set capacite = p_capacite where id = p_creneau_id;
  return v_occupees;
end $$;

-- ---------- Purge automatique (pg_cron) ----------
-- Extension à activer une fois dans le dashboard Supabase :
-- Database > Extensions > pg_cron (déjà présente sur la stack locale Supabase CLI)
create extension if not exists pg_cron;

select cron.schedule('anonymiser-reservations', '0 3 * * *', $$
  update reservations r
     set nom = null,
         email = null,
         telephone = null,
         token_annulation_hash = null,
         anonymise_at = now()
    from creneaux c
   where c.id = r.creneau_id
     and r.anonymise_at is null
     and c.fin < now() - interval '30 days'
$$);

-- Nettoyage du journal anti-spam
select cron.schedule('purger-tentatives', '30 3 * * *', $$
  delete from reservation_tentatives where creee_le < now() - interval '2 days'
$$);

-- ---------- Configuration du site ----------
insert into site_config (key, value, description) values
  ('reservations_actives',  'true', 'Afficher le bouton Réserver et ouvrir le formulaire'),
  ('telephone_restaurant',  '',     'Téléphone affiché (annulation < 24 h, groupes > 12). Saisi en clair, stocké en E.164'),
  ('adresse_restaurant',    '',     'Adresse affichée dans les emails et les pages légales'),
  ('email_contact',         '',     'Adresse de réponse (reply-to) des emails'),
  ('retention_table_min',   '20',   'Minutes pendant lesquelles la table est gardée en cas de retard')
on conflict (key) do nothing;
