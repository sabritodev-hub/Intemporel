-- =============================================
-- CONFIGURATION DU STORAGE BUCKET
-- À exécuter dans Supabase SQL Editor
-- =============================================

-- 1. Créer le bucket s'il n'existe pas (via Dashboard ou API)
-- Allez dans Storage > New Bucket > "desserts-images" > Public

-- 2. Policies pour le bucket "desserts-images"

-- Permettre à tout le monde de voir les images (public)
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'desserts-images');

-- Permettre aux utilisateurs authentifiés d'uploader
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'desserts-images');

-- Permettre aux utilisateurs authentifiés de modifier
CREATE POLICY "Authenticated users can update"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'desserts-images')
WITH CHECK (bucket_id = 'desserts-images');

-- Permettre aux utilisateurs authentifiés de supprimer
CREATE POLICY "Authenticated users can delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'desserts-images');
