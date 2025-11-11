-- migrations/20251111_create_certificates_table.sql

CREATE TABLE certificates (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    course_id INT UNSIGNED NOT NULL,
    issued_at DATETIME NOT NULL,
    certificate_id VARCHAR(32) NOT NULL UNIQUE,
    INDEX idx_user_course (user_id, course_id),
    INDEX idx_certificate_id (certificate_id)
);