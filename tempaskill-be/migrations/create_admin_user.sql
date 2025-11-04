-- ====================================
-- Create Admin User
-- ====================================
-- Purpose: Create default admin account for testing
-- Password: "admin123" (bcrypt hashed)
-- ====================================

-- Insert admin user
-- Email: admin@tempaskill.com
-- Password: admin123
-- Role: admin
INSERT INTO users (name, email, password, role, bio, created_at, updated_at) 
VALUES (
    'Admin TempaSKill',
    'admin@tempaskill.com',
    '$2a$10$zz.CsnoWT0JsrOBpEgl0Hux9/qG5uqW/Adltcmv4bMAKQ.koq0dfq', -- bcrypt hash for "admin123"
    'admin',
    'Administrator TempaSKill Platform',
    NOW(),
    NOW()
)
ON DUPLICATE KEY UPDATE 
    name = VALUES(name),
    role = VALUES(role),
    bio = VALUES(bio);

SELECT '✓ Admin user created successfully!' AS Status;
SELECT 'Email: admin@tempaskill.com' AS Credentials;
SELECT 'Password: admin123' AS Password;
