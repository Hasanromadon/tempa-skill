# Database Schema - TempaSKill

> MySQL database schema untuk tempaskill-be

---

## 📊 Entity Relationship Diagram

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│    users    │────┬────│ enrollments  │────┬────│   courses   │
└─────────────┘    │    └──────────────┘    │    └─────────────┘
                   │                        │
                   │    ┌──────────────┐    │    ┌─────────────┐
                   └────│  progresses  │    └────│   lessons   │
                        └──────────────┘         └─────────────┘
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

### 5. progresses

Menyimpan progress completion lesson per user

```sql
CREATE TABLE progresses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    lesson_id BIGINT NOT NULL,
    course_id BIGINT NOT NULL,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_progresses_user (user_id),
    INDEX idx_progresses_lesson (lesson_id),
    INDEX idx_progresses_course (course_id),
    INDEX idx_progresses_user_course (user_id, course_id),
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

**Constraints:**

- Unique constraint pada `(user_id, lesson_id)` → idempotent (tidak bisa complete 2x)

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

**Schema Version**: 1.0.0  
**Last Updated**: November 3, 2025
