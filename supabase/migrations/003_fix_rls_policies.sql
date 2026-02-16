-- =============================================
-- CORRECTION DES POLICIES RLS
-- À exécuter dans Supabase SQL Editor
-- =============================================

-- Supprimer les anciennes policies problématiques
DROP POLICY IF EXISTS "Categories are editable by admins only" ON categories;
DROP POLICY IF EXISTS "Categories are insertable by authenticated users" ON categories;
DROP POLICY IF EXISTS "Categories are updatable by authenticated users" ON categories;
DROP POLICY IF EXISTS "Categories are deletable by authenticated users" ON categories;

DROP POLICY IF EXISTS "Plats are editable by admins only" ON plats;
DROP POLICY IF EXISTS "Plats are insertable by authenticated users" ON plats;
DROP POLICY IF EXISTS "Plats are updatable by authenticated users" ON plats;
DROP POLICY IF EXISTS "Plats are deletable by authenticated users" ON plats;

DROP POLICY IF EXISTS "Option types are editable by admins only" ON option_types;
DROP POLICY IF EXISTS "Option types are insertable by authenticated users" ON option_types;
DROP POLICY IF EXISTS "Option types are updatable by authenticated users" ON option_types;
DROP POLICY IF EXISTS "Option types are deletable by authenticated users" ON option_types;

DROP POLICY IF EXISTS "Options are editable by admins only" ON options;
DROP POLICY IF EXISTS "Options are insertable by authenticated users" ON options;
DROP POLICY IF EXISTS "Options are updatable by authenticated users" ON options;
DROP POLICY IF EXISTS "Options are deletable by authenticated users" ON options;

DROP POLICY IF EXISTS "Plat options are editable by admins only" ON plat_options;
DROP POLICY IF EXISTS "Plat options are insertable by authenticated users" ON plat_options;
DROP POLICY IF EXISTS "Plat options are deletable by authenticated users" ON plat_options;

DROP POLICY IF EXISTS "Site config is editable by authenticated users" ON site_config;

-- =============================================
-- NOUVELLES POLICIES - CATEGORIES
-- =============================================
CREATE POLICY "Enable insert for authenticated users" ON categories
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON categories
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users" ON categories
  FOR DELETE TO authenticated
  USING (true);

-- =============================================
-- NOUVELLES POLICIES - PLATS
-- =============================================
CREATE POLICY "Enable insert for authenticated users" ON plats
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON plats
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users" ON plats
  FOR DELETE TO authenticated
  USING (true);

-- =============================================
-- NOUVELLES POLICIES - OPTION_TYPES
-- =============================================
CREATE POLICY "Enable insert for authenticated users" ON option_types
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON option_types
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users" ON option_types
  FOR DELETE TO authenticated
  USING (true);

-- =============================================
-- NOUVELLES POLICIES - OPTIONS
-- =============================================
CREATE POLICY "Enable insert for authenticated users" ON options
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON options
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users" ON options
  FOR DELETE TO authenticated
  USING (true);

-- =============================================
-- NOUVELLES POLICIES - PLAT_OPTIONS
-- =============================================
CREATE POLICY "Enable insert for authenticated users" ON plat_options
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users" ON plat_options
  FOR DELETE TO authenticated
  USING (true);

-- =============================================
-- NOUVELLES POLICIES - SITE_CONFIG
-- =============================================
CREATE POLICY "Enable insert for authenticated users" ON site_config
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON site_config
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users" ON site_config
  FOR DELETE TO authenticated
  USING (true);
