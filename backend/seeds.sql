-- MajiFix Test Data Seeder

-- Insert test users
INSERT INTO users (username, password_hash, email, role, district, village) VALUES
('admin', '$2a$10$PY8KWlGDj9OJiLhJzM3Nee0dLhLvJN5UQRoS3nZKBKT0F/0TbQXZm', 'admin@majifix.com', 'admin', NULL, NULL),
('district_officer', '$2a$10$PY8KWlGDj9OJiLhJzM3Nee0dLhLvJN5UQRoS3nZKBKT0F/0TbQXZm', 'officer@majifix.com', 'district_officer', NULL, NULL),
('tech1', '$2a$10$PY8KWlGDj9OJiLhJzM3Nee0dLhLvJN5UQRoS3nZKBKT0F/0TbQXZm', 'tech1@majifix.com', 'technician', 'Kilimanjaro', 'Moshi'),
('tech2', '$2a$10$PY8KWlGDj9OJiLhJzM3Nee0dLhLvJN5UQRoS3nZKBKT0F/0TbQXZm', 'tech2@majifix.com', 'technician', 'Dar es Salaam', 'Bagamoyo'),
('ngo_staff', '$2a$10$PY8KWlGDj9OJiLhJzM3Nee0dLhLvJN5UQRoS3nZKBKT0F/0TbQXZm', 'ngo@majifix.com', 'ngo_staff', NULL, NULL);

-- Insert test water points
INSERT INTO water_points (name, district, village, latitude, longitude, install_date, water_source_type, status, managing_org) VALUES
('Korogwe Borehole', 'Tanga', 'Korogwe', -4.6667, 37.6667, '2020-01-15', 'borehole', 'working', 'UNICEF'),
('Moshi Water Point', 'Kilimanjaro', 'Moshi', -3.3667, 37.6667, '2019-06-20', 'tap_stand', 'working', 'Local Government'),
('Bagamoyo Spring', 'Dar es Salaam', 'Bagamoyo', -6.4500, 38.8833, '2021-03-10', 'spring', 'broken', 'Red Cross'),
('Iringa Well', 'Iringa', 'Iringa', -8.7797, 35.7878, '2018-11-05', 'shallow_well', 'working', 'Water Trust'),
('Mbeya Kiosk', 'Mbeya', 'Mbeya', -8.9000, 33.8667, '2022-02-14', 'water_kiosk', 'maintenance', 'NGO Partners');

-- Insert test fault reports
INSERT INTO fault_reports (water_point_id, issue_type, description, reported_by, timestamp) VALUES
(1, 'low_pressure', 'Water pressure has been very low for 3 days', 2, NOW() - INTERVAL '2 days'),
(3, 'no_water', 'No water coming out, pump not working', 2, NOW() - INTERVAL '1 day'),
(4, 'leakage', 'Significant leak at the base of the tap stand', 5, NOW() - INTERVAL '12 hours'),
(2, 'contamination', 'Water appears discolored and has unusual smell', 4, NOW() - INTERVAL '6 hours');

-- Insert test assignments
INSERT INTO assignments (fault_report_id, technician_id, status, priority) VALUES
(1, 3, 'in_progress', 'high'),
(2, 3, 'pending', 'high'),
(3, 4, 'assigned', 'medium'),
(4, 4, 'pending', 'medium');

-- Insert test repairs
INSERT INTO repairs (assignment_id, notes, cost, technician_id) VALUES
(1, 'Replaced pressure valve and cleaned filter', 50.00, 3);

-- Insert test notifications
INSERT INTO notifications (user_id, message, type, is_read) VALUES
(3, 'New assignment: Low pressure at Korogwe Borehole', 'assignment', FALSE),
(3, 'New assignment: No water at Bagamoyo Spring', 'assignment', FALSE),
(4, 'New assignment: Leakage at Iringa Well', 'assignment', FALSE),
(2, 'Repair completed at Korogwe Borehole', 'repair', FALSE);