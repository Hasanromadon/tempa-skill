# 🔒 Course Authorization Analysis

**Date**: November 29, 2025  
**Scope**: All course & lesson endpoints  
**Status**: ⚠️ **PARTIALLY SECURE** (1 Critical Issue Found)

---

## 📊 Summary

| Endpoint            | Method     | Auth Required | Role Check                        | Status             |
| ------------------- | ---------- | ------------- | --------------------------------- | ------------------ |
| List Courses        | GET        | Optional      | ✅ Auto-filter instructor         | ✅ SECURE          |
| Get Course (ID)     | GET        | No            | N/A                               | ✅ PUBLIC          |
| Get Course (Slug)   | GET        | Optional      | N/A                               | ✅ PUBLIC          |
| Create Course       | POST       | Yes           | ✅ Instructor/Admin               | ✅ SECURE          |
| **Update Course**   | **PATCH**  | **Yes**       | **✅ Owner/Admin**                | **✅ SECURE**      |
| **Delete Course**   | **DELETE** | **Yes**       | **✅ Owner/Admin**                | **✅ SECURE**      |
| Get Lessons         | GET        | Optional      | ✅ Unpublished for owner/enrolled | ✅ SECURE          |
| Get Lesson          | GET        | Optional      | ✅ Unpublished for owner/enrolled | ✅ SECURE          |
| Create Lesson       | POST       | Yes           | ❌ **ONLY OWNER**                 | ⚠️ **ADMIN CAN'T** |
| **Update Lesson**   | **PATCH**  | **Yes**       | **❌ ONLY OWNER**                 | **⚠️ ADMIN CAN'T** |
| **Delete Lesson**   | **DELETE** | **Yes**       | **❌ ONLY OWNER**                 | **⚠️ ADMIN CAN'T** |
| **Reorder Lessons** | **PATCH**  | **Yes**       | **❌ ONLY OWNER**                 | **⚠️ ADMIN CAN'T** |

---

## ✅ **SECURE ENDPOINTS** (Correct Authorization)

### 1. **UPDATE COURSE** (`PATCH /courses/:id`)

**Authorization Logic**:

```go
// service.go:175-177
if course.InstructorID != userID && userRole != "admin" {
    return nil, ErrUnauthorized
}
```

**Behavior**:

- ✅ **Course Owner (Instructor)**: Can edit their own courses
- ✅ **Admin**: Can edit ANY course
- ❌ **Other Instructors**: Cannot edit courses they don't own
- ❌ **Students**: Cannot edit courses

**Test Cases**:

```bash
# ✅ PASS: Owner edits own course
PATCH /courses/1 (instructor_id=2, userID=2) → 200 OK

# ✅ PASS: Admin edits any course
PATCH /courses/1 (instructor_id=2, userID=1, role=admin) → 200 OK

# ❌ FAIL: Other instructor tries to edit
PATCH /courses/1 (instructor_id=2, userID=3, role=instructor) → 403 Forbidden

# ❌ FAIL: Student tries to edit
PATCH /courses/1 (userID=5, role=student) → 403 Forbidden
```

---

### 2. **DELETE COURSE** (`DELETE /courses/:id`)

**Authorization Logic**:

```go
// service.go:217-219
if course.InstructorID != userID && userRole != "admin" {
    return ErrUnauthorized
}
```

**Behavior**:

- ✅ **Course Owner (Instructor)**: Can delete their own courses
- ✅ **Admin**: Can delete ANY course
- ❌ **Other Instructors**: Cannot delete courses they don't own
- ❌ **Students**: Cannot delete courses

**Same authorization pattern as UPDATE COURSE** ✅

---

### 3. **LIST COURSES** (`GET /courses`)

**Authorization Logic**:

```go
// handler.go:122-137
if userRole == "instructor" && query.InstructorID == nil {
    query.InstructorID = &userID  // Auto-filter
}
```

**Behavior**:

- ✅ **Admin**: Sees ALL courses (no filter)
- ✅ **Instructor**: Auto-filtered to see ONLY their courses
- ✅ **Student/Guest**: Sees ALL published courses
- ✅ **Security**: Instructor CANNOT bypass filter to see others' courses

**Fixed in latest commit** ✅ (moved to OptionalAuth middleware)

---

## ⚠️ **INCONSISTENT AUTHORIZATION** (Admin Can't Manage)

### 4. **CREATE LESSON** (`POST /courses/:id/lessons`)

**Authorization Logic**:

```go
// service.go:234-237
if course.InstructorID != userID {
    return nil, ErrUnauthorized
}
```

**Problem**: ❌ **Admin CANNOT create lessons for other instructors' courses**

**Current Behavior**:

- ✅ Course Owner: Can create lessons
- ❌ **Admin**: BLOCKED (should be allowed!)
- ❌ Other Instructors: Blocked (correct)

**Should Be**:

```go
// RECOMMENDED FIX:
if course.InstructorID != userID && userRole != "admin" {
    return nil, ErrUnauthorized
}
```

---

### 5. **UPDATE LESSON** (`PATCH /lessons/:id`)

**Authorization Logic**:

```go
// service.go:327-330
if course.InstructorID != userID {
    return nil, ErrUnauthorized
}
```

**Problem**: ❌ **Same as CREATE - Admin blocked**

**Should Include**:

```go
if course.InstructorID != userID && userRole != "admin" {
    return nil, ErrUnauthorized
}
```

---

### 6. **DELETE LESSON** (`DELETE /lessons/:id`)

**Authorization Logic**:

```go
// service.go:367-370
if course.InstructorID != userID {
    return ErrUnauthorized
}
```

**Problem**: ❌ **Same issue - Admin cannot delete lessons**

---

### 7. **REORDER LESSONS** (`PATCH /lessons/reorder`)

**Authorization Logic**:

```go
// service.go:394-397
if course.InstructorID != userID {
    return ErrUnauthorized
}
```

**Problem**: ❌ **Admin cannot reorder lessons**

---

## 🔧 **RECOMMENDED FIXES**

### Issue: Inconsistent Admin Privileges

**Problem**: Admin can edit/delete COURSES but NOT LESSONS

**Root Cause**: Lesson operations don't check `userRole`

**Fix Strategy**:

#### **Option 1: Add userRole parameter to lesson methods** (Recommended)

```go
// Update service interface
CreateLesson(ctx context.Context, userID uint, userRole string, courseID uint, req *CreateLessonRequest) (*Lesson, error)
UpdateLesson(ctx context.Context, userID uint, userRole string, lessonID uint, req *UpdateLessonRequest) (*Lesson, error)
DeleteLesson(ctx context.Context, userID uint, userRole string, lessonID uint) error
ReorderLessons(ctx context.Context, userID uint, userRole string, updates []LessonOrderUpdate) error

// Update authorization checks
if course.InstructorID != userID && userRole != "admin" {
    return ErrUnauthorized
}
```

#### **Option 2: Keep current behavior** (Document it)

If you want Admins to ONLY manage courses (not lessons), document this clearly:

- Admin: Full course CRUD, no lesson access
- Instructor: Full control over their courses AND lessons

---

## 🎯 **DECISION REQUIRED**

### **Should Admin be able to manage lessons?**

#### **YES** (Recommended for full admin control):

- ✅ Consistent with course permissions
- ✅ Admin can fix instructor mistakes
- ✅ Better for support/moderation
- ❌ Requires code changes (4 methods)

#### **NO** (Current behavior):

- ✅ No code changes needed
- ✅ Instructors have full autonomy
- ❌ Admin can't help with lesson issues
- ❌ Inconsistent permissions model

---

## 🧪 **TEST SCENARIOS**

### Test Matrix

| Scenario                        | Endpoint                    | User                   | Expected   | Current    |
| ------------------------------- | --------------------------- | ---------------------- | ---------- | ---------- |
| Owner edits course              | PATCH /courses/1            | Instructor (owner)     | ✅ 200     | ✅ 200     |
| Admin edits course              | PATCH /courses/1            | Admin                  | ✅ 200     | ✅ 200     |
| Other instructor edits          | PATCH /courses/1            | Instructor (not owner) | ❌ 403     | ✅ 403     |
| Owner deletes course            | DELETE /courses/1           | Instructor (owner)     | ✅ 200     | ✅ 200     |
| Admin deletes course            | DELETE /courses/1           | Admin                  | ✅ 200     | ✅ 200     |
| Owner creates lesson            | POST /courses/1/lessons     | Instructor (owner)     | ✅ 201     | ✅ 201     |
| **Admin creates lesson**        | **POST /courses/1/lessons** | **Admin**              | **✅ 201** | **❌ 403** |
| Other instructor creates lesson | POST /courses/1/lessons     | Instructor (not owner) | ❌ 403     | ✅ 403     |
| Owner edits lesson              | PATCH /lessons/1            | Instructor (owner)     | ✅ 200     | ✅ 200     |
| **Admin edits lesson**          | **PATCH /lessons/1**        | **Admin**              | **✅ 200** | **❌ 403** |
| **Admin deletes lesson**        | **DELETE /lessons/1**       | **Admin**              | **✅ 200** | **❌ 403** |
| **Admin reorders lessons**      | **PATCH /lessons/reorder**  | **Admin**              | **✅ 200** | **❌ 403** |

---

## 📝 **IMPLEMENTATION CHECKLIST**

If you decide to give Admin full lesson access:

### Backend Changes

- [ ] Update `CreateLesson` signature to include `userRole`
- [ ] Update `UpdateLesson` signature to include `userRole`
- [ ] Update `DeleteLesson` signature to include `userRole`
- [ ] Update `ReorderLessons` signature to include `userRole`
- [ ] Update handler calls to pass `userRole`
- [ ] Update authorization checks: `&& userRole != "admin"`
- [ ] Add tests for admin lesson operations

### Files to Modify

1. `internal/course/service.go`:

   - Line 32-37: Service interface
   - Line 230: `CreateLesson` signature + auth check
   - Line 320: `UpdateLesson` signature + auth check
   - Line 355: `DeleteLesson` signature + auth check
   - Line 375: `ReorderLessons` signature + auth check

2. `internal/course/handler.go`:
   - Line 245+: `CreateLesson` - extract `userRole`, pass to service
   - Line 280+: `UpdateLesson` - extract `userRole`, pass to service
   - Line 315+: `DeleteLesson` - extract `userRole`, pass to service
   - Line 350+: `ReorderLessons` - extract `userRole`, pass to service

### Testing

```bash
# Test admin lesson creation
curl -X POST http://localhost:8080/api/v1/courses/1/lessons \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -d '{"title": "New Lesson", "content": "..."}'

# Expected: 201 Created (after fix)
# Current: 403 Forbidden
```

---

## ✅ **CONCLUSION**

### Current State:

- ✅ **Course operations**: Properly secured (Owner OR Admin)
- ⚠️ **Lesson operations**: Only owner allowed (Admin blocked)
- ✅ **Auto-filter**: Working correctly for instructors
- ✅ **No security vulnerabilities**: Authorization is enforced

### Recommendation:

**Allow Admin to manage lessons** for consistency and better platform management.

### Priority:

**MEDIUM** - Current behavior is secure, just inconsistent. Can be fixed in next sprint.
