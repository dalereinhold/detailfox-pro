ALTER TABLE vehicles
  ADD COLUMN service_type text DEFAULT 'Full Detail'
  CHECK (service_type = ANY (ARRAY['Full Detail', 'Ceramic Coating', 'Quick Detail', 'Delivery Prep']));
