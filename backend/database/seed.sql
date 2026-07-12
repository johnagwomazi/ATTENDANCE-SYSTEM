USE new_horizons_attendance_v2;

INSERT INTO courses (id, name, description) VALUES
  ('11111111-1111-4111-8111-111111111111', 'Frontend Development', 'Modern web interface development'),
  ('22222222-2222-4222-8222-222222222222', 'Backend Development', 'Server-side development and APIs'),
  ('33333333-3333-4333-8333-333333333333', 'Graphics Design', 'Creative design and branding'),
  ('44444444-4444-4444-8444-444444444444', 'Python Programming', 'Python fundamentals and applied development'),
  ('55555555-5555-4555-8555-555555555555', 'Cybersecurity', 'Security principles and defensive practices')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description);

INSERT INTO schedules (id, course_id, day_of_week, start_time, end_time) VALUES
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '11111111-1111-4111-8111-111111111111', 'Monday', '09:00:00', '12:00:00'),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', '22222222-2222-4222-8222-222222222222', 'Tuesday', '10:00:00', '13:00:00'),
  ('cccccccc-cccc-4ccc-8ccc-cccccccccccc', '33333333-3333-4333-8333-333333333333', 'Wednesday', '09:00:00', '12:00:00'),
  ('dddddddd-dddd-4ddd-8ddd-dddddddddddd', '44444444-4444-4444-8444-444444444444', 'Thursday', '10:00:00', '13:00:00'),
  ('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee', '55555555-5555-4555-8555-555555555555', 'Friday', '09:00:00', '12:00:00')
ON DUPLICATE KEY UPDATE
  day_of_week = VALUES(day_of_week),
  start_time = VALUES(start_time),
  end_time = VALUES(end_time);
