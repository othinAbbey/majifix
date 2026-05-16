-- Add user location fields for technician and district officer support
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS district VARCHAR(50);

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS village VARCHAR(50);

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8);

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);
