# Quick Database Setup

Buka MySQL Workbench atau command line, lalu jalankan:

```sql
CREATE DATABASE IF NOT EXISTS tempaskill
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;
```

Selesai! Server akan otomatis create tables saat pertama kali dijalankan (auto-migration sudah diaktifkan).

## Verifikasi

```sql
SHOW DATABASES LIKE 'tempaskill';
USE tempaskill;
SHOW TABLES;
```

Setelah server berjalan pertama kali, akan terlihat tabel `users`.
