-- Données de départ pour le menu

-- Catégories
INSERT INTO categories (name, slug, "order") VALUES
  ('Gâteaux', 'gateaux', 1),
  ('Tartes', 'tartes', 2),
  ('Crèmes & Mousses', 'cremes-mousses', 3),
  ('Glaces & Sorbets', 'glaces-sorbets', 4),
  ('Boissons', 'boissons', 5);

-- Types d'options
INSERT INTO option_types (name, slug) VALUES
  ('Sauce', 'sauce'),
  ('Taille', 'taille'),
  ('Parfum', 'parfum'),
  ('Garniture', 'garniture'),
  ('Supplément', 'supplement');

-- Options pour Sauce
INSERT INTO options (name, price_modifier, option_type_id)
SELECT 'Caramel', 0.50, id FROM option_types WHERE slug = 'sauce';

INSERT INTO options (name, price_modifier, option_type_id)
SELECT 'Chocolat', 0.50, id FROM option_types WHERE slug = 'sauce';

INSERT INTO options (name, price_modifier, option_type_id)
SELECT 'Coulis de fraise', 0.75, id FROM option_types WHERE slug = 'sauce';

INSERT INTO options (name, price_modifier, option_type_id)
SELECT 'Coulis de framboise', 0.75, id FROM option_types WHERE slug = 'sauce';

-- Options pour Taille
INSERT INTO options (name, price_modifier, option_type_id)
SELECT 'Petite', 0.00, id FROM option_types WHERE slug = 'taille';

INSERT INTO options (name, price_modifier, option_type_id)
SELECT 'Moyenne', 1.50, id FROM option_types WHERE slug = 'taille';

INSERT INTO options (name, price_modifier, option_type_id)
SELECT 'Grande', 3.00, id FROM option_types WHERE slug = 'taille';

-- Options pour Parfum
INSERT INTO options (name, price_modifier, option_type_id)
SELECT 'Vanille', 0.00, id FROM option_types WHERE slug = 'parfum';

INSERT INTO options (name, price_modifier, option_type_id)
SELECT 'Chocolat', 0.00, id FROM option_types WHERE slug = 'parfum';

INSERT INTO options (name, price_modifier, option_type_id)
SELECT 'Café', 0.00, id FROM option_types WHERE slug = 'parfum';

INSERT INTO options (name, price_modifier, option_type_id)
SELECT 'Pistache', 0.50, id FROM option_types WHERE slug = 'parfum';

INSERT INTO options (name, price_modifier, option_type_id)
SELECT 'Fraise', 0.00, id FROM option_types WHERE slug = 'parfum';

-- Options pour Garniture
INSERT INTO options (name, price_modifier, option_type_id)
SELECT 'Chantilly', 1.00, id FROM option_types WHERE slug = 'garniture';

INSERT INTO options (name, price_modifier, option_type_id)
SELECT 'Fruits frais', 1.50, id FROM option_types WHERE slug = 'garniture';

INSERT INTO options (name, price_modifier, option_type_id)
SELECT 'Éclats de noisettes', 0.75, id FROM option_types WHERE slug = 'garniture';

-- Options pour Supplément
INSERT INTO options (name, price_modifier, option_type_id)
SELECT 'Boule de glace', 2.50, id FROM option_types WHERE slug = 'supplement';

INSERT INTO options (name, price_modifier, option_type_id)
SELECT 'Macaron', 2.00, id FROM option_types WHERE slug = 'supplement';
