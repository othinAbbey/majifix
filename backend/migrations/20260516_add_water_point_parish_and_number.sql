-- Add parish and water point number fields to water_points
ALTER TABLE water_points
  ADD COLUMN IF NOT EXISTS parish VARCHAR(50),
  ADD COLUMN IF NOT EXISTS water_point_number VARCHAR(50);