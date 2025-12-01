-- Migration: 009_create_payment_transactions_table.sql
-- Description: Create payment_transactions table for Midtrans payment integration
-- Date: 2025-01-27

CREATE TABLE payment_transactions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    course_id BIGINT UNSIGNED NOT NULL,
    order_id VARCHAR(100) NOT NULL UNIQUE,
    gross_amount DECIMAL(15,2) NOT NULL,
    payment_type VARCHAR(50) DEFAULT 'bank_transfer',
    transaction_status VARCHAR(50) NOT NULL DEFAULT 'pending',
    transaction_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    settlement_time TIMESTAMP NULL,
    payment_url TEXT NULL,
    midtrans_response TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Foreign key constraints
    CONSTRAINT fk_payment_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_payment_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,

    -- Indexes for performance
    INDEX idx_user_id (user_id),
    INDEX idx_course_id (course_id),
    INDEX idx_order_id (order_id),
    INDEX idx_transaction_status (transaction_status),
    INDEX idx_transaction_time (transaction_time)
);

-- Add comment to table
ALTER TABLE payment_transactions COMMENT = 'Payment transactions processed through Midtrans payment gateway';