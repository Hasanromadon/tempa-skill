-- Migration: 014_create_withdrawal_requests_table.sql
-- Description: Create withdrawal_requests table for instructor withdrawal management
-- Date: 2025-12-01

CREATE TABLE withdrawal_requests (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL COMMENT 'Instructor who requested withdrawal',
    
    -- Amount breakdown
    amount DECIMAL(15,2) NOT NULL COMMENT 'Total withdrawal amount requested',
    admin_fee DECIMAL(15,2) NOT NULL DEFAULT 0 COMMENT '2.5% admin fee for processing',
    net_amount DECIMAL(15,2) NOT NULL COMMENT 'Amount transferred to bank (amount - admin_fee)',
    
    -- Status management
    status ENUM('pending', 'processing', 'completed', 'failed', 'cancelled') DEFAULT 'pending' COMMENT 'pending: waiting admin, processing: admin processing, completed: transferred, failed: transfer failed, cancelled: cancelled by instructor',
    
    -- Bank account reference
    bank_account_id BIGINT UNSIGNED NOT NULL,
    
    -- Admin processing
    notes TEXT NULL COMMENT 'Notes from admin or instructor',
    processed_at TIMESTAMP NULL COMMENT 'When admin processed the withdrawal',
    processed_by BIGINT UNSIGNED NULL COMMENT 'Admin who processed',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign keys
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (processed_by) REFERENCES users(id) ON DELETE SET NULL,
    
    -- Indexes
    INDEX idx_user_status (user_id, status),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at),
    INDEX idx_processed_at (processed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add comment to table
ALTER TABLE withdrawal_requests COMMENT = 'Instructor withdrawal requests with admin approval workflow';
