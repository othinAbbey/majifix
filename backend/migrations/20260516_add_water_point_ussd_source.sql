-- Add source marker for water points created through USSD
ALTER TABLE water_points
  ADD COLUMN IF NOT EXISTS created_via_ussd BOOLEAN DEFAULT FALSE;