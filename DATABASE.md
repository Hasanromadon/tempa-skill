# Database Schema - TempaSKill

> MySQL database schema untuk tempaskill-be

---

## 📊 Entity Relationship Diagram

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│    users    │────┬────│ enrollments  │────┬────│   courses   │
└─────────────┘    │    └──────────────┘    │    └─────────────┘
       │           │                        │            │
       │           │    ┌──────────────┐    │            │
       │           └────│  progresses  │────┘            │
       │                └──────────────┘                 │
       │                                                 │
       │           ┌──────────────┐                      │
       ├───────────│ certificates │──────────────────────┘
       │           └──────────────┘
       │                                                 │
       │           ┌──────────────┐                      │
       ├───────────│   reviews    │──────────────────────┘
       │           └──────────────┘
       │                                                 │
       │           ┌────────────────────┐                │
       ├───────────│ payment_transactions│───────────────┘
       │           └────────────────────┘
       │                    │
       │                    │
       │           ┌────────────────────┐
       │           │ instructor_earnings│
       │           └────────────────────┘
       │                    │
       │                    │
       │           ┌────────────────────┐
       ├───────────│ withdrawal_requests│
       │           └────────────────────┘
       │                    │
       │                    │
       │           ┌──────────────────────────┐
       ├───────────│ instructor_bank_accounts │
       │           └──────────────────────────┘
       │
       │           ┌─────────────┐                       │
       ├───────────│  sessions   │───────────────────────┘
       │           └─────────────┘
       │                  │
       │                  │
       │           ┌─────────────┐
       ├───────────│participants │
       │           └─────────────┘
       │
       │           ┌──────────────┐
       └───────────│ activity_logs│
                   └──────────────┘
```

---

## 📋 Tables

### 1. users

Menyimpan data pengguna (students, instructors, admins)

```sql
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,  -- bcrypt hashed
    bio TEXT,
    avatar_url VARCHAR(500),
    role VARCHAR(20) NOT NULL DEFAULT 'student',  -- student, instructor, admin
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_users_email (email),
    INDEX idx_users_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Fields:**

- `id`: Primary key
- `name`: Nama lengkap user
- `email`: Email unik untuk login
- `password`: Password yang di-hash dengan bcrypt
- `bio`: Deskripsi singkat user (optional)
- `avatar_url`: URL foto profil
- `role`: Peran user (student/instructor/admin)
- `is_active`: Status aktif user

---

### 2. courses

Menyimpan data kursus

```sql
CREATE TABLE courses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    instructor_id BIGINT NOT NULL,
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(250) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    long_description TEXT,
    thumbnail_url VARCHAR(500),
    category VARCHAR(50) NOT NULL,  -- programming, design, business, etc.
    difficulty VARCHAR(20) NOT NULL,  -- beginner, intermediate, advanced
    is_published BOOLEAN DEFAULT false,
    enrolled_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_courses_instructor (instructor_id),
    INDEX idx_courses_slug (slug),
    INDEX idx_courses_category (category),
    INDEX idx_courses_difficulty (difficulty),
    INDEX idx_courses_published (is_published),
    FOREIGN KEY (instructor_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Fields:**

- `id`: Primary key
- `instructor_id`: Foreign key ke `users` (pembuat kursus)
- `title`: Judul kursus
- `slug`: URL-friendly identifier (unik)
- `description`: Deskripsi singkat untuk card/preview
- `long_description`: Deskripsi lengkap untuk halaman detail
- `thumbnail_url`: URL gambar thumbnail
- `category`: Kategori kursus
- `difficulty`: Level kesulitan
- `is_published`: Status publikasi (draft/published)
- `enrolled_count`: Cached count peserta (denormalized untuk performa)

---

### 3. lessons

Menyimpan lesson/pelajaran dalam setiap kursus

```sql
CREATE TABLE lessons (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    course_id BIGINT NOT NULL,
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(250) NOT NULL,
    content_mdx TEXT NOT NULL,  -- Markdown/MDX content
    order_index INTEGER NOT NULL DEFAULT 0,  -- Urutan lesson dalam course (for drag-drop reorder)
    duration_minutes INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT true,  -- Published/Draft status
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_lessons_course (course_id),
    INDEX idx_lessons_order (course_id, order_index),
    UNIQUE KEY unique_course_slug (course_id, slug),
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Fields:**

- `id`: Primary key
- `course_id`: Foreign key ke `courses`
- `title`: Judul lesson
- `slug`: URL-friendly identifier (unik per course)
- `content_mdx`: Konten lesson dalam format MDX
- `order_index`: Urutan lesson (0, 1, 2, ...) - supports drag-drop reordering
- `duration_minutes`: Estimasi waktu belajar (menit)
- `is_published`: Status publikasi (true = terbit, false = draft)

**Note:** Changed from `is_free` to `is_published` to support draft/published workflow in admin panel.

---

### 4. enrollments

Menyimpan data enrollment/pendaftaran user ke course

```sql
CREATE TABLE enrollments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    course_id BIGINT NOT NULL,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_enrollments_user (user_id),
    INDEX idx_enrollments_course (course_id),
    INDEX idx_enrollments_user_course (user_id, course_id),
    UNIQUE KEY unique_user_course (user_id, course_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Fields:**

- `id`: Primary key
- `user_id`: Foreign key ke `users`
- `course_id`: Foreign key ke `courses`
- `enrolled_at`: Waktu enrollment

**Constraints:**

- Unique constraint pada `(user_id, course_id)` → user tidak bisa enroll 2x ke course yang sama

---

### 5. lesson_progress

Menyimpan progress completion lesson per user

```sql
CREATE TABLE lesson_progress (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    lesson_id BIGINT NOT NULL,
    course_id BIGINT NOT NULL,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_lesson_progress_user (user_id),
    INDEX idx_lesson_progress_lesson (lesson_id),
    INDEX idx_lesson_progress_course (course_id),
    INDEX idx_lesson_progress_user_course (user_id, course_id),
    UNIQUE KEY unique_user_lesson (user_id, lesson_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Fields:**

- `id`: Primary key
- `user_id`: Foreign key ke `users`
- `lesson_id`: Foreign key ke `lessons`
- `course_id`: Foreign key ke `courses` (denormalized untuk query performance)
- `completed_at`: Waktu penyelesaian lesson
- `created_at`: Waktu record dibuat
- `updated_at`: Waktu record terakhir diupdate

**Constraints:**

- Unique constraint pada `(user_id, lesson_id)` → idempotent (tidak bisa complete 2x)

---

### 6. certificates

Menyimpan data sertifikat yang dikeluarkan untuk kursus yang telah diselesaikan

```sql
CREATE TABLE certificates (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    course_id INT UNSIGNED NOT NULL,
    issued_at DATETIME NOT NULL,
    certificate_id VARCHAR(32) NOT NULL UNIQUE,
    INDEX idx_user_course (user_id, course_id),
    INDEX idx_certificate_id (certificate_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Fields:**

- `id`: Primary key
- `user_id`: Foreign key ke `users`
- `course_id`: Foreign key ke `courses`
- `issued_at`: Tanggal dan waktu sertifikat dikeluarkan
- `certificate_id`: ID unik sertifikat untuk verifikasi (format: CERT-{user_id}-{course_id}-{timestamp})

**Constraints:**

- Unique constraint pada `certificate_id`
- Index pada `(user_id, course_id)` untuk query cepat

---

### 7. payment_transactions

Menyimpan data transaksi pembayaran menggunakan Midtrans

```sql
CREATE TABLE payment_transactions (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    course_id INT UNSIGNED NOT NULL,
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
    CONSTRAINT fk_payment_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_payment_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_course_id (course_id),
    INDEX idx_order_id (order_id),
    INDEX idx_transaction_status (transaction_status),
    INDEX idx_transaction_time (transaction_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Fields:**

- `id`: Primary key
- `user_id`: Foreign key ke `users`
- `course_id`: Foreign key ke `courses`
- `order_id`: Order ID dari Midtrans (unique)
- `gross_amount`: Jumlah pembayaran
- `payment_type`: Tipe pembayaran (gopay, bank_transfer, credit_card, qris)
- `transaction_status`: Status transaksi (pending, settlement, expire, cancel, failure)
- `transaction_time`: Waktu transaksi dimulai
- `settlement_time`: Waktu settlement (jika berhasil)
- `payment_url`: URL pembayaran dari Midtrans
- `midtrans_response`: Response lengkap dari Midtrans (JSON)

**Constraints:**

- Foreign key ke `users` dan `courses`
- Unique constraint pada `order_id`

---

### 8. course_reviews

Menyimpan ulasan dan rating kursus dari pengguna

```sql
CREATE TABLE course_reviews (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    course_id INT UNSIGNED NOT NULL,
    rating TINYINT UNSIGNED NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_reviews_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_reviews_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_course_review (user_id, course_id),
    INDEX idx_reviews_course_id (course_id),
    INDEX idx_reviews_user_id (user_id),
    INDEX idx_reviews_rating (rating),
    INDEX idx_reviews_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Fields:**

- `id`: Primary key
- `user_id`: Foreign key ke `users`
- `course_id`: Foreign key ke `courses`
- `rating`: Rating 1-5 bintang
- `review_text`: Teks ulasan (optional)
- `created_at`: Waktu ulasan dibuat
- `updated_at`: Waktu ulasan diupdate

**Constraints:**

- Foreign key ke `users` dan `courses`
- Unique constraint pada `(user_id, course_id)` → satu ulasan per user per kursus
- Check constraint pada rating (1-5)

---

### 9. sessions

Menyimpan data sesi live streaming untuk kursus

```sql
CREATE TABLE sessions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    course_id BIGINT UNSIGNED NOT NULL,
    instructor_id BIGINT UNSIGNED NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    scheduled_at TIMESTAMP NOT NULL,
    duration_minutes INT NOT NULL DEFAULT 60,
    max_participants INT NOT NULL DEFAULT 50,
    meeting_url VARCHAR(500),
    recording_url VARCHAR(500),
    is_cancelled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (instructor_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_course (course_id),
    INDEX idx_instructor (instructor_id),
    INDEX idx_scheduled_at (scheduled_at),
    INDEX idx_cancelled (is_cancelled)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Fields:**

- `id`: Primary key
- `course_id`: Foreign key ke `courses`
- `instructor_id`: Foreign key ke `users` (instructor)
- `title`: Judul sesi
- `description`: Deskripsi sesi
- `scheduled_at`: Waktu sesi dijadwalkan
- `duration_minutes`: Durasi sesi dalam menit
- `max_participants`: Jumlah maksimal peserta
- `meeting_url`: URL meeting (Zoom, Google Meet, dll)
- `recording_url`: URL rekaman sesi (setelah selesai)
- `is_cancelled`: Flag apakah sesi dibatalkan
- `created_at`: Waktu record dibuat
- `updated_at`: Waktu record diupdate

**Constraints:**

- Foreign key ke `courses` dan `users`
- Index pada course_id, instructor_id, scheduled_at, is_cancelled

---

### 10. session_participants

Menyimpan data peserta yang terdaftar dalam sesi live

```sql
CREATE TABLE session_participants (
    session_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    attended_at TIMESTAMP NULL,
    PRIMARY KEY (session_id, user_id),
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_session (session_id),
    INDEX idx_user (user_id),
    INDEX idx_registered_at (registered_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Fields:**

- `session_id`: Foreign key ke `sessions`
- `user_id`: Foreign key ke `users`
- `registered_at`: Waktu pendaftaran
- `attended_at`: Waktu kehadiran (null jika belum hadir)

**Constraints:**

- Composite primary key pada `(session_id, user_id)`
- Foreign key ke `sessions` dan `users`

---

### 11. certificates

Menyimpan data sertifikat yang diterbitkan untuk user

```sql
CREATE TABLE certificates (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    course_id BIGINT UNSIGNED NOT NULL,
    issued_at DATETIME NOT NULL,
    certificate_id VARCHAR(32) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_course (user_id, course_id),
    INDEX idx_certificate_id (certificate_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Fields:**

- `id`: Primary key
- `user_id`: User yang menerima sertifikat
- `course_id`: Course yang diselesaikan
- `issued_at`: Tanggal penerbitan sertifikat
- `certificate_id`: Unique ID untuk verifikasi (format: CERT-YYYY-XXXXXX)

**Business Logic:**

- Sertifikat otomatis diterbitkan saat course 100% complete
- Setiap user hanya bisa punya 1 sertifikat per course
- Certificate ID unik untuk verifikasi publik

---

### 12. instructor_earnings

Track instructor revenue dengan holding period untuk risk management

```sql
CREATE TABLE instructor_earnings (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    instructor_id BIGINT UNSIGNED NOT NULL,
    payment_transaction_id BIGINT UNSIGNED NOT NULL,
    course_id BIGINT UNSIGNED NOT NULL,
    
    -- Revenue breakdown
    gross_amount DECIMAL(15,2) NOT NULL COMMENT 'Total payment from student',
    platform_fee DECIMAL(15,2) NOT NULL COMMENT '30% platform fee',
    instructor_share DECIMAL(15,2) NOT NULL COMMENT '70% instructor share',
    
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
```

**Fields:**

- `gross_amount`: Total payment dari student
- `platform_fee`: 30% fee untuk platform
- `instructor_share`: 70% revenue untuk instructor
- `transaction_date`: Tanggal payment original
- `available_date`: Tanggal earnings bisa di-withdraw (transaction_date + 14 hari)
- `status`: held (dalam hold period), available (siap withdraw), withdrawn, refunded

**Business Logic:**

- Revenue split: Platform 30%, Instructor 70%
- Holding period: 14 hari dari transaction date
- Earnings baru bisa di-withdraw setelah available_date

---

### 13. withdrawal_requests

Instructor withdrawal requests dengan admin approval workflow

```sql
CREATE TABLE withdrawal_requests (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL COMMENT 'Instructor who requested withdrawal',
    
    -- Amount breakdown
    amount DECIMAL(15,2) NOT NULL COMMENT 'Total withdrawal amount requested',
    admin_fee DECIMAL(15,2) NOT NULL DEFAULT 0 COMMENT 'Admin fee for processing',
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
    FOREIGN KEY (bank_account_id) REFERENCES instructor_bank_accounts(id) ON DELETE RESTRICT,
    
    -- Indexes
    INDEX idx_user_status (user_id, status),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at),
    INDEX idx_processed_at (processed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Fields:**

- `amount`: Total withdrawal yang diminta
- `admin_fee`: Fee untuk processing (Rp 5,000 fixed)
- `net_amount`: Amount yang di-transfer ke bank (amount - admin_fee)
- `status`: pending → processing → completed/failed
- `processed_by`: Admin yang approve/reject

**Business Logic:**

- Minimum withdrawal: Rp 50,000
- Maximum withdrawal: Rp 10,000,000
- Admin fee: Rp 5,000 (fixed)
- Withdrawal harus approved oleh admin

---

### 14. instructor_bank_accounts

Bank account management dengan verification workflow

```sql
CREATE TABLE instructor_bank_accounts (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    bank_name VARCHAR(100) NOT NULL,
    account_number VARCHAR(50) NOT NULL,
    account_holder_name VARCHAR(100) NOT NULL,
    
    -- Verification
    verification_status ENUM('pending', 'verified', 'rejected') DEFAULT 'pending',
    verified_at TIMESTAMP NULL,
    verified_by BIGINT UNSIGNED NULL,
    verification_notes TEXT NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign keys
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL,
    
    -- Indexes
    INDEX idx_user_id (user_id),
    INDEX idx_account_number (bank_name, account_number),
    INDEX idx_verification_status (verification_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Fields:**

- `bank_name`: Nama bank (BCA, Mandiri, BNI, dll)
- `account_number`: Nomor rekening
- `account_holder_name`: Nama pemilik rekening
- `verification_status`: pending → verified/rejected
- `verified_by`: Admin yang verify

**Business Logic:**

- Instructor harus verify bank account sebelum withdrawal
- Admin melakukan verification manual
- Setiap instructor bisa punya multiple bank accounts

---

### 15. activity_logs

Comprehensive activity tracking untuk audit trail

```sql
CREATE TABLE activity_logs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NULL,
    entity_id BIGINT UNSIGNED NULL,
    details JSON NULL,
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_user_id (user_id),
    INDEX idx_action (action),
    INDEX idx_entity (entity_type, entity_id),
    INDEX idx_created_at (created_at),
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Fields:**

- `action`: Activity type (user_login, course_enrollment, lesson_completed, etc.)
- `entity_type`: Type of entity (course, lesson, payment, etc.)
- `entity_id`: ID of the entity
- `details`: Additional data dalam JSON format
- `ip_address`: IP address user
- `user_agent`: Browser/device information

**Activity Types:**

- `user_registration`, `user_login`, `user_logout`
- `course_enrollment`, `course_unenrollment`
- `lesson_completed`, `course_completed`
- `certificate_issued`
- `payment_completed`, `payment_failed`
- `withdrawal_requested`, `withdrawal_approved`
- `course_created`, `lesson_created`

**Use Case:**

- Audit trail untuk admin
- Monitor platform activity
- Detect suspicious behavior
- Track user engagement

---

## 🔍 Common Queries

### Get User's Enrolled Courses with Progress

```sql
SELECT
    c.id,
    c.title,
    c.thumbnail_url,
    e.enrolled_at,
    COUNT(DISTINCT l.id) as total_lessons,
    COUNT(DISTINCT p.id) as completed_lessons,
    ROUND(COUNT(DISTINCT p.id)::NUMERIC / NULLIF(COUNT(DISTINCT l.id), 0) * 100, 2) as progress_percentage
FROM enrollments e
JOIN courses c ON c.id = e.course_id
LEFT JOIN lessons l ON l.course_id = c.id
LEFT JOIN progresses p ON p.lesson_id = l.id AND p.user_id = e.user_id
WHERE e.user_id = $1
GROUP BY c.id, c.title, c.thumbnail_url, e.enrolled_at
ORDER BY e.enrolled_at DESC;
```

### Get Course with Lesson Completion Status

```sql
SELECT
    l.id,
    l.title,
    l."order",
    l.duration_minutes,
    l.is_free,
    CASE WHEN p.id IS NOT NULL THEN true ELSE false END as is_completed
FROM lessons l
LEFT JOIN progresses p ON p.lesson_id = l.id AND p.user_id = $1
WHERE l.course_id = $2
ORDER BY l."order" ASC;
```

### Check if User is Enrolled

```sql
SELECT EXISTS(
    SELECT 1 FROM enrollments
    WHERE user_id = $1 AND course_id = $2
) as is_enrolled;
```

---

## 🚀 Optimizations

### Indexes

- **users**: email, role
- **courses**: instructor_id, slug, category, difficulty, is_published
- **lessons**: course_id, (course_id, order)
- **enrollments**: user_id, course_id, (user_id, course_id)
- **progresses**: user_id, lesson_id, course_id, (user_id, course_id)

### Denormalization

- `courses.enrolled_count`: Cache jumlah enrollment
- `progresses.course_id`: Duplicate untuk query performance

### Triggers (Optional)

```sql
-- Auto-update enrolled_count saat enrollment baru
CREATE OR REPLACE FUNCTION increment_enrolled_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE courses SET enrolled_count = enrolled_count + 1 WHERE id = NEW.course_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_enrollment_insert
AFTER INSERT ON enrollments
FOR EACH ROW EXECUTE FUNCTION increment_enrolled_count();
```

---

## 📊 Sample Data

### Insert Sample Users

```sql
-- Password: "password123" (bcrypt hashed)
INSERT INTO users (name, email, password, role) VALUES
('Admin User', 'admin@tempaskill.com', '$2a$10$...', 'admin'),
('Jane Instructor', 'jane@tempaskill.com', '$2a$10$...', 'instructor'),
('John Student', 'john@tempaskill.com', '$2a$10$...', 'student');
```

### Insert Sample Course

```sql
INSERT INTO courses (instructor_id, title, slug, description, category, difficulty, is_published) VALUES
(2, 'Golang Fundamentals', 'golang-fundamentals', 'Learn Go from scratch', 'programming', 'beginner', true);
```

### Insert Sample Lessons

```sql
INSERT INTO lessons (course_id, title, slug, content_mdx, "order", duration_minutes, is_free) VALUES
(1, 'Introduction to Go', 'introduction-to-go', '# Introduction...', 1, 30, true),
(1, 'Variables and Types', 'variables-and-types', '# Variables...', 2, 45, false);
```

---

## 🔄 Migrations

### Initial Migration

```go
// migrations/001_initial_schema.go
package migrations

func InitialSchema(db *gorm.DB) error {
    return db.AutoMigrate(
        &models.User{},
        &models.Course{},
        &models.Lesson{},
        &models.Enrollment{},
        &models.Progress{},
    )
}
```

---

**Schema Version**: 2.0.0  
**Last Updated**: December 2, 2025  
**Total Tables**: 15  
**Major Features**: User Management, Course Management, Payment Integration, Instructor Earnings, Withdrawal System, Certificate Generation, Activity Logging, Live Sessions
