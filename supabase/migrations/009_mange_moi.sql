-- Migration 009 : table mange_moi_items — catalogue vitrine sans achat

CREATE TABLE mange_moi_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  image_url   TEXT NULL,
  active      BOOLEAN NOT NULL DEFAULT true,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE mange_moi_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read active" ON mange_moi_items FOR SELECT USING (active = true);
