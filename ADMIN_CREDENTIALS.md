# 🔐 Admin Credentials

## Default Admin Account

Untuk mengakses **Admin Panel** di `/admin/dashboard`, gunakan kredensial berikut:

### Login Credentials

```
Email:    admin@tempaskill.com
Password: admin123
```

### Access URLs

- **Admin Dashboard**: http://localhost:3000/admin/dashboard
- **Manage Courses**: http://localhost:3000/admin/courses
- **Login Page**: http://localhost:3000/login

---

## Membuat Admin User

Jika database di-reset atau admin user belum ada, jalankan:

### Via Makefile (Recommended)

```bash
cd tempaskill-be
make db-migrate FILE=create_admin_user.sql
```

### Via Manual SQL

```bash
cd tempaskill-be
mysql -u root tempaskill < migrations/create_admin_user.sql
```

### Generate Password Hash Baru

Jika ingin mengganti password:

```bash
cd tempaskill-be
go run scripts/generate_admin_hash.go
```

Output akan berisi bcrypt hash yang bisa dimasukkan ke SQL file.

---

## User Roles

Sistem mendukung 3 role:

1. **`admin`** - Akses penuh ke admin panel (create/edit/delete courses & lessons)
2. **`instructor`** - Dapat membuat dan mengelola kursus sendiri
3. **`student`** - User biasa (enroll courses, track progress)

### Cara Mengubah Role User

```sql
-- Upgrade user menjadi admin
UPDATE users SET role = 'admin' WHERE email = 'user@example.com';

-- Upgrade user menjadi instructor
UPDATE users SET role = 'instructor' WHERE email = 'user@example.com';

-- Downgrade ke student
UPDATE users SET role = 'student' WHERE email = 'user@example.com';
```

---

## Security Notes

⚠️ **PENTING**:

1. **Jangan gunakan kredensial ini di production!**
2. Ganti password admin setelah first login di production
3. Password `admin123` hanya untuk **development/testing**
4. Di production, gunakan password yang kuat (min 12 karakter, kombinasi huruf/angka/simbol)

---

## Troubleshooting

### Login Gagal

1. **Cek user ada di database**:
   ```bash
   cd tempaskill-be
   make db-status
   ```
2. **Cek role user**:
   ```sql
   SELECT id, name, email, role FROM users WHERE email='admin@tempaskill.com';
   ```
3. **Re-run migration jika user tidak ada**:
   ```bash
   cd tempaskill-be
   make db-migrate FILE=create_admin_user.sql
   ```

### Tidak Bisa Akses Admin Panel

1. User harus login dulu di `/login`
2. Role harus `admin` atau `instructor`
3. Token JWT harus valid (tidak expired)
4. Cek console browser untuk error

---

**Last Updated**: November 4, 2025  
**Version**: 1.0.0
