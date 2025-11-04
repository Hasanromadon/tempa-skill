-- Seed Admin User for Testing
-- Password: admin123 (bcrypt hashed)

-- Check if admin exists first
DELETE FROM users WHERE email = 'admin@tempaskill.com';

-- Insert admin user
-- Password hash for "admin123" using bcrypt cost 10
INSERT INTO users (name, email, password, role, created_at, updated_at)
VALUES (
    'Admin TempaSKill',
    'admin@tempaskill.com',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', -- admin123
    'admin',
    NOW(),
    NOW()
);

-- Verify
SELECT id, name, email, role FROM users WHERE email = 'admin@tempaskill.com';
