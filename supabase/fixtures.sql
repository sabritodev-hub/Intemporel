-- =============================================
-- FIXTURES - Données de démonstration
-- Bar à Desserts "Intemporel"
-- =============================================

-- Nettoyer les données existantes (optionnel)
-- TRUNCATE plat_options, options, option_types, plats, categories CASCADE;

-- =============================================
-- CATÉGORIES
-- =============================================
INSERT INTO categories (name, slug, "order") VALUES
  ('Gâteaux', 'gateaux', 1),
  ('Tartes', 'tartes', 2),
  ('Crèmes & Mousses', 'cremes-mousses', 3),
  ('Glaces & Sorbets', 'glaces-sorbets', 4),
  ('Viennoiseries', 'viennoiseries', 5),
  ('Créations du Chef', 'creations-chef', 6),
  ('Boissons Chaudes', 'boissons-chaudes', 7),
  ('Boissons Froides', 'boissons-froides', 8)
ON CONFLICT (slug) DO NOTHING;

-- =============================================
-- TYPES D'OPTIONS
-- =============================================
INSERT INTO option_types (name, slug) VALUES
  ('Sauce', 'sauce'),
  ('Taille', 'taille'),
  ('Parfum', 'parfum'),
  ('Garniture', 'garniture'),
  ('Supplément', 'supplement'),
  ('Température', 'temperature'),
  ('Lait', 'lait')
ON CONFLICT (slug) DO NOTHING;

-- =============================================
-- OPTIONS
-- =============================================

-- Sauces
INSERT INTO options (name, price_modifier, option_type_id)
SELECT 'Caramel beurre salé', 0.80, id FROM option_types WHERE slug = 'sauce';

INSERT INTO options (name, price_modifier, option_type_id)
SELECT 'Chocolat noir 70%', 0.80, id FROM option_types WHERE slug = 'sauce';

INSERT INTO options (name, price_modifier, option_type_id)
SELECT 'Chocolat blanc', 0.80, id FROM option_types WHERE slug = 'sauce';

INSERT INTO options (name, price_modifier, option_type_id)
SELECT 'Coulis de framboise', 1.00, id FROM option_types WHERE slug = 'sauce';

INSERT INTO options (name, price_modifier, option_type_id)
SELECT 'Coulis de fruits rouges', 1.00, id FROM option_types WHERE slug = 'sauce';

INSERT INTO options (name, price_modifier, option_type_id)
SELECT 'Coulis de mangue', 1.20, id FROM option_types WHERE slug = 'sauce';

INSERT INTO options (name, price_modifier, option_type_id)
SELECT 'Crème anglaise', 1.00, id FROM option_types WHERE slug = 'sauce';

-- Tailles
INSERT INTO options (name, price_modifier, option_type_id)
SELECT 'Petite', 0.00, id FROM option_types WHERE slug = 'taille';

INSERT INTO options (name, price_modifier, option_type_id)
SELECT 'Moyenne', 2.00, id FROM option_types WHERE slug = 'taille';

INSERT INTO options (name, price_modifier, option_type_id)
SELECT 'Grande', 4.00, id FROM option_types WHERE slug = 'taille';

INSERT INTO options (name, price_modifier, option_type_id)
SELECT 'À partager (2 pers.)', 6.00, id FROM option_types WHERE slug = 'taille';

-- Parfums (glaces)
INSERT INTO options (name, price_modifier, option_type_id)
SELECT 'Vanille de Madagascar', 0.00, id FROM option_types WHERE slug = 'parfum';

INSERT INTO options (name, price_modifier, option_type_id)
SELECT 'Chocolat intense', 0.00, id FROM option_types WHERE slug = 'parfum';

INSERT INTO options (name, price_modifier, option_type_id)
SELECT 'Café arabica', 0.00, id FROM option_types WHERE slug = 'parfum';

INSERT INTO options (name, price_modifier, option_type_id)
SELECT 'Pistache de Sicile', 0.50, id FROM option_types WHERE slug = 'parfum';

INSERT INTO options (name, price_modifier, option_type_id)
SELECT 'Fraise', 0.00, id FROM option_types WHERE slug = 'parfum';

INSERT INTO options (name, price_modifier, option_type_id)
SELECT 'Citron de Menton', 0.00, id FROM option_types WHERE slug = 'parfum';

INSERT INTO options (name, price_modifier, option_type_id)
SELECT 'Caramel', 0.00, id FROM option_types WHERE slug = 'parfum';

INSERT INTO options (name, price_modifier, option_type_id)
SELECT 'Praliné noisette', 0.50, id FROM option_types WHERE slug = 'parfum';

INSERT INTO options (name, price_modifier, option_type_id)
SELECT 'Sorbet mangue', 0.00, id FROM option_types WHERE slug = 'parfum';

INSERT INTO options (name, price_modifier, option_type_id)
SELECT 'Sorbet passion', 0.00, id FROM option_types WHERE slug = 'parfum';

-- Garnitures
INSERT INTO options (name, price_modifier, option_type_id)
SELECT 'Chantilly maison', 1.00, id FROM option_types WHERE slug = 'garniture';

INSERT INTO options (name, price_modifier, option_type_id)
SELECT 'Fruits frais de saison', 2.00, id FROM option_types WHERE slug = 'garniture';

INSERT INTO options (name, price_modifier, option_type_id)
SELECT 'Éclats de noisettes', 0.80, id FROM option_types WHERE slug = 'garniture';

INSERT INTO options (name, price_modifier, option_type_id)
SELECT 'Amandes effilées', 0.80, id FROM option_types WHERE slug = 'garniture';

INSERT INTO options (name, price_modifier, option_type_id)
SELECT 'Meringue italienne', 1.20, id FROM option_types WHERE slug = 'garniture';

INSERT INTO options (name, price_modifier, option_type_id)
SELECT 'Spéculoos émietté', 0.80, id FROM option_types WHERE slug = 'garniture';

INSERT INTO options (name, price_modifier, option_type_id)
SELECT 'Nougatine', 1.00, id FROM option_types WHERE slug = 'garniture';

-- Suppléments
INSERT INTO options (name, price_modifier, option_type_id)
SELECT 'Boule de glace', 2.50, id FROM option_types WHERE slug = 'supplement';

INSERT INTO options (name, price_modifier, option_type_id)
SELECT 'Macaron', 2.20, id FROM option_types WHERE slug = 'supplement';

INSERT INTO options (name, price_modifier, option_type_id)
SELECT 'Tuile aux amandes', 1.50, id FROM option_types WHERE slug = 'supplement';

INSERT INTO options (name, price_modifier, option_type_id)
SELECT 'Financier', 2.00, id FROM option_types WHERE slug = 'supplement';

-- Température (boissons)
INSERT INTO options (name, price_modifier, option_type_id)
SELECT 'Chaud', 0.00, id FROM option_types WHERE slug = 'temperature';

INSERT INTO options (name, price_modifier, option_type_id)
SELECT 'Tiède', 0.00, id FROM option_types WHERE slug = 'temperature';

INSERT INTO options (name, price_modifier, option_type_id)
SELECT 'Glacé', 0.00, id FROM option_types WHERE slug = 'temperature';

-- Lait (boissons)
INSERT INTO options (name, price_modifier, option_type_id)
SELECT 'Lait entier', 0.00, id FROM option_types WHERE slug = 'lait';

INSERT INTO options (name, price_modifier, option_type_id)
SELECT 'Lait d''avoine', 0.50, id FROM option_types WHERE slug = 'lait';

INSERT INTO options (name, price_modifier, option_type_id)
SELECT 'Lait d''amande', 0.50, id FROM option_types WHERE slug = 'lait';

INSERT INTO options (name, price_modifier, option_type_id)
SELECT 'Sans lait', 0.00, id FROM option_types WHERE slug = 'lait';

-- =============================================
-- PLATS - GÂTEAUX
-- =============================================
INSERT INTO plats (name, slug, description, price, available, category_id)
SELECT
  'Fondant au chocolat',
  'fondant-chocolat',
  'Gâteau au chocolat noir 70% au cœur coulant, servi tiède. Un classique revisité avec passion.',
  8.50,
  true,
  id
FROM categories WHERE slug = 'gateaux';

INSERT INTO plats (name, slug, description, price, available, category_id)
SELECT
  'Cheesecake New-Yorkais',
  'cheesecake-new-yorkais',
  'Authentique cheesecake crémeux sur biscuit spéculoos, coulis de fruits rouges maison.',
  9.00,
  true,
  id
FROM categories WHERE slug = 'gateaux';

INSERT INTO plats (name, slug, description, price, available, category_id)
SELECT
  'Tiramisu traditionnel',
  'tiramisu-traditionnel',
  'Recette italienne authentique aux biscuits imbibés de café, mascarpone onctueux et cacao.',
  8.00,
  true,
  id
FROM categories WHERE slug = 'gateaux';

INSERT INTO plats (name, slug, description, price, available, category_id)
SELECT
  'Opéra',
  'opera',
  'Entremet café-chocolat aux fines couches de biscuit Joconde, ganache et crème au café.',
  9.50,
  true,
  id
FROM categories WHERE slug = 'gateaux';

INSERT INTO plats (name, slug, description, price, available, category_id)
SELECT
  'Fraisier',
  'fraisier',
  'Génoise moelleuse, crème mousseline à la vanille et fraises fraîches de saison.',
  10.00,
  true,
  id
FROM categories WHERE slug = 'gateaux';

INSERT INTO plats (name, slug, description, price, available, category_id)
SELECT
  'Forêt Noire',
  'foret-noire',
  'Génoise au cacao, chantilly légère, cerises amarena et copeaux de chocolat.',
  9.00,
  false,
  id
FROM categories WHERE slug = 'gateaux';

-- =============================================
-- PLATS - TARTES
-- =============================================
INSERT INTO plats (name, slug, description, price, available, category_id)
SELECT
  'Tarte au citron meringuée',
  'tarte-citron-meringuee',
  'Pâte sablée croustillante, crème citron acidulée et meringue italienne flambée.',
  7.50,
  true,
  id
FROM categories WHERE slug = 'tartes';

INSERT INTO plats (name, slug, description, price, available, category_id)
SELECT
  'Tarte Tatin',
  'tarte-tatin',
  'Pommes caramélisées au beurre demi-sel sur pâte feuilletée maison. Servie tiède.',
  8.00,
  true,
  id
FROM categories WHERE slug = 'tartes';

INSERT INTO plats (name, slug, description, price, available, category_id)
SELECT
  'Tarte aux fruits rouges',
  'tarte-fruits-rouges',
  'Pâte sucrée, crème pâtissière vanille et assortiment de fruits rouges frais.',
  8.50,
  true,
  id
FROM categories WHERE slug = 'tartes';

INSERT INTO plats (name, slug, description, price, available, category_id)
SELECT
  'Tarte chocolat-caramel',
  'tarte-chocolat-caramel',
  'Ganache chocolat intense sur lit de caramel beurre salé, fleur de sel.',
  9.00,
  true,
  id
FROM categories WHERE slug = 'tartes';

INSERT INTO plats (name, slug, description, price, available, category_id)
SELECT
  'Tarte fine aux pommes',
  'tarte-fine-pommes',
  'Fine couche de pâte feuilletée, fines tranches de pommes et caramel léger.',
  7.00,
  true,
  id
FROM categories WHERE slug = 'tartes';

-- =============================================
-- PLATS - CRÈMES & MOUSSES
-- =============================================
INSERT INTO plats (name, slug, description, price, available, category_id)
SELECT
  'Crème brûlée vanille',
  'creme-brulee-vanille',
  'Onctueuse crème à la vanille bourbon, caramélisée minute devant vous.',
  7.00,
  true,
  id
FROM categories WHERE slug = 'cremes-mousses';

INSERT INTO plats (name, slug, description, price, available, category_id)
SELECT
  'Panna cotta',
  'panna-cotta',
  'Crème italienne délicatement vanillée, coulis au choix.',
  6.50,
  true,
  id
FROM categories WHERE slug = 'cremes-mousses';

INSERT INTO plats (name, slug, description, price, available, category_id)
SELECT
  'Mousse au chocolat',
  'mousse-chocolat',
  'Mousse aérienne au chocolat noir 64%, éclats de fève de cacao.',
  6.00,
  true,
  id
FROM categories WHERE slug = 'cremes-mousses';

INSERT INTO plats (name, slug, description, price, available, category_id)
SELECT
  'Île flottante',
  'ile-flottante',
  'Nuage de meringue sur crème anglaise, caramel filé et pralin.',
  7.50,
  true,
  id
FROM categories WHERE slug = 'cremes-mousses';

INSERT INTO plats (name, slug, description, price, available, category_id)
SELECT
  'Riz au lait caramélisé',
  'riz-lait-caramelise',
  'Riz rond crémeux cuit au lait, vanille et caramel coulant.',
  6.00,
  true,
  id
FROM categories WHERE slug = 'cremes-mousses';

-- =============================================
-- PLATS - GLACES & SORBETS
-- =============================================
INSERT INTO plats (name, slug, description, price, available, category_id)
SELECT
  'Coupe 2 boules',
  'coupe-2-boules',
  'Deux boules de glace ou sorbet artisanal au choix, chantilly et tuile.',
  6.00,
  true,
  id
FROM categories WHERE slug = 'glaces-sorbets';

INSERT INTO plats (name, slug, description, price, available, category_id)
SELECT
  'Coupe 3 boules',
  'coupe-3-boules',
  'Trois boules de glace ou sorbet artisanal au choix, chantilly et tuile.',
  8.00,
  true,
  id
FROM categories WHERE slug = 'glaces-sorbets';

INSERT INTO plats (name, slug, description, price, available, category_id)
SELECT
  'Dame Blanche',
  'dame-blanche',
  'Glace vanille, sauce chocolat chaud, chantilly et amandes effilées.',
  9.00,
  true,
  id
FROM categories WHERE slug = 'glaces-sorbets';

INSERT INTO plats (name, slug, description, price, available, category_id)
SELECT
  'Café Liégeois',
  'cafe-liegeois',
  'Glace café, espresso, chantilly et grains de café enrobés.',
  8.50,
  true,
  id
FROM categories WHERE slug = 'glaces-sorbets';

INSERT INTO plats (name, slug, description, price, available, category_id)
SELECT
  'Colonel',
  'colonel',
  'Sorbet citron arrosé de vodka premium, zeste de citron.',
  9.50,
  true,
  id
FROM categories WHERE slug = 'glaces-sorbets';

INSERT INTO plats (name, slug, description, price, available, category_id)
SELECT
  'Banana Split',
  'banana-split',
  'Banane fraîche, 3 boules de glace, chocolat, chantilly et fruits secs.',
  11.00,
  true,
  id
FROM categories WHERE slug = 'glaces-sorbets';

-- =============================================
-- PLATS - VIENNOISERIES
-- =============================================
INSERT INTO plats (name, slug, description, price, available, category_id)
SELECT
  'Pain au chocolat',
  'pain-chocolat',
  'Viennoiserie feuilletée pur beurre, deux barres de chocolat noir.',
  3.20,
  true,
  id
FROM categories WHERE slug = 'viennoiseries';

INSERT INTO plats (name, slug, description, price, available, category_id)
SELECT
  'Croissant aux amandes',
  'croissant-amandes',
  'Croissant garni de crème d''amandes, amandes effilées grillées.',
  4.00,
  true,
  id
FROM categories WHERE slug = 'viennoiseries';

INSERT INTO plats (name, slug, description, price, available, category_id)
SELECT
  'Brioche perdue',
  'brioche-perdue',
  'Brioche dorée au beurre, sirop d''érable, fruits frais.',
  7.50,
  true,
  id
FROM categories WHERE slug = 'viennoiseries';

INSERT INTO plats (name, slug, description, price, available, category_id)
SELECT
  'Éclair au café',
  'eclair-cafe',
  'Pâte à choux, crème pâtissière au café, glaçage fondant.',
  4.50,
  true,
  id
FROM categories WHERE slug = 'viennoiseries';

INSERT INTO plats (name, slug, description, price, available, category_id)
SELECT
  'Paris-Brest',
  'paris-brest',
  'Couronne de pâte à choux, crème pralinée aux noisettes.',
  6.50,
  true,
  id
FROM categories WHERE slug = 'viennoiseries';

-- =============================================
-- PLATS - CRÉATIONS DU CHEF
-- =============================================
INSERT INTO plats (name, slug, description, price, available, category_id)
SELECT
  'L''Intemporel',
  'lintemporel',
  'Notre signature : sphère chocolat, cœur praliné, mousse passion et biscuit croustillant.',
  14.00,
  true,
  id
FROM categories WHERE slug = 'creations-chef';

INSERT INTO plats (name, slug, description, price, available, category_id)
SELECT
  'Voyage Exotique',
  'voyage-exotique',
  'Tartare de fruits exotiques, crémeux coco, sorbet passion et tuile craquante.',
  12.00,
  true,
  id
FROM categories WHERE slug = 'creations-chef';

INSERT INTO plats (name, slug, description, price, available, category_id)
SELECT
  'Forêt Enchantée',
  'foret-enchantee',
  'Mousse marrons, compotée de poires, crumble noisettes et glace vanille.',
  13.00,
  true,
  id
FROM categories WHERE slug = 'creations-chef';

INSERT INTO plats (name, slug, description, price, available, category_id)
SELECT
  'Déclinaison Citron',
  'declinaison-citron',
  'Crémeux citron, meringue, sablé et sorbet au yuzu.',
  12.50,
  true,
  id
FROM categories WHERE slug = 'creations-chef';

-- =============================================
-- PLATS - BOISSONS CHAUDES
-- =============================================
INSERT INTO plats (name, slug, description, price, available, category_id)
SELECT
  'Espresso',
  'espresso',
  'Café arabica torréfié artisanalement.',
  2.50,
  true,
  id
FROM categories WHERE slug = 'boissons-chaudes';

INSERT INTO plats (name, slug, description, price, available, category_id)
SELECT
  'Cappuccino',
  'cappuccino',
  'Espresso, lait mousseux et cacao.',
  4.50,
  true,
  id
FROM categories WHERE slug = 'boissons-chaudes';

INSERT INTO plats (name, slug, description, price, available, category_id)
SELECT
  'Chocolat chaud',
  'chocolat-chaud',
  'Chocolat Valrhona fondu dans du lait chaud, chantilly maison.',
  5.50,
  true,
  id
FROM categories WHERE slug = 'boissons-chaudes';

INSERT INTO plats (name, slug, description, price, available, category_id)
SELECT
  'Thé parfumé',
  'the-parfume',
  'Sélection de thés en feuilles : Earl Grey, Jasmin, Fruits rouges.',
  4.00,
  true,
  id
FROM categories WHERE slug = 'boissons-chaudes';

INSERT INTO plats (name, slug, description, price, available, category_id)
SELECT
  'Infusion maison',
  'infusion-maison',
  'Verveine-menthe ou Camomille-miel du jardin.',
  4.00,
  true,
  id
FROM categories WHERE slug = 'boissons-chaudes';

-- =============================================
-- PLATS - BOISSONS FROIDES
-- =============================================
INSERT INTO plats (name, slug, description, price, available, category_id)
SELECT
  'Limonade maison',
  'limonade-maison',
  'Citron pressé, eau pétillante, menthe fraîche et sirop de sucre de canne.',
  4.50,
  true,
  id
FROM categories WHERE slug = 'boissons-froides';

INSERT INTO plats (name, slug, description, price, available, category_id)
SELECT
  'Smoothie fruits rouges',
  'smoothie-fruits-rouges',
  'Fraise, framboise, myrtille mixés avec du yaourt grec.',
  6.00,
  true,
  id
FROM categories WHERE slug = 'boissons-froides';

INSERT INTO plats (name, slug, description, price, available, category_id)
SELECT
  'Milkshake vanille',
  'milkshake-vanille',
  'Glace vanille, lait et chantilly.',
  6.50,
  true,
  id
FROM categories WHERE slug = 'boissons-froides';

INSERT INTO plats (name, slug, description, price, available, category_id)
SELECT
  'Thé glacé pêche',
  'the-glace-peche',
  'Thé noir infusé à froid, sirop de pêche et glaçons.',
  4.50,
  true,
  id
FROM categories WHERE slug = 'boissons-froides';

-- =============================================
-- ASSOCIATIONS PLAT-OPTIONS
-- =============================================

-- Fondant au chocolat -> Sauces + Garnitures + Suppléments
INSERT INTO plat_options (plat_id, option_id)
SELECT p.id, o.id FROM plats p, options o
JOIN option_types ot ON o.option_type_id = ot.id
WHERE p.slug = 'fondant-chocolat'
AND ot.slug IN ('sauce', 'garniture', 'supplement');

-- Cheesecake -> Sauces + Garnitures
INSERT INTO plat_options (plat_id, option_id)
SELECT p.id, o.id FROM plats p, options o
JOIN option_types ot ON o.option_type_id = ot.id
WHERE p.slug = 'cheesecake-new-yorkais'
AND ot.slug IN ('sauce', 'garniture');

-- Tiramisu -> Sauces + Suppléments
INSERT INTO plat_options (plat_id, option_id)
SELECT p.id, o.id FROM plats p, options o
JOIN option_types ot ON o.option_type_id = ot.id
WHERE p.slug = 'tiramisu-traditionnel'
AND ot.slug IN ('sauce', 'supplement');

-- Panna cotta -> Sauces + Garnitures
INSERT INTO plat_options (plat_id, option_id)
SELECT p.id, o.id FROM plats p, options o
JOIN option_types ot ON o.option_type_id = ot.id
WHERE p.slug = 'panna-cotta'
AND ot.slug IN ('sauce', 'garniture');

-- Crème brûlée -> Garnitures + Suppléments
INSERT INTO plat_options (plat_id, option_id)
SELECT p.id, o.id FROM plats p, options o
JOIN option_types ot ON o.option_type_id = ot.id
WHERE p.slug = 'creme-brulee-vanille'
AND ot.slug IN ('garniture', 'supplement');

-- Coupes de glace -> Parfums + Sauces + Garnitures
INSERT INTO plat_options (plat_id, option_id)
SELECT p.id, o.id FROM plats p, options o
JOIN option_types ot ON o.option_type_id = ot.id
WHERE p.slug IN ('coupe-2-boules', 'coupe-3-boules')
AND ot.slug IN ('parfum', 'sauce', 'garniture');

-- Dame Blanche -> Sauces + Garnitures
INSERT INTO plat_options (plat_id, option_id)
SELECT p.id, o.id FROM plats p, options o
JOIN option_types ot ON o.option_type_id = ot.id
WHERE p.slug = 'dame-blanche'
AND ot.slug IN ('sauce', 'garniture');

-- Banana Split -> Parfums + Sauces
INSERT INTO plat_options (plat_id, option_id)
SELECT p.id, o.id FROM plats p, options o
JOIN option_types ot ON o.option_type_id = ot.id
WHERE p.slug = 'banana-split'
AND ot.slug IN ('parfum', 'sauce');

-- Tartes -> Garnitures + Suppléments
INSERT INTO plat_options (plat_id, option_id)
SELECT p.id, o.id FROM plats p, options o
JOIN option_types ot ON o.option_type_id = ot.id
WHERE p.slug IN ('tarte-citron-meringuee', 'tarte-tatin', 'tarte-fruits-rouges', 'tarte-chocolat-caramel', 'tarte-fine-pommes')
AND ot.slug IN ('garniture', 'supplement');

-- Créations du chef -> Toutes les options sauf température/lait
INSERT INTO plat_options (plat_id, option_id)
SELECT p.id, o.id FROM plats p, options o
JOIN option_types ot ON o.option_type_id = ot.id
WHERE p.slug IN ('lintemporel', 'voyage-exotique', 'foret-enchantee', 'declinaison-citron')
AND ot.slug IN ('sauce', 'garniture', 'supplement');

-- Brioche perdue -> Sauces + Garnitures + Suppléments
INSERT INTO plat_options (plat_id, option_id)
SELECT p.id, o.id FROM plats p, options o
JOIN option_types ot ON o.option_type_id = ot.id
WHERE p.slug = 'brioche-perdue'
AND ot.slug IN ('sauce', 'garniture', 'supplement');

-- Boissons chaudes -> Température + Lait + Taille
INSERT INTO plat_options (plat_id, option_id)
SELECT p.id, o.id FROM plats p, options o
JOIN option_types ot ON o.option_type_id = ot.id
WHERE p.slug IN ('cappuccino', 'chocolat-chaud')
AND ot.slug IN ('taille', 'lait');

-- Milkshake -> Parfums + Taille
INSERT INTO plat_options (plat_id, option_id)
SELECT p.id, o.id FROM plats p, options o
JOIN option_types ot ON o.option_type_id = ot.id
WHERE p.slug = 'milkshake-vanille'
AND ot.slug IN ('parfum', 'taille');

-- =============================================
-- VÉRIFICATION
-- =============================================
-- SELECT c.name as categorie, COUNT(p.id) as nb_plats
-- FROM categories c
-- LEFT JOIN plats p ON p.category_id = c.id
-- GROUP BY c.name ORDER BY c."order";

-- SELECT ot.name as type_option, COUNT(o.id) as nb_options
-- FROM option_types ot
-- LEFT JOIN options o ON o.option_type_id = ot.id
-- GROUP BY ot.name;
