-- Bucket public pour les images du site
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'floruspocus',
  'floruspocus',
  true,
  5242880,  -- 5 MB
  ARRAY['image/jpeg','image/png','image/webp','image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Lecture publique (images affichées sur le site)
CREATE POLICY "Images publiques lisibles"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'floruspocus');

-- Upload réservé aux admins (via service role — bypass automatique)
-- La route /api/upload utilise la service_role_key, pas besoin de policy supplémentaire.
-- Cette policy permet aussi l'upload direct depuis le client si besoin futur.
CREATE POLICY "Upload admin uniquement"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'floruspocus'
    AND (
      SELECT is_admin FROM public.users WHERE id = auth.uid()
    ) = true
  );

-- Suppression réservée aux admins
CREATE POLICY "Suppression admin uniquement"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'floruspocus'
    AND (
      SELECT is_admin FROM public.users WHERE id = auth.uid()
    ) = true
  );
