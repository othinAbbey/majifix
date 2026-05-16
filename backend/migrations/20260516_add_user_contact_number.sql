-- Add user contact number field for technician contact information
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS contact_number VARCHAR(30);
