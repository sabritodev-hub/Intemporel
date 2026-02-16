-- Table de configuration du site
CREATE TABLE IF NOT EXISTS site_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Activer RLS
ALTER TABLE site_config ENABLE ROW LEVEL SECURITY;

-- Policies pour site_config (lecture publique, écriture admin)
CREATE POLICY "Site config is viewable by everyone"
  ON site_config FOR SELECT
  USING (true);

CREATE POLICY "Site config is editable by authenticated users"
  ON site_config FOR ALL
  USING (auth.role() = 'authenticated');

-- Trigger pour updated_at
CREATE TRIGGER update_site_config_updated_at BEFORE UPDATE ON site_config
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insérer les configurations par défaut
INSERT INTO site_config (key, value, description) VALUES
  ('show_counter_button', 'true', 'Afficher le bouton "Voir au comptoir" sur les fiches produits'),
  ('site_name', 'Intemporel', 'Nom du site'),
  ('site_description', 'Bar à Desserts', 'Description du site')
ON CONFLICT (key) DO NOTHING;
