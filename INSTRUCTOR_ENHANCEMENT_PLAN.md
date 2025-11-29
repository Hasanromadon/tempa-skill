# 📊 Analisis & Enhancement Plan - Fitur Instruktur TempaSKill

**Tanggal:** 29 November 2025  
**Status:** Analisis & Rekomendasi

---

## 🔍 ANALISIS KONDISI SAAT INI

### ✅ BACKEND - Yang Sudah Ada

#### 1. **Autentikasi & Otorisasi**
- ✅ Role system: `student`, `instructor`, `admin`
- ✅ JWT authentication dengan role claim
- ✅ Middleware `RequireRole()` untuk role-based access
- ✅ Context propagation (`userID`, `userRole`)

#### 2. **Course Management**
```go
// internal/course/service.go
- CreateCourse() - Instructor dapat create course
- UpdateCourse() - Instructor hanya bisa update course miliknya
- DeleteCourse() - Instructor hanya bisa delete course miliknya
- CreateLesson() - Instructor hanya bisa create lesson di course miliknya
- UpdateLesson() - Instructor hanya bisa update lesson di course miliknya
- DeleteLesson() - Instructor hanya bisa delete lesson di course miliknya
- ReorderLessons() - Instructor hanya bisa reorder lesson di course miliknya
```

**Validasi:**
```go
if course.InstructorID != userID && userRole != "admin" {
    return ErrUnauthorized // "Only course instructor or admin can perform this action"
}
```

#### 3. **Session Management**
```go
// internal/session/service.go
- CreateSession() - Instructor bisa create session
- UpdateSession() - Hanya instructor pemilik session
- DeleteSession() - Hanya instructor pemilik session
- GetSessionParticipants() - Hanya instructor pemilik session
- MarkAttendance() - Hanya instructor pemilik session
```

**Validasi:**
```go
if session.InstructorID != userID {
    return errors.New("only instructor can access session participants")
}
```

#### 4. **Upload**
- ✅ Image upload untuk thumbnail (authenticated users)

---

### ❌ BACKEND - Yang BELUM Ada

#### 1. **Dashboard Analytics untuk Instruktur**
- ❌ Total siswa enrolled di kursus instruktur
- ❌ Total revenue dari kursus berbayar
- ❌ Course completion rates
- ❌ Student progress tracking per course
- ❌ Most popular courses
- ❌ Recent enrollments
- ❌ Review statistics (avg rating, total reviews)

#### 2. **Student Management**
- ❌ List students enrolled in instructor's courses
- ❌ View individual student progress
- ❌ Export student data (CSV/Excel)
- ❌ Send notifications to enrolled students

#### 3. **Content Management**
- ❌ Bulk upload lessons
- ❌ Course draft/published status
- ❌ Schedule course publication
- ❌ Course preview before publish

#### 4. **Revenue & Analytics**
- ❌ Revenue tracking per course
- ❌ Payment history
- ❌ Revenue reports (daily/monthly/yearly)
- ❌ Top earning courses

#### 5. **Communication**
- ❌ Announcement system to students
- ❌ Q&A/Discussion forum per course
- ❌ Direct messaging with students

---

### ✅ FRONTEND - Yang Sudah Ada

#### 1. **Route Protection**
```tsx
// middleware.ts
- Admin routes protected (including instructor)
- Token validation dari cookie
```

#### 2. **Role Check**
```tsx
// hooks/use-auth.ts
- useIsAdmin() → returns true untuk admin & instructor
- useHasRole(role) → check specific role
```

#### 3. **Admin Layout**
```tsx
// app/admin/layout.tsx
- Sidebar navigation
- Protected untuk admin & instructor
- Auto redirect jika bukan admin/instructor
```

#### 4. **Admin Pages (Accessible untuk Instructor)**
- ✅ `/admin/dashboard` - Overview
- ✅ `/admin/courses` - Course list dengan create/edit
- ✅ `/admin/users` - User management
- ✅ `/admin/sessions` - Session management
- ✅ `/admin/payments` - Payment tracking
- ✅ `/admin/settings` - Platform settings

---

### ❌ FRONTEND - Yang BELUM Ada

#### 1. **Instructor-Specific Pages**
- ❌ `/instructor/dashboard` - Dashboard khusus instruktur
- ❌ `/instructor/courses` - My courses (hanya milik instruktur)
- ❌ `/instructor/students` - My students
- ❌ `/instructor/analytics` - Analytics & reports
- ❌ `/instructor/earnings` - Revenue tracking

#### 2. **Filtering & Permissions**
- ❌ Admin melihat SEMUA courses
- ❌ Instructor hanya melihat courses MILIKNYA
- ❌ Filter by instructor_id di backend

#### 3. **UI Indicators**
- ❌ Badge "Instruktur Kursus Ini" di course card
- ❌ Disable edit/delete untuk course bukan miliknya
- ❌ Warning saat mencoba akses course orang lain

---

## 🎯 ENHANCEMENT PLAN

### **FASE 1: Backend API Enhancement** (Prioritas Tinggi)

#### 1.1 Instructor Dashboard Stats API
**Endpoint:** `GET /api/v1/instructor/dashboard`

```go
// Response:
{
  "total_courses": 5,
  "total_students": 120,
  "total_revenue": 15000000, // Rp
  "total_reviews": 45,
  "avg_rating": 4.7,
  "recent_enrollments": [
    {
      "user_name": "John Doe",
      "course_title": "React Advanced",
      "enrolled_at": "2025-11-28T10:00:00Z"
    }
  ],
  "top_courses": [
    {
      "title": "React Advanced",
      "enrolled_count": 50,
      "completion_rate": 75.5,
      "revenue": 5000000
    }
  ]
}
```

**Implementasi:**
- File: `internal/instructor/handler.go`
- File: `internal/instructor/service.go`
- File: `internal/instructor/repository.go`

#### 1.2 My Courses API (Filtered)
**Endpoint:** `GET /api/v1/instructor/courses`

```go
// Query by instructor_id dari JWT
// Response sama seperti /courses tapi filtered
```

#### 1.3 My Students API
**Endpoint:** `GET /api/v1/instructor/students`

```go
// Get all unique students enrolled in instructor's courses
{
  "students": [
    {
      "id": 10,
      "name": "John Doe",
      "email": "john@example.com",
      "enrolled_courses": [
        {
          "course_id": 1,
          "course_title": "React Advanced",
          "progress": 75.5,
          "enrolled_at": "2025-11-01T00:00:00Z"
        }
      ]
    }
  ]
}
```

#### 1.4 Revenue Analytics API
**Endpoint:** `GET /api/v1/instructor/revenue`

```go
// Query params: period=daily|weekly|monthly|yearly
{
  "total_revenue": 15000000,
  "revenue_by_course": [
    {
      "course_id": 1,
      "course_title": "React Advanced",
      "revenue": 5000000,
      "payment_count": 50
    }
  ],
  "revenue_by_period": [
    {
      "period": "2025-11",
      "revenue": 3000000,
      "payment_count": 30
    }
  ]
}
```

---

### **FASE 2: Frontend Instructor Dashboard** (Prioritas Tinggi)

#### 2.1 Create Instructor Routes
```
/instructor/
  ├── dashboard/          # Overview stats
  ├── courses/            # My courses only
  ├── students/           # My students
  ├── analytics/          # Detailed analytics
  ├── earnings/           # Revenue tracking
  └── settings/           # Instructor preferences
```

#### 2.2 Instructor Layout Component
```tsx
// app/instructor/layout.tsx
- Similar to admin layout
- Sidebar dengan menu instruktur
- Protected route (instructor role only)
- Different color scheme (blue instead of orange?)
```

#### 2.3 Instructor Dashboard Page
```tsx
// app/instructor/dashboard/page.tsx
Components:
- StatsCard (Total Courses, Students, Revenue, Reviews)
- RecentEnrollmentsTable
- TopCoursesChart (Bar/Line chart)
- CourseCompletionChart (Pie/Donut chart)
- QuickActions (Create Course, View Students, etc.)
```

#### 2.4 My Courses Page
```tsx
// app/instructor/courses/page.tsx
Features:
- Server table with filters
- Only show courses where instructor_id = current user
- Create, Edit, Delete actions
- Publish/Unpublish toggle
- View analytics per course
```

#### 2.5 My Students Page
```tsx
// app/instructor/students/page.tsx
Features:
- List all students in instructor's courses
- Filter by course
- View student progress
- Export to CSV
- Send message/announcement
```

---

### **FASE 3: Permission & Authorization Enhancement** (Prioritas Sedang)

#### 3.1 Backend Middleware Improvement
```go
// Add instructor-specific middleware
func RequireInstructor() gin.HandlerFunc {
    return func(c *gin.Context) {
        role := c.GetString("userRole")
        if role != "instructor" && role != "admin" {
            response.Forbidden(c, "Instructor access required")
            c.Abort()
            return
        }
        c.Next()
    }
}
```

#### 3.2 Course Ownership Check Helper
```go
// internal/course/service.go
func (s *Service) IsOwner(courseID uint, userID uint) (bool, error) {
    course, err := s.repo.FindByID(courseID)
    if err != nil {
        return false, err
    }
    return course.InstructorID == userID, nil
}
```

#### 3.3 Frontend Permission Guards
```tsx
// hooks/use-course-permissions.ts
export const useCoursePermissions = (courseId: number) => {
  const { user } = useIsAuthenticated();
  const { data: course } = useCourse(courseId);
  
  return {
    canEdit: user?.role === 'admin' || course?.instructor_id === user?.id,
    canDelete: user?.role === 'admin' || course?.instructor_id === user?.id,
    isOwner: course?.instructor_id === user?.id,
  };
};
```

---

### **FASE 4: Feature Enhancement** (Prioritas Rendah)

#### 4.1 Course Draft System
```go
// Add status field to courses table
type Course struct {
    // ... existing fields
    Status string `gorm:"type:enum('draft','published','archived');default:'draft'"
}

// Only published courses visible to students
// Instructors can see all their courses (draft, published, archived)
```

#### 4.2 Bulk Operations
- Bulk lesson upload (CSV/JSON)
- Bulk student enrollment
- Bulk message to students

#### 4.3 Communication System
- Announcement per course
- Q&A forum
- Direct messaging

#### 4.4 Advanced Analytics
- Student engagement metrics
- Lesson completion heatmap
- Drop-off points analysis
- A/B testing for course content

---

## 📋 IMPLEMENTATION PRIORITY

### **Priority 1 - CRITICAL (Minggu 1-2)**
1. ✅ Backend: Instructor dashboard stats API
2. ✅ Backend: My courses API (filtered)
3. ✅ Frontend: Instructor dashboard page
4. ✅ Frontend: Instructor layout & routing
5. ✅ Permission guards di UI

### **Priority 2 - HIGH (Minggu 3-4)**
1. Backend: My students API
2. Backend: Revenue analytics API
3. Frontend: My students page
4. Frontend: Analytics page
5. Frontend: Earnings page

### **Priority 3 - MEDIUM (Minggu 5-6)**
1. Course draft system
2. Bulk operations
3. Enhanced permissions
4. UI polish & UX improvements

### **Priority 4 - LOW (Future)**
1. Communication system
2. Advanced analytics
3. Mobile app support

---

## 🔧 QUICK WINS (Implementasi Cepat)

### 1. Filter Admin Courses by Instructor
**Backend:**
```go
// internal/course/handler.go - ListCourses
if userRole == "instructor" {
    // Add filter: instructor_id = userID
    query = query.Where("instructor_id = ?", userID)
}
```

**Impact:** Instruktur langsung hanya lihat course miliknya di `/admin/courses`

### 2. Disable Edit/Delete Button
**Frontend:**
```tsx
// components/course/course-card.tsx
const { canEdit } = useCoursePermissions(course.id);

<Button disabled={!canEdit}>Edit</Button>
<Button disabled={!canEdit}>Delete</Button>
```

**Impact:** UI lebih jelas, prevent unauthorized actions

### 3. Add Instructor Badge
**Frontend:**
```tsx
{course.instructor_id === user?.id && (
  <Badge className="bg-blue-100 text-blue-800">
    Kursus Anda
  </Badge>
)}
```

**Impact:** Visual indicator ownership

---

## 🎨 UI/UX RECOMMENDATIONS

### 1. Separate Instructor Dashboard
- Different route: `/instructor/*` vs `/admin/*`
- Different color theme (blue for instructor, orange for admin)
- Focused metrics relevant to instructors

### 2. Clear Role Indicators
- Badge on navbar: "Instruktur" or "Admin"
- Different sidebar menus for admin vs instructor
- Tooltip explanations for permissions

### 3. Onboarding for New Instructors
- Welcome modal with quick start guide
- Tutorial overlay for first course creation
- Help center with instructor documentation

---

## 📝 NEXT STEPS

1. **Approval:** Review plan dengan team/stakeholders
2. **Backend Implementation:** Create instructor module
3. **Frontend Implementation:** Create instructor dashboard
4. **Testing:** E2E tests untuk instructor flows
5. **Documentation:** Update API_SPEC.md dan README.md
6. **Deployment:** Staging → Production

---

## 📊 SUCCESS METRICS

- [ ] Instructor dapat melihat dashboard stats
- [ ] Instructor hanya melihat courses miliknya
- [ ] Instructor dapat track students
- [ ] Instructor dapat melihat revenue
- [ ] E2E tests untuk semua instructor flows
- [ ] Zero unauthorized access incidents
- [ ] Documentation lengkap

---

**Status:** Ready for Implementation ✅
