-- ⚠️ IMPORTANT : sur Supabase hébergé, ce fichier ne crée PAS le bucket de façon fiable.
-- Les `CREATE POLICY ON storage.objects` plus bas requièrent une permission que
-- l'éditeur SQL n'a pas toujours → la transaction échoue et l'INSERT du bucket
-- est annulé (c'est ce qui s'est produit : bucket jamais créé → upload "Bucket not found").
--
-- ✅ Méthode fiable de création du bucket (faite via l'API service_role) :
--    sb.storage.createBucket("floruspocus", {
--      public: true,
--      fileSizeLimit: 10485760,                 -- 10 Mo
--      allowedMimeTypes: ["image/jpeg","image/png","image/webp","image/gif","image/avif"],
--    })
-- Ou via le Dashboard Supabase → Storage → New bucket (Public coché).

-- Bucket public pour les images du site (conservé pour référence — voir note ci-dessus)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'floruspocus',
  'floruspocus',
  true,
  10485760,  -- 10 MB
  ARRAY['image/jpeg','image/png','image/webp','image/gif','image/avif']
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
