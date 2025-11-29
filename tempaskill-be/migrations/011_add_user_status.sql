-- Migration: Add status column to users table
-- Date: 2025-11-29
-- Description: Add user status (active/suspended) for account management

-- Add status column to users table
ALTER TABLE users
ADD COLUMN status ENUM('active', 'suspended') NOT NULL DEFAULT 'active' AFTER role,
ADD INDEX idx_status (status);

-- Update existing users to active status
UPDATE users SET status = 'active' WHERE status IS NULL;
