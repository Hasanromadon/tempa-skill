-- Migration: 015_create_instructor_bank_accounts_table.sql
-- Description: Create instructor_bank_accounts table for bank account management and verification
-- Date: 2025-12-01

CREATE TABLE instructor_bank_accounts (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL COMMENT 'Instructor who owns this bank account',
    
    -- Bank account details
    bank_name VARCHAR(100) NOT NULL COMMENT 'Name of the bank (BCA, Mandiri, BNI, etc)',
    account_number VARCHAR(50) NOT NULL COMMENT 'Bank account number',
    account_holder_name VARCHAR(100) NOT NULL COMMENT 'Account holder name (must match instructor name)',
    
    -- Verification status
    is_verified BOOLEAN DEFAULT FALSE COMMENT 'Whether admin has verified this account',
    verified_at TIMESTAMP NULL COMMENT 'When the account was verified',
    verified_by BIGINT UNSIGNED NULL COMMENT 'Admin who verified the account',
    
    -- Notes
    verification_notes TEXT NULL COMMENT 'Admin notes during verification',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign keys
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL,
    
    -- Indexes
    INDEX idx_user_id (user_id),
    INDEX idx_is_verified (is_verified),
    UNIQUE INDEX idx_account_number (bank_name, account_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add foreign key for withdrawal_requests
ALTER TABLE withdrawal_requests 
ADD CONSTRAINT fk_bank_account 
FOREIGN KEY (bank_account_id) REFERENCES instructor_bank_accounts(id) ON DELETE RESTRICT;

-- Add comment to table
ALTER TABLE instructor_bank_accounts COMMENT = 'Bank account information for instructor withdrawals with verification';
