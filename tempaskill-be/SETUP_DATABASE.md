# Database Setup Instructions

## ⚡ Quick Setup

### Option 1: Using MySQL Workbench (Recommended)

1. Open **MySQL Workbench**
2. Connect to your MySQL server
3. Click **File** → **Open SQL Script**
4. Select `migrations/001_init_schema.sql`
5. Click **Execute** (⚡ lightning icon)
6. Verify database created: Run `SHOW DATABASES;`

### Option 2: Using PowerShell Script

```powershell
cd tempaskill-be
.\setup-db.ps1
```

Follow the prompts to enter MySQL credentials.

### Option 3: Using Command Line (If MySQL in PATH)

```bash
mysql -u root -p < migrations/001_init_schema.sql
```

### Option 4: Manual Copy-Paste

1. Open MySQL Workbench or phpMyAdmin
2. Copy content dari `migrations/001_init_schema.sql`
3. Paste ke SQL editor
4. Execute

## ✅ Verify Setup

```sql
USE tempaskill;
SHOW TABLES;
```

Expected output:

```
+---------------------+
| Tables_in_tempaskill|
+---------------------+
| courses             |
| enrollments         |
| lessons             |
| progresses          |
| users               |
+---------------------+
```

## 🔍 Check Table Structure

```sql
DESCRIBE users;
DESCRIBE courses;
DESCRIBE lessons;
```

## 🧪 Insert Sample Data (Optional)

```sql
-- Sample instructor
INSERT INTO users (name, email, password, role, bio) VALUES
('John Instructor', 'instructor@example.com', '$2a$10$hash_here', 'instructor', 'Experienced developer');

-- Sample student
INSERT INTO users (name, email, password, role) VALUES
('Jane Student', 'student@example.com', '$2a$10$hash_here', 'student');
```

## 🛠️ Troubleshooting

### Error: Access Denied

```sql
-- Grant permissions
GRANT ALL PRIVILEGES ON tempaskill.* TO 'root'@'localhost';
FLUSH PRIVILEGES;
```

### Error: Database Exists

```sql
-- Drop and recreate
DROP DATABASE IF EXISTS tempaskill;
source migrations/001_init_schema.sql
```

### Can't Find MySQL

**Windows:**

- Install MySQL from https://dev.mysql.com/downloads/mysql/
- Or install XAMPP: https://www.apachefriends.org/

**Add to PATH:**

```
C:\Program Files\MySQL\MySQL Server 8.0\bin
```

## 📝 Update .env File

After creating database, update your `.env`:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_actual_password
DB_NAME=tempaskill
```

## ▶️ Run Server

```bash
go run cmd/api/main.go
```

Expected output:

```
✅ Database connected successfully
🚀 Server starting on http://localhost:8080
```

## 🔗 Test Connection

```bash
curl http://localhost:8080/api/v1/health
```

Response:

```json
{
  "success": true,
  "message": "TempaSKill API is running",
  "data": {
    "version": "1.0.0",
    "environment": "development",
    "database": "connected"
  }
}
```
