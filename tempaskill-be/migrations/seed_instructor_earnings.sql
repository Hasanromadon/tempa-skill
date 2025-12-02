-- ====================================
-- TempaSKill - Seed Instructor Earnings
-- ====================================
-- Purpose: Add earnings data for instructors to test withdrawal feature
-- Usage: Run this after seed.sql to populate instructor_earnings table
-- ====================================

-- First, we need enrollments to generate earnings
-- Add some enrollments for courses (assuming student user with id=1)

INSERT INTO enrollments (user_id, course_id, enrolled_at, created_at, updated_at) VALUES
-- Student 1 enrolls in Course 1 (React, instructor 2, price 499000)
(1, 1, DATE_SUB(NOW(), INTERVAL 30 DAY), DATE_SUB(NOW(), INTERVAL 30 DAY), DATE_SUB(NOW(), INTERVAL 30 DAY)),

-- Student 1 enrolls in Course 2 (Go, instructor 3, price 799000)
(1, 2, DATE_SUB(NOW(), INTERVAL 25 DAY), DATE_SUB(NOW(), INTERVAL 25 DAY), DATE_SUB(NOW(), INTERVAL 25 DAY)),

-- Student 1 enrolls in Course 3 (UI/UX, instructor 2, price 349000)
(1, 3, DATE_SUB(NOW(), INTERVAL 20 DAY), DATE_SUB(NOW(), INTERVAL 20 DAY), DATE_SUB(NOW(), INTERVAL 20 DAY)),

-- Student 1 enrolls in Course 4 (Database, instructor 3, price 649000)
(1, 4, DATE_SUB(NOW(), INTERVAL 15 DAY), DATE_SUB(NOW(), INTERVAL 15 DAY), DATE_SUB(NOW(), INTERVAL 15 DAY)),

-- Additional students (assuming user ids 4-10 exist)
(4, 1, DATE_SUB(NOW(), INTERVAL 28 DAY), DATE_SUB(NOW(), INTERVAL 28 DAY), DATE_SUB(NOW(), INTERVAL 28 DAY)),
(5, 1, DATE_SUB(NOW(), INTERVAL 26 DAY), DATE_SUB(NOW(), INTERVAL 26 DAY), DATE_SUB(NOW(), INTERVAL 26 DAY)),
(6, 2, DATE_SUB(NOW(), INTERVAL 22 DAY), DATE_SUB(NOW(), INTERVAL 22 DAY), DATE_SUB(NOW(), INTERVAL 22 DAY)),
(7, 3, DATE_SUB(NOW(), INTERVAL 18 DAY), DATE_SUB(NOW(), INTERVAL 18 DAY), DATE_SUB(NOW(), INTERVAL 18 DAY)),
(8, 4, DATE_SUB(NOW(), INTERVAL 14 DAY), DATE_SUB(NOW(), INTERVAL 14 DAY), DATE_SUB(NOW(), INTERVAL 14 DAY)),
(9, 5, DATE_SUB(NOW(), INTERVAL 10 DAY), DATE_SUB(NOW(), INTERVAL 10 DAY), DATE_SUB(NOW(), INTERVAL 10 DAY)),
(10, 1, DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY))
ON DUPLICATE KEY UPDATE enrolled_at = VALUES(enrolled_at);

-- ====================================
-- INSTRUCTOR EARNINGS
-- ====================================
-- Formula: instructor_share = course_price * 0.70 (70% to instructor, 30% to platform)
-- Status: 
-- - 'available' = available for withdrawal (>7 days old)
-- - 'held' = held for 7 days
-- - 'withdrawn' = already withdrawn

-- Instructor 2 (Jane Instructor) earnings
-- Course 1: React (499000 * 0.70 = 349,300)
INSERT INTO instructor_earnings (instructor_id, course_id, enrollment_id, total_amount, instructor_share, platform_share, status, earned_at, available_at, created_at, updated_at) VALUES
(2, 1, 1, 499000, 349300, 149700, 'available', DATE_SUB(NOW(), INTERVAL 30 DAY), DATE_SUB(NOW(), INTERVAL 23 DAY), DATE_SUB(NOW(), INTERVAL 30 DAY), DATE_SUB(NOW(), INTERVAL 30 DAY)),
(2, 1, 5, 499000, 349300, 149700, 'available', DATE_SUB(NOW(), INTERVAL 28 DAY), DATE_SUB(NOW(), INTERVAL 21 DAY), DATE_SUB(NOW(), INTERVAL 28 DAY), DATE_SUB(NOW(), INTERVAL 28 DAY)),
(2, 1, 6, 499000, 349300, 149700, 'available', DATE_SUB(NOW(), INTERVAL 26 DAY), DATE_SUB(NOW(), INTERVAL 19 DAY), DATE_SUB(NOW(), INTERVAL 26 DAY), DATE_SUB(NOW(), INTERVAL 26 DAY)),
(2, 1, 11, 499000, 349300, 149700, 'held', DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_ADD(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY)),

-- Course 3: UI/UX (349000 * 0.70 = 244,300)
(2, 3, 3, 349000, 244300, 104700, 'available', DATE_SUB(NOW(), INTERVAL 20 DAY), DATE_SUB(NOW(), INTERVAL 13 DAY), DATE_SUB(NOW(), INTERVAL 20 DAY), DATE_SUB(NOW(), INTERVAL 20 DAY)),
(2, 3, 8, 349000, 244300, 104700, 'available', DATE_SUB(NOW(), INTERVAL 18 DAY), DATE_SUB(NOW(), INTERVAL 11 DAY), DATE_SUB(NOW(), INTERVAL 18 DAY), DATE_SUB(NOW(), INTERVAL 18 DAY)),

-- Course 5: DevOps (899000 * 0.70 = 629,300)
(2, 5, 10, 899000, 629300, 269700, 'available', DATE_SUB(NOW(), INTERVAL 10 DAY), DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 10 DAY), DATE_SUB(NOW(), INTERVAL 10 DAY));

-- Instructor 3 (John Instructor) earnings
-- Course 2: Go (799000 * 0.70 = 559,300)
INSERT INTO instructor_earnings (instructor_id, course_id, enrollment_id, total_amount, instructor_share, platform_share, status, earned_at, available_at, created_at, updated_at) VALUES
(3, 2, 2, 799000, 559300, 239700, 'available', DATE_SUB(NOW(), INTERVAL 25 DAY), DATE_SUB(NOW(), INTERVAL 18 DAY), DATE_SUB(NOW(), INTERVAL 25 DAY), DATE_SUB(NOW(), INTERVAL 25 DAY)),
(3, 2, 7, 799000, 559300, 239700, 'available', DATE_SUB(NOW(), INTERVAL 22 DAY), DATE_SUB(NOW(), INTERVAL 15 DAY), DATE_SUB(NOW(), INTERVAL 22 DAY), DATE_SUB(NOW(), INTERVAL 22 DAY)),

-- Course 4: Database (649000 * 0.70 = 454,300)
(3, 4, 4, 649000, 454300, 194700, 'available', DATE_SUB(NOW(), INTERVAL 15 DAY), DATE_SUB(NOW(), INTERVAL 8 DAY), DATE_SUB(NOW(), INTERVAL 15 DAY), DATE_SUB(NOW(), INTERVAL 15 DAY)),
(3, 4, 9, 649000, 454300, 194700, 'available', DATE_SUB(NOW(), INTERVAL 14 DAY), DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_SUB(NOW(), INTERVAL 14 DAY), DATE_SUB(NOW(), INTERVAL 14 DAY));

-- ====================================
-- SUMMARY
-- ====================================
SELECT '✓ Instructor earnings seeded successfully!' AS Status;
SELECT '📊 Earnings Summary:' AS Info;

SELECT 
    instructor_id,
    COUNT(*) as 'Total Earnings Records',
    SUM(instructor_share) as 'Total Instructor Share',
    SUM(CASE WHEN status = 'available' THEN instructor_share ELSE 0 END) as 'Available Balance',
    SUM(CASE WHEN status = 'held' THEN instructor_share ELSE 0 END) as 'Held Balance',
    SUM(CASE WHEN status = 'withdrawn' THEN instructor_share ELSE 0 END) as 'Withdrawn Amount'
FROM instructor_earnings
GROUP BY instructor_id
ORDER BY instructor_id;

-- Show actual earnings for testing
SELECT 
    'Instructor 2 (Jane)' as Instructor,
    CONCAT('Rp ', FORMAT(SUM(CASE WHEN status = 'available' THEN instructor_share ELSE 0 END), 0)) as 'Available Balance',
    CONCAT('Rp ', FORMAT(SUM(CASE WHEN status = 'held' THEN instructor_share ELSE 0 END), 0)) as 'Held Balance'
FROM instructor_earnings
WHERE instructor_id = 2

UNION ALL

SELECT 
    'Instructor 3 (John)' as Instructor,
    CONCAT('Rp ', FORMAT(SUM(CASE WHEN status = 'available' THEN instructor_share ELSE 0 END), 0)) as 'Available Balance',
    CONCAT('Rp ', FORMAT(SUM(CASE WHEN status = 'held' THEN instructor_share ELSE 0 END), 0)) as 'Held Balance'
FROM instructor_earnings
WHERE instructor_id = 3;
