-- Add snap_token column for Midtrans Snap integration
ALTER TABLE payment_transactions
ADD COLUMN snap_token VARCHAR(200) DEFAULT NULL AFTER payment_type;

-- Add index for faster lookups
CREATE INDEX idx_payment_transactions_snap_token ON payment_transactions(snap_token);
