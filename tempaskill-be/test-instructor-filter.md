# Testing Instructor Auto-Filter

## Current Situation

- User ID 40 is logged in (from logs)
- Backend is NOT applying instructor_id filter
- This is CORRECT behavior if user is admin

## Debug Headers in Response

Check these headers in browser Network tab:

```
X-Debug-UserRole: admin | instructor | student
X-Debug-UserID: 40
X-Debug-FilterApplied: true | false
```

## Test Steps

### 1. Check Current User Role

Login as current user and check `/api/v1/auth/me` response:

```json
{
  "data": {
    "id": 40,
    "name": "...",
    "email": "...",
    "role": "admin" // ← Check this!
  }
}
```

### 2. Create Instructor Test User

Need to:

1. Register new user OR
2. Change existing user role to "instructor" OR
3. Check if instructor user already exists

### 3. Login as Instructor

1. Login with instructor credentials
2. Navigate to `/admin/courses`
3. Open DevTools → Network tab
4. Check `/api/v1/courses` request
5. **Expected Headers**:
   - `X-Debug-UserRole`: `instructor`
   - `X-Debug-FilterApplied`: `true`
6. **Expected SQL** (in backend logs):
   ```sql
   SELECT ... FROM courses WHERE instructor_id = <user_id> AND deleted_at IS NULL
   ```

## Quick SQL Checks

```sql
-- Check user ID 40 role
SELECT id, name, email, role FROM users WHERE id = 40;

-- Find all instructors
SELECT id, name, email, role FROM users WHERE role = 'instructor';

-- Change user 40 to instructor (FOR TESTING ONLY!)
UPDATE users SET role = 'instructor' WHERE id = 40;

-- Create courses owned by user 40
SELECT id, title, instructor_id FROM courses WHERE instructor_id = 40;
```

## Expected Behavior

### Admin Login

- `X-Debug-FilterApplied`: `false`
- Sees ALL courses (20 total)
- Query: `SELECT * FROM courses WHERE deleted_at IS NULL`

### Instructor Login

- `X-Debug-FilterApplied`: `true`
- Sees ONLY their courses
- Query: `SELECT * FROM courses WHERE instructor_id = <user_id> AND deleted_at IS NULL`

### Student Login

- `X-Debug-FilterApplied`: `false`
- Sees ALL courses (students browse all)
- Query: `SELECT * FROM courses WHERE deleted_at IS NULL`
