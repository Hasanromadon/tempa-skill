# Firebase Storage Setup Guide

## 📋 Overview

TempaSKill backend menggunakan **Firebase Storage** untuk menyimpan file gambar (thumbnail kursus, gambar pelajaran, avatar user).

---

## 🔧 Prerequisites

### 1. Firebase Project

You need a Firebase project with Storage enabled.

- **Project ID**: `your-project-id` (e.g., `tempaskill-prod`)
- **Storage Bucket**: `your-project-id.firebasestorage.app`

### 2. Service Account JSON

Anda memerlukan file service account JSON dari Firebase Console.

---

## 📥 Setup Instructions

### Step 1: Download Service Account JSON

1. Buka Firebase Console: https://console.firebase.google.com/
2. Pilih project Anda
3. Klik **⚙️ Project Settings** (pojok kiri atas, di samping Project Overview)
4. Tab **Service Accounts**
5. Klik tombol **"Generate new private key"**
6. File JSON akan terdownload dengan nama seperti:
   ```
   your-project-id-firebase-adminsdk-xxxxx-xxxxxxxxxx.json
   ```

### Step 2: Copy ke Backend Directory

Copy file JSON ke directory backend:

```
tempaskill-be/your-project-firebase-adminsdk-xxxxx.json
```

**PENTING**: Pastikan nama file PERSIS seperti di `.env`:

```env
FIREBASE_SERVICE_ACCOUNT=your-project-firebase-adminsdk-xxxxx.json
```

Jika nama file JSON berbeda, update `.env` sesuai nama file yang Anda download.

### Step 3: Verify Setup

1. **Check File Exists**:

   ```bash
   cd tempaskill-be
   ls *-firebase-adminsdk-*.json
   ```

2. **Start Backend**:

   ```bash
   go run cmd/api/main.go
   ```

3. **Look for Success Log**:

   ```
   2025-11-04T10:36:41.138+0700    INFO    logger/logger.go:47     Firebase initialized successfully
   ```

   ❌ **If you see error**:

   ```
   Failed to initialize Firebase
   ```

   Check:

   - File JSON exists in `tempaskill-be/` directory
   - Filename matches `.env` configuration
   - File permissions (readable)

---

## 🔐 Security Notice

⚠️ **NEVER COMMIT SERVICE ACCOUNT JSON TO GIT!**

File sudah ditambahkan ke `.gitignore`:

```gitignore
# Firebase
*-firebase-adminsdk-*.json
tempaskill-be/ngecis-4035d-firebase-adminsdk-fbsvc-b062d03ee9.json
```

Untuk production deployment:

1. Upload JSON ke server secara manual (SSH/FTP)
2. Atau gunakan environment variable untuk private key
3. Simpan di secret manager (Google Secret Manager, AWS Secrets Manager)

---

## 🧪 Testing Upload Endpoint

### Get JWT Token

1. **Login** (gunakan akun admin):

   ```bash
   curl -X POST http://localhost:8080/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{
       "email": "admin@tempaskill.com",
       "password": "admin123"
     }'
   ```

2. **Copy token** dari response:
   ```json
   {
     "message": "Login successful",
     "data": {
       "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
     }
   }
   ```

### Upload Image

**Using curl**:

```bash
curl -X POST http://localhost:8080/api/v1/upload/image \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@path/to/image.jpg" \
  -F "folder=thumbnails"
```

**Using Postman**:

1. Create POST request: `http://localhost:8080/api/v1/upload/image`
2. Headers:
   - `Authorization: Bearer YOUR_JWT_TOKEN`
3. Body → form-data:
   - Key: `file` (type: File) → Select image file
   - Key: `folder` (type: Text) → Value: `thumbnails`
4. Send

**Success Response**:

```json
{
  "message": "Image uploaded successfully",
  "data": {
    "url": "https://firebasestorage.googleapis.com/v0/b/ngecis-4035d.firebasestorage.app/o/thumbnails%2F2025%2F11%2Fxxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx.jpg?alt=media",
    "filename": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx.jpg",
    "size": 245678,
    "mime_type": "image/jpeg"
  }
}
```

---

## 📂 Upload Folders

| Folder       | Purpose                  | Used In               |
| ------------ | ------------------------ | --------------------- |
| `images`     | General images (default) | MDX content           |
| `thumbnails` | Course thumbnails        | Course form           |
| `avatars`    | User profile pictures    | User profile (future) |
| `lessons`    | Lesson-specific images   | Lesson content        |

**Storage Organization**:

```
Firebase Storage Bucket
├── images/
│   ├── 2025/
│   │   └── 11/
│   │       ├── {uuid1}.jpg
│   │       └── {uuid2}.png
├── thumbnails/
│   └── 2025/
│       └── 11/
│           └── {uuid3}.jpg
├── avatars/
└── lessons/
```

---

## 🚨 Troubleshooting

### Error: "Failed to initialize Firebase"

**Cause**: Service account JSON file not found

**Solution**:

```bash
# Check file exists
cd tempaskill-be
ls *-firebase-adminsdk-*.json

# If not exists, download from Firebase Console
# Copy to tempaskill-be/ directory
```

### Error: "Failed to upload image to Firebase Storage"

**Cause**: Firebase Storage rules or permissions

**Solution**:

1. Open Firebase Console → Storage → Rules
2. Update rules (for testing):
   ```
   rules_version = '2';
   service firebase.storage {
     match /b/{bucket}/o {
       match /{allPaths=**} {
         allow read, write: if true; // TESTING ONLY!
       }
     }
   }
   ```
   ⚠️ **For production**, use proper authentication rules!

### Error: "Unauthorized" when uploading

**Cause**: Invalid or expired JWT token

**Solution**:

```bash
# Get new token
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@tempaskill.com", "password": "admin123"}'

# Use new token in Authorization header
```

---

## 📖 API Documentation

See `API_SPEC.md` for complete upload endpoint documentation.

**Endpoint**: `POST /api/v1/upload/image`

**Parameters**:

- `file` (multipart/form-data, required) - Image file
- `folder` (string, optional) - Upload folder (default: "images")

**Validation**:

- **Allowed Types**: jpg, jpeg, png, gif, webp
- **Max Size**: 5MB (5,242,880 bytes)
- **Allowed Folders**: images, thumbnails, avatars, lessons

**Authentication**: Required (JWT token in Authorization header)

---

## 🎯 Next Steps

After Firebase setup complete:

1. ✅ Backend upload endpoint working
2. 🔄 Create frontend `ImageUpload` component (React)
3. 🔄 Integrate with `CourseForm` (thumbnail upload)
4. 🔄 Integrate with `MDXEditor` (inline images)
5. 🔄 Add image deletion feature

---

**Updated**: November 4, 2025  
**Version**: 1.0.0
