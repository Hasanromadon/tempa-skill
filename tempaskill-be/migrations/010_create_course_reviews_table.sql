-- Migration: 010_create_course_reviews_table.sql
-- Description: Create course_reviews table for user feedback and ratings system
-- Date: 2025-01-27

CREATE TABLE course_reviews (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    course_id BIGINT UNSIGNED NOT NULL,
    rating BIGINT UNSIGNED NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Foreign key constraints
    CONSTRAINT fk_reviews_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_reviews_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,

    -- Ensure one review per user per course
    UNIQUE KEY unique_user_course_review (user_id, course_id),

    -- Indexes for performance
    INDEX idx_reviews_course_id (course_id),
    INDEX idx_reviews_user_id (user_id),
    INDEX idx_reviews_rating (rating),
    INDEX idx_reviews_created_at (created_at)
);

-- Add comment to table
ALTER TABLE course_reviews COMMENT = 'User reviews and ratings for courses';