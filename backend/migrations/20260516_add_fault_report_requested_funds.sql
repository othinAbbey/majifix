-- Add requested funds fields to fault_reports
ALTER TABLE fault_reports
  ADD COLUMN IF NOT EXISTS requested_funds BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS requested_funds_amount DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS requested_funds_reason TEXT;