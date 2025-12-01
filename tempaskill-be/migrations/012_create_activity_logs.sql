-- Migration: Create activity logs table
-- Purpose: Track user activities (login, course access, lesson completion, etc.)

-- Add last_login_at to users table
ALTER TABLE users
ADD COLUMN last_login_at TIMESTAMP NULL AFTER status;

-- Create activity_logs table
CREATE TABLE activity_logs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NULL,
    entity_id BIGINT UNSIGNED NULL,
    description TEXT NULL,
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_user_id (user_id),
    INDEX idx_action (action),
    INDEX idx_entity (entity_type, entity_id),
    INDEX idx_created_at (created_at),
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sample activity types:
-- 'user.login' - User logged in
-- 'user.logout' - User logged out
-- 'course.view' - User viewed course detail
-- 'course.enroll' - User enrolled in course
-- 'lesson.view' - User accessed lesson
-- 'lesson.complete' - User completed lesson
-- 'certificate.generate' - User generated certificate
-- 'profile.update' - User updated profile
