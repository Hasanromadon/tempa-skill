-- Migration: 013_create_instructor_earnings_table.sql
-- Description: Create instructor_earnings table to track instructor revenue with holding period
-- Date: 2025-12-01

CREATE TABLE instructor_earnings (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    instructor_id BIGINT UNSIGNED NOT NULL,
    payment_transaction_id BIGINT UNSIGNED NOT NULL,
    course_id BIGINT UNSIGNED NOT NULL,
    
    -- Revenue breakdown
    gross_amount DECIMAL(15,2) NOT NULL COMMENT 'Total payment from student',
    platform_fee DECIMAL(15,2) NOT NULL COMMENT '20% platform fee (15% operational + 5% reserve)',
    instructor_share DECIMAL(15,2) NOT NULL COMMENT '80% instructor share',
    
    -- Holding period management
    transaction_date TIMESTAMP NOT NULL COMMENT 'Original payment date',
    available_date TIMESTAMP NOT NULL COMMENT 'Date when earnings become available for withdrawal (transaction_date + holding_period)',
    
    -- Status tracking
    status ENUM('held', 'available', 'withdrawn', 'refunded') DEFAULT 'held' COMMENT 'held: within holding period, available: can be withdrawn, withdrawn: already withdrawn, refunded: returned to student',
    
    -- Withdrawal tracking
    withdrawn_at TIMESTAMP NULL,
    withdrawal_id BIGINT UNSIGNED NULL COMMENT 'Reference to withdrawal request if withdrawn',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign keys
    FOREIGN KEY (instructor_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (payment_transaction_id) REFERENCES payment_transactions(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    
    -- Indexes for performance
    INDEX idx_instructor_status (instructor_id, status),
    INDEX idx_available_date (available_date),
    INDEX idx_transaction_date (transaction_date),
    INDEX idx_payment_transaction (payment_transaction_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add comment to table
ALTER TABLE instructor_earnings COMMENT = 'Track instructor earnings from course sales with holding period for risk management';
