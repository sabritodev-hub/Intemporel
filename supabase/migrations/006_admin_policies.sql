-- =============================================================
-- 006_admin_policies.sql — restreindre l'écriture aux vrais admins
-- (is_admin() est défini dans 005_reservations.sql)
--
-- Corrige la faille des migrations 001/003 : les policies "for ... to
-- authenticated" traitaient TOUT utilisateur connecté comme un admin.
-- Sans danger tant que seuls des plats étaient en base ; devient une
-- fuite de données personnelles dès que les réservations (nom, email,
-- téléphone) existent. Voir docs/reservation/08-securite-rgpd.md.
--
-- IMPORTANT : exécuter d'abord le backfill ci-dessous, puis se
-- reconnecter au back-office pour vérifier l'accès AVANT de considérer
-- cette migration comme validée. Un compte admin sans ligne dans
-- admin_profiles perd l'accès au back-office après ce script.
-- =============================================================

-- ---------- Backfill : peupler admin_profiles pour tous les comptes existants ----------
insert into admin_profiles (id, name)
select id, coalesce(raw_user_meta_data->>'name', email) from auth.users
on conflict (id) do nothing;

-- ---------- CATEGORIES ----------
drop policy if exists "Enable insert for authenticated users" on categories;
drop policy if exists "Enable update for authenticated users" on categories;
drop policy if exists "Enable delete for authenticated users" on categories;
create policy "admin_write_categories" on categories for all to authenticated
  using (is_admin()) with check (is_admin());

-- ---------- PLATS ----------
drop policy if exists "Enable insert for authenticated users" on plats;
drop policy if exists "Enable update for authenticated users" on plats;
drop policy if exists "Enable delete for authenticated users" on plats;
create policy "admin_write_plats" on plats for all to authenticated
  using (is_admin()) with check (is_admin());

-- ---------- OPTION_TYPES ----------
drop policy if exists "Enable insert for authenticated users" on option_types;
drop policy if exists "Enable update for authenticated users" on option_types;
drop policy if exists "Enable delete for authenticated users" on option_types;
create policy "admin_write_option_types" on option_types for all to authenticated
  using (is_admin()) with check (is_admin());

-- ---------- OPTIONS ----------
drop policy if exists "Enable insert for authenticated users" on options;
drop policy if exists "Enable update for authenticated users" on options;
drop policy if exists "Enable delete for authenticated users" on options;
create policy "admin_write_options" on options for all to authenticated
  using (is_admin()) with check (is_admin());

-- ---------- PLAT_OPTIONS ----------
-- (jamais eu de policy update : table d'association sans colonne modifiable)
drop policy if exists "Enable insert for authenticated users" on plat_options;
drop policy if exists "Enable delete for authenticated users" on plat_options;
create policy "admin_write_plat_options" on plat_options for all to authenticated
  using (is_admin()) with check (is_admin());

-- ---------- SITE_CONFIG ----------
drop policy if exists "Enable insert for authenticated users" on site_config;
drop policy if exists "Enable update for authenticated users" on site_config;
drop policy if exists "Enable delete for authenticated users" on site_config;
create policy "admin_write_site_config" on site_config for all to authenticated
  using (is_admin()) with check (is_admin());

-- Les policies de LECTURE publique ("... viewable by everyone", for select
-- using (true)) sont conservées telles quelles sur ces six tables.

-- =============================================================
-- STORAGE — bucket desserts-images
-- =============================================================
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
