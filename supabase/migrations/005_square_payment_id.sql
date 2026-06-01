-- Ajoute la colonne square_payment_id à orders pour tracer les paiements Square
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS square_payment_id TEXT;
