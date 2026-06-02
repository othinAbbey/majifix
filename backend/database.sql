-- MajiFix Database Schema

-- Users table for authentication
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  email VARCHAR(100) UNIQUE,
  contact_number VARCHAR(30),
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'district_officer', 'technician', 'ngo_staff')),
  district VARCHAR(50),
  village VARCHAR(50),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Water points table
-- CREATE TABLE water_points (
--   id SERIAL PRIMARY KEY,
--   name VARCHAR(100) NOT NULL,
--   district VARCHAR(50) NOT NULL,
--   parish VARCHAR(50),
--   village VARCHAR(50) NOT NULL,
--   water_point_number VARCHAR(50),
--   latitude DECIMAL(10, 8),
--   longitude DECIMAL(11, 8),
--   install_date DATE,
--   water_source_type VARCHAR(50),
--   status VARCHAR(20) DEFAULT 'working' CHECK (status IN ('working', 'broken', 'maintenance')),
--   managing_org VARCHAR(100),
--   created_via_ussd BOOLEAN DEFAULT FALSE,
--   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );
CREATE TABLE water_points (
  id SERIAL PRIMARY KEY,

  -- Identity
  name VARCHAR(150) NOT NULL,
  water_point_code VARCHAR(50) UNIQUE, -- better than "water_point_number"

  -- Location hierarchy
  district VARCHAR(80) NOT NULL,
  parish VARCHAR(80),
  village VARCHAR(80) NOT NULL,

  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),

  -- Water system details
  water_source_type VARCHAR(50) NOT NULL, 
  install_date DATE,

  -- Operational status
  status VARCHAR(20) DEFAULT 'working'
    CHECK (status IN ('working', 'broken', 'maintenance')),

  is_active BOOLEAN DEFAULT TRUE,

  -- Ownership / management
  managing_org VARCHAR(150),

  -- Digital tracking
  created_via_ussd BOOLEAN DEFAULT FALSE,

  -- 🔥 ML / DATA SCIENCE FIELDS
  failure_risk_score DECIMAL(3,2) DEFAULT 0, 
  last_fault_date TIMESTAMP,
  last_repair_date TIMESTAMP,
  avg_repair_time_hours DECIMAL(6,2),
  fault_count_6_months INT DEFAULT 0,

  -- GIS / mapping enhancement
  accuracy_radius_meters INT DEFAULT 10,

  -- system tracking
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Fault reports table
CREATE TABLE fault_reports (
  id SERIAL PRIMARY KEY,
  water_point_id INTEGER REFERENCES water_points(id),
  issue_type VARCHAR(50) NOT NULL,
  description TEXT,
  image_url VARCHAR(255),
  requested_funds BOOLEAN DEFAULT FALSE,
  requested_funds_amount DECIMAL(10,2),
  requested_funds_reason TEXT,
  reported_by INTEGER REFERENCES users(id),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Assignments table
CREATE TABLE assignments (
  id SERIAL PRIMARY KEY,
  fault_report_id INTEGER REFERENCES fault_reports(id),
  technician_id INTEGER REFERENCES users(id),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'in_progress', 'completed', 'escalated')),
  assigned_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high'))
);

-- Repairs table
CREATE TABLE repairs (
  id SERIAL PRIMARY KEY,
  assignment_id INTEGER REFERENCES assignments(id),
  repair_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notes TEXT,
  cost DECIMAL(10, 2),
  transport_cost DECIMAL(10,2),
  materials_cost DECIMAL(10,2),
  problem_found VARCHAR(100),
  remedy VARCHAR(100),
  additional_notes TEXT,
  repair_status VARCHAR(20) DEFAULT 'reported',
  technician_id INTEGER REFERENCES users(id)
);

-- Notifications table
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  message TEXT,
  type VARCHAR(50),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);