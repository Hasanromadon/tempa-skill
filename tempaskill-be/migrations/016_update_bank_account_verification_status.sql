-- Migration: 016_update_bank_account_verification_status.sql
-- Description: Change is_verified boolean to verification_status ENUM for better status tracking
-- Date: 2025-12-01

-- Drop the old boolean column
ALTER TABLE instructor_bank_accounts DROP COLUMN is_verified;

-- Add new verification_status ENUM column
ALTER TABLE instructor_bank_accounts 
ADD COLUMN verification_status ENUM('pending', 'verified', 'rejected') 
NOT NULL DEFAULT 'pending' 
COMMENT 'Verification status: pending (waiting admin review), verified (approved and active), rejected (denied by admin)'
AFTER account_holder_name;

-- Add index for filtering by status
ALTER TABLE instructor_bank_accounts ADD INDEX idx_verification_status (verification_status);

-- Update comment
ALTER TABLE instructor_bank_accounts COMMENT = 'Bank account information for instructor withdrawals with 3-state verification (pending/verified/rejected)';
