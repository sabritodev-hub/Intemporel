-- Extension pour UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Catégories de plats
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Plats
CREATE TABLE plats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image TEXT,
  available BOOLEAN DEFAULT true,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Types d'options (définissables par l'admin)
CREATE TABLE option_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Options disponibles pour chaque type
CREATE TABLE options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  price_modifier DECIMAL(10, 2),
  option_type_id UUID NOT NULL REFERENCES option_types(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Relation many-to-many entre Plats et Options
CREATE TABLE plat_options (
  plat_id UUID NOT NULL REFERENCES plats(id) ON DELETE CASCADE,
  option_id UUID NOT NULL REFERENCES options(id) ON DELETE CASCADE,
  PRIMARY KEY (plat_id, option_id)
);

-- Administrateurs
CREATE TABLE admin_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Indexes pour les performances
CREATE INDEX idx_plats_category_id ON plats(category_id);
CREATE INDEX idx_plats_available ON plats(available);
CREATE INDEX idx_options_option_type_id ON options(option_type_id);
CREATE INDEX idx_plat_options_plat_id ON plat_options(plat_id);
CREATE INDEX idx_plat_options_option_id ON plat_options(option_id);

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Appliquer le trigger à toutes les tables
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plats_updated_at BEFORE UPDATE ON plats
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_option_types_updated_at BEFORE UPDATE ON option_types
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_options_updated_at BEFORE UPDATE ON options
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_profiles_updated_at BEFORE UPDATE ON admin_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Activer RLS sur toutes les tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE plats ENABLE ROW LEVEL SECURITY;
ALTER TABLE option_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE options ENABLE ROW LEVEL SECURITY;
ALTER TABLE plat_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;

-- Policies pour les catégories (lecture publique)
CREATE POLICY "Categories are viewable by everyone"
  ON categories FOR SELECT
  USING (true);

CREATE POLICY "Categories are insertable by authenticated users"
  ON categories FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Categories are updatable by authenticated users"
  ON categories FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Categories are deletable by authenticated users"
  ON categories FOR DELETE
  USING (auth.role() = 'authenticated');

-- Policies pour les plats (lecture publique)
CREATE POLICY "Plats are viewable by everyone"
  ON plats FOR SELECT
  USING (true);

CREATE POLICY "Plats are insertable by authenticated users"
  ON plats FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Plats are updatable by authenticated users"
  ON plats FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Plats are deletable by authenticated users"
  ON plats FOR DELETE
  USING (auth.role() = 'authenticated');

-- Policies pour option_types (lecture publique)
CREATE POLICY "Option types are viewable by everyone"
  ON option_types FOR SELECT
  USING (true);

CREATE POLICY "Option types are insertable by authenticated users"
  ON option_types FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Option types are updatable by authenticated users"
  ON option_types FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Option types are deletable by authenticated users"
  ON option_types FOR DELETE
  USING (auth.role() = 'authenticated');

-- Policies pour options (lecture publique)
CREATE POLICY "Options are viewable by everyone"
  ON options FOR SELECT
  USING (true);

CREATE POLICY "Options are insertable by authenticated users"
  ON options FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Options are updatable by authenticated users"
  ON options FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Options are deletable by authenticated users"
  ON options FOR DELETE
  USING (auth.role() = 'authenticated');

-- Policies pour plat_options (lecture publique)
CREATE POLICY "Plat options are viewable by everyone"
  ON plat_options FOR SELECT
  USING (true);

CREATE POLICY "Plat options are insertable by authenticated users"
  ON plat_options FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Plat options are deletable by authenticated users"
  ON plat_options FOR DELETE
  USING (auth.role() = 'authenticated');

-- Policies pour admin_profiles
CREATE POLICY "Admin profiles are viewable by owner"
  ON admin_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admin profiles are updatable by owner"
  ON admin_profiles FOR UPDATE
  USING (auth.uid() = id);
