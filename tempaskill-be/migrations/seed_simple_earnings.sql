-- Quick seed untuk testing withdrawal
-- Copy-paste ke MySQL Workbench atau phpMyAdmin

-- Instructor 2 earnings (total available: Rp 2,165,700)
INSERT INTO instructor_earnings (instructor_id, course_id, enrollment_id, total_amount, instructor_share, platform_share, status, earned_at, available_at, created_at, updated_at) VALUES
(2, 1, 1, 499000, 349300, 149700, 'available', DATE_SUB(NOW(), INTERVAL 30 DAY), DATE_SUB(NOW(), INTERVAL 23 DAY), DATE_SUB(NOW(), INTERVAL 30 DAY), NOW()),
(2, 1, 2, 499000, 349300, 149700, 'available', DATE_SUB(NOW(), INTERVAL 28 DAY), DATE_SUB(NOW(), INTERVAL 21 DAY), DATE_SUB(NOW(), INTERVAL 28 DAY), NOW()),
(2, 3, 3, 349000, 244300, 104700, 'available', DATE_SUB(NOW(), INTERVAL 20 DAY), DATE_SUB(NOW(), INTERVAL 13 DAY), DATE_SUB(NOW(), INTERVAL 20 DAY), NOW()),
(2, 3, 4, 349000, 244300, 104700, 'available', DATE_SUB(NOW(), INTERVAL 18 DAY), DATE_SUB(NOW(), INTERVAL 11 DAY), DATE_SUB(NOW(), INTERVAL 18 DAY), NOW()),
(2, 5, 5, 899000, 629300, 269700, 'available', DATE_SUB(NOW(), INTERVAL 10 DAY), DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 10 DAY), NOW()),
(2, 1, 6, 499000, 349300, 149700, 'held', DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_ADD(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY), NOW());

-- Instructor 3 earnings (total available: Rp 2,027,200)
INSERT INTO instructor_earnings (instructor_id, course_id, enrollment_id, total_amount, instructor_share, platform_share, status, earned_at, available_at, created_at, updated_at) VALUES
(3, 2, 7, 799000, 559300, 239700, 'available', DATE_SUB(NOW(), INTERVAL 25 DAY), DATE_SUB(NOW(), INTERVAL 18 DAY), DATE_SUB(NOW(), INTERVAL 25 DAY), NOW()),
(3, 2, 8, 799000, 559300, 239700, 'available', DATE_SUB(NOW(), INTERVAL 22 DAY), DATE_SUB(NOW(), INTERVAL 15 DAY), DATE_SUB(NOW(), INTERVAL 22 DAY), NOW()),
(3, 4, 9, 649000, 454300, 194700, 'available', DATE_SUB(NOW(), INTERVAL 15 DAY), DATE_SUB(NOW(), INTERVAL 8 DAY), DATE_SUB(NOW(), INTERVAL 15 DAY), NOW()),
(3, 4, 10, 649000, 454300, 194700, 'available', DATE_SUB(NOW(), INTERVAL 14 DAY), DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_SUB(NOW(), INTERVAL 14 DAY), NOW());

SELECT 'Earnings seeded!' AS Status;
