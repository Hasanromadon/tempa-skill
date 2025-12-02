-- Seed earnings untuk user ID 40 (Hasan Ro - hsanromadon@gmail.com)
-- Total Available: Rp 2,165,700
-- Total Held: Rp 349,300

-- Disable foreign key checks temporarily
SET FOREIGN_KEY_CHECKS = 0;

-- Clear existing earnings for user 40 (jika ada)
DELETE FROM instructor_earnings WHERE instructor_id = 40;

-- Insert earnings (available balance)
-- Note: payment_transaction_id is dummy (1000+) since we don't have actual payment transactions
INSERT INTO instructor_earnings (instructor_id, payment_transaction_id, course_id, gross_amount, platform_fee, instructor_share, transaction_date, available_date, status, created_at, updated_at) VALUES
-- Course sales dari 30 hari lalu (sudah available)
(40, 1001, 1, 499000, 99800, 349300, DATE_SUB(NOW(), INTERVAL 30 DAY), DATE_SUB(NOW(), INTERVAL 23 DAY), 'available', DATE_SUB(NOW(), INTERVAL 30 DAY), NOW()),
(40, 1002, 1, 499000, 99800, 349300, DATE_SUB(NOW(), INTERVAL 28 DAY), DATE_SUB(NOW(), INTERVAL 21 DAY), 'available', DATE_SUB(NOW(), INTERVAL 28 DAY), NOW()),
(40, 1003, 1, 499000, 99800, 349300, DATE_SUB(NOW(), INTERVAL 26 DAY), DATE_SUB(NOW(), INTERVAL 19 DAY), 'available', DATE_SUB(NOW(), INTERVAL 26 DAY), NOW()),
(40, 1004, 3, 349000, 69800, 244300, DATE_SUB(NOW(), INTERVAL 20 DAY), DATE_SUB(NOW(), INTERVAL 13 DAY), 'available', DATE_SUB(NOW(), INTERVAL 20 DAY), NOW()),
(40, 1005, 3, 349000, 69800, 244300, DATE_SUB(NOW(), INTERVAL 18 DAY), DATE_SUB(NOW(), INTERVAL 11 DAY), 'available', DATE_SUB(NOW(), INTERVAL 18 DAY), NOW()),
(40, 1006, 5, 899000, 179800, 629300, DATE_SUB(NOW(), INTERVAL 10 DAY), DATE_SUB(NOW(), INTERVAL 3 DAY), 'available', DATE_SUB(NOW(), INTERVAL 10 DAY), NOW()),

-- Course sales baru (held - belum bisa ditarik, perlu tunggu 7 hari)
(40, 1007, 1, 499000, 99800, 349300, DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_ADD(NOW(), INTERVAL 2 DAY), 'held', DATE_SUB(NOW(), INTERVAL 5 DAY), NOW());

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Verifikasi hasil
SELECT 
    '✓ Earnings created for user 40' AS Status,
    CONCAT('Rp ', FORMAT(SUM(CASE WHEN status = 'available' THEN instructor_share ELSE 0 END), 0)) AS 'Available Balance',
    CONCAT('Rp ', FORMAT(SUM(CASE WHEN status = 'held' THEN instructor_share ELSE 0 END), 0)) AS 'Held Balance',
    CONCAT('Rp ', FORMAT(SUM(instructor_share), 0)) AS 'Total Earnings'
FROM instructor_earnings 
WHERE instructor_id = 40;
