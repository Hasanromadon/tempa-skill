# 📝 TODO List - TempaSKill Platform

> Tracking semua fitur yang belum diimplementasikan
>
> **Last Updated**: November 10, 2025

---

## � Project Status Summary

**TempaSKill Platform** - Hybrid Course Learning Platform

### ✅ **CORE MVP FEATURES COMPLETED** (80% Complete)

**Platform Foundation:**

- [x] Full-stack Go + Next.js application
- [x] MySQL database with migrations
- [x] JWT authentication system
- [x] RESTful API architecture
- [x] TypeScript + React Query frontend
- [x] Responsive UI with Shadcn components

**Learning Management:**

- [x] Course catalog with search/filter/sort/pagination (Courses Page Integration)
- [x] Sort Dropdown Component for course sorting
- [x] Individual course pages with enrollment
- [x] Lesson viewing with MDX content
- [x] Progress tracking system
- [x] User dashboard and profile

**Admin Management:**

- [x] Complete course CRUD operations
- [x] Complete lesson CRUD operations
- [x] Live session scheduling system
- [x] Payment monitoring dashboard

**User Experience:**

---

### Documentation Updated

- [x] README.md: Roadmap and features marked complete for Courses Page Integration and Sort Dropdown

- ✅ Authentication (login/register)
- ✅ Profile management
- ✅ Payment history tracking
- ✅ Mobile-responsive design

### 🚧 **REMAINING MVP FEATURES** (25% Remaining)

**Content Creation:**

- ✅ MDX Editor with Live Preview (8 hours)
- ⏸️ Custom MDX Components (Callout, Tabs, Quiz)

**Monetization:**

- ✅ Payment Integration - Midtrans Backend (6 hours)
- ⏸️ Certificate Generation (4 hours)

**Community:**

- ⏸️ Discussion Forum per Course (8 hours)
- ⏸️ Course Reviews & Ratings (4 hours)

**Quality Assurance:**

- ⏸️ Email Notifications (6 hours)
- ⏸️ E2E Testing Suite (6 hours)
- ⏸️ Performance Optimization (4 hours)

---

## 🔴 High Priority (MVP Required)

### 1. Admin Panel - Course Management ✅

**Status**: ✅ Completed
**Estimated Time**: 6 hours
**Priority**: 🔴 Critical

**Description**:
Buat admin panel untuk CRUD courses dengan fitur:

- ✅ Create/edit/delete course
- ✅ Upload thumbnail dengan preview
- ✅ Set pricing (free/paid)
- ✅ Publish/unpublish course
- ✅ Course preview mode

**Files Created**:

```
tempaskill-fe/src/app/admin/courses/
├── page.tsx                    # Course list with table ✅
├── new/page.tsx               # Create course form ✅
└── [id]/edit/page.tsx         # Edit course form ✅

tempaskill-fe/src/components/admin/
├── course-form.tsx            # Reusable form component ✅
└── image-upload.tsx           # Image upload with preview ✅
```

---

### 2. Admin Panel - Lesson Management ✅

**Status**: ✅ Completed  
**Estimated Time**: 6 hours  
**Priority**: 🔴 Critical

**Description**:
Buat admin panel untuk CRUD lessons dengan fitur:

- ✅ Create/edit/delete lesson
- ✅ MDX editor dengan preview
- ✅ Drag-and-drop reorder lessons
- ✅ Set duration dan difficulty
- ✅ Lesson preview mode

---

### 3. MDX Editor dengan Live Preview ✅

**Status**: ✅ Completed
**Estimated Time**: 8 hours
**Priority**: 🔴 Critical

**Description**:
Buat MDX editor component untuk instructor menulis content:

- ✅ Split view (editor + preview)
- ✅ Syntax highlighting (@mdxeditor/editor)
- ✅ Toolbar dengan shortcuts (bold, italic, code, heading)
- ✅ Auto-save draft functionality
- ✅ Template snippets
- ✅ Image upload to Firebase Storage
- ✅ Full-screen editing capability

---

### 4. Certificate Generation System ✅

**Status**: ✅ Completed
**Estimated Time**: 4 hours
**Priority**: 🔴 Critical

**Description**:
Generate PDF certificates untuk completed courses:

- ✅ Certificate model dengan unique certificate_id
- ✅ PDF generation dengan dynamic data (name, course, date)
- ✅ Certificate verification API
- ✅ Download certificate functionality
- ✅ Certificate list untuk users

**Files Created**:

```
tempaskill-be/internal/certificate/
├── model.go                  # Certificate model ✅
├── dto.go                    # Certificate DTOs ✅
├── repository.go             # Certificate queries ✅
├── service.go                # Certificate business logic ✅
├── handler.go                # Certificate endpoints ✅
├── pdf.go                    # PDF generation ✅
└── routes.go                 # Route registration ✅

tempaskill-fe/src/hooks/
└── use-certificate.ts        # Certificate hooks ✅
```

**Backend APIs**:

- ✅ POST /api/v1/certificates/generate - Generate certificate
- ✅ GET /api/v1/certificates/:id - Get certificate detail
- ✅ GET /api/v1/certificates/:id/download - Download PDF
- ✅ GET /api/v1/certificates/verify/:code - Verify certificate

**Features Implemented**:

- ✅ Automatic certificate generation on course completion
- ✅ PDF generation with course and user details
- ✅ Unique certificate ID for verification
- ✅ Certificate download endpoint
- ✅ Public certificate verification

---

### 5. Instructor Earnings & Withdrawal System ✅

**Status**: ✅ Completed (Backend)
**Estimated Time**: 12 hours
**Priority**: 🔴 Critical

**Description**:
Sistem lengkap untuk instructor earnings dan withdrawal:

- ✅ Track instructor earnings dari setiap payment
- ✅ Platform fee calculation (revenue sharing)
- ✅ Withdrawal request system
- ✅ Bank account management & verification
- ✅ Admin approval workflow
- ✅ Earnings available date (hold period)

**Backend Files Created**:

```
tempaskill-be/internal/withdrawal/
├── model.go                  # InstructorEarning, WithdrawalRequest, BankAccount ✅
├── dto.go                    # Withdrawal DTOs ✅
├── repository.go             # Withdrawal queries ✅
├── service.go                # Withdrawal business logic ✅
├── handler.go                # Withdrawal endpoints ✅
└── routes.go                 # Route registration ✅
```

**Database Tables**:

- ✅ instructor_earnings - Track earnings per transaction
- ✅ withdrawal_requests - Withdrawal request management
- ✅ instructor_bank_accounts - Bank account verification

**Backend APIs**:

- ✅ GET /api/v1/instructor/earnings - Get instructor earnings
- ✅ GET /api/v1/instructor/earnings/available - Available balance
- ✅ POST /api/v1/instructor/bank-accounts - Add bank account
- ✅ GET /api/v1/instructor/bank-accounts - List bank accounts
- ✅ POST /api/v1/instructor/withdrawals - Request withdrawal
- ✅ GET /api/v1/instructor/withdrawals - List withdrawals
- ✅ POST /api/v1/admin/withdrawals/:id/approve - Approve withdrawal
- ✅ POST /api/v1/admin/withdrawals/:id/reject - Reject withdrawal

**Frontend Integration**:

- ✅ use-withdrawal.ts hook created
- ⏸️ Instructor earnings dashboard UI
- ⏸️ Withdrawal request form UI
- ⏸️ Bank account management UI
- ⏸️ Admin withdrawal approval UI

**Business Logic**:

- Platform takes 30% fee, instructor gets 70%
- 14-day hold period before earnings available
- Admin verification of bank accounts
- Multi-step withdrawal approval process

---

### 6. Activity Logging System ✅

**Status**: ✅ Completed (Backend)
**Estimated Time**: 6 hours
**Priority**: 🟡 Medium

**Description**:
Comprehensive activity logging untuk audit dan monitoring:

- ✅ Log all critical user actions
- ✅ Track admin operations
- ✅ Monitor course/lesson changes
- ✅ Payment transaction tracking
- ✅ Security audit trail

**Backend Files Created**:

```
tempaskill-be/internal/activity/
├── model.go                  # ActivityLog model ✅
├── repository.go             # Activity queries ✅
├── service.go                # Activity logging ✅
├── handler.go                # Activity endpoints ✅
└── routes.go                 # Route registration ✅
```

**Database Migration**:

```
migrations/012_create_activity_logs.sql ✅
```

**Backend APIs**:

- ✅ GET /api/v1/admin/activities - List all activities
- ✅ GET /api/v1/admin/activities/user/:id - User-specific activities
- ✅ POST /api/v1/activities - Log activity (internal)

**Activity Types Logged**:

- User registration, login, logout
- Course creation, update, deletion
- Lesson creation, update, deletion
- Enrollment, unenrollment
- Payment transactions
- Certificate generation
- Withdrawal requests
- Admin actions (role changes, approvals)

**Frontend Integration**:

- ✅ use-activities.ts hook created
- ⏸️ Activity log viewer UI (admin)
- ⏸️ User activity timeline
- ⏸️ Audit trail export

---

### 7. Instructor Management System ✅

**Status**: ✅ Completed (Backend)
**Estimated Time**: 8 hours
**Priority**: 🟡 Medium

**Description**:
Sistem untuk instructor profile dan course statistics:

- ✅ Instructor profile management
- ✅ Course statistics per instructor
- ✅ Earnings summary
- ✅ Student count tracking
- ✅ Instructor filtering and search

**Backend Files Created**:

```
tempaskill-be/internal/instructor/
├── dto.go                    # Instructor DTOs ✅
├── repository.go             # Instructor queries ✅
├── service.go                # Instructor business logic ✅
├── handler.go                # Instructor endpoints ✅
└── routes.go                 # Route registration ✅
```

**Backend APIs**:

- ✅ GET /api/v1/instructors - List instructors (with filters)
- ✅ GET /api/v1/instructors/:id - Get instructor detail
- ✅ GET /api/v1/instructors/:id/courses - Instructor courses
- ✅ GET /api/v1/instructors/:id/stats - Instructor statistics

**Features Implemented**:

- Search by name
- Filter by specialty
- Order by students, courses, rating
- Pagination support
- Course count and student count aggregation
- Average rating calculation

**Frontend Integration**:

- ✅ use-instructor.ts hook created
- ⏸️ Instructor directory page
- ⏸️ Instructor profile page
- ⏸️ Instructor dashboard (for instructors)

---

## 🟡 Medium Priority (Post-MVP)

### 4. Custom MDX Components - CodePlayground

**Status**: ⏸️ Not Started  
**Estimated Time**: 4 hours  
**Priority**: 🟡 Medium

**Description**:
Interactive code playground component untuk lesson content:

- Multi-language support (JS, TS, Python, Go)
- Live code execution (sandboxed)
- Syntax highlighting
- Copy code button
- Reset to default

**Files to Create**:

```
tempaskill-fe/src/components/mdx/
├── code-playground.tsx       # Main component
└── code-runner.ts            # Code execution logic
```

**Example Usage in MDX**:

```markdown
<CodePlayground language="javascript" defaultCode={`console.log("Hello, World!");`}>
</CodePlayground>
```

**Dependencies**: MDX Rendering System ✅
**Blocks**: None

---

### 5. Custom MDX Components - Quiz

**Status**: ⏸️ Not Started  
**Estimated Time**: 3 hours  
**Priority**: 🟡 Medium

**Description**:
Quiz component untuk inline assessments:

- Multiple choice questions
- Show correct answer
- Track score
- Explanation for answers

**Files to Create**:

```
tempaskill-fe/src/components/mdx/
└── quiz.tsx
```

**Example Usage**:

```tsx
<Quiz
  question="What is React?"
  options={["A JavaScript library", "A programming language", "A database"]}
  correctAnswer={0}
  explanation="React is a JavaScript library for building user interfaces."
/>
```

**Dependencies**: MDX Rendering System ✅
**Blocks**: None

---

### 6. Custom MDX Components - Tabs

**Status**: ⏸️ Not Started  
**Estimated Time**: 2 hours  
**Priority**: 🟡 Medium

**Description**:
Tabs component untuk multi-language code examples:

- Switch between languages
- Syntax highlighting per tab
- Responsive design

**Files to Create**:

```
tempaskill-fe/src/components/mdx/
└── tabs.tsx
```

**Example Usage**:

````tsx
<Tabs>
  <Tab label="JavaScript">```javascript const greeting = "Hello"; ```</Tab>
  <Tab label="TypeScript">
    ```typescript const greeting: string = "Hello"; ```
  </Tab>
</Tabs>
````

**Dependencies**: MDX Rendering System ✅
**Blocks**: None

---

### 7. Custom MDX Components - Callout

**Status**: ⏸️ Not Started  
**Estimated Time**: 1 hour  
**Priority**: 🟡 Medium

**Description**:
Callout component untuk alerts/notes dengan styling:

- Types: info, warning, error, success, tip
- Icons per type
- Styled borders (orange untuk tip)

**Files to Create**:

```
tempaskill-fe/src/components/mdx/
└── callout.tsx
```

**Example Usage**:

```tsx
<Callout type="tip">
  **Pro Tip**: Always validate user input!
</Callout>

<Callout type="warning">
  This feature is experimental.
</Callout>
```

**Dependencies**: MDX Rendering System ✅
**Blocks**: None

---

### 8. Payment Integration - Midtrans

**Status**: ✅ Completed  
**Estimated Time**: 11 hours  
**Priority**: 🟡 Medium

**Description**:
Integrate Midtrans payment gateway untuk paid courses:

- Backend: payment handler, webhook verification
- Frontend: checkout page, payment status

**Backend Files**:

```
tempaskill-be/internal/payment/
├── model.go                  # Transaction model ✅
├── dto.go                    # Payment DTOs ✅
├── repository.go             # Transaction queries ✅
├── service.go                # Midtrans integration ✅
├── handler.go                # Payment endpoints ✅
└── routes.go                 # Route registration ✅
```

**Database Migration**:

```
migrations/009_create_payment_transactions_table.sql ✅
```

**Configuration**:

- Added Midtrans config to config.go ✅
- Updated main.go for payment module registration ✅

**Frontend Files**:

```
tempaskill-fe/src/app/checkout/[courseId]/
└── page.tsx                  # Checkout page

tempaskill-fe/src/hooks/
└── use-payment.ts            # Payment hooks
```

**Environment Variables**:

```
MIDTRANS_SERVER_KEY=your-midtrans-server-key
MIDTRANS_CLIENT_KEY=your-midtrans-client-key
MIDTRANS_IS_PRODUCTION=false
MIDTRANS_BASE_URL=https://api.sandbox.midtrans.com
```

**⚠️ IMPORTANT**:

- Get your Midtrans keys from [Midtrans Dashboard](https://dashboard.midtrans.com/)
- Use Sandbox keys for development
- NEVER commit actual API keys to git!

**Dependencies**: None
**Blocks**: Transaction History

---

### 9. Certificate Generation

**Status**: ⏸️ Not Started  
**Estimated Time**: 4 hours  
**Priority**: 🟡 Medium

**Description**:
Generate PDF certificates untuk completed courses:

- Dynamic data (name, course, date)
- Download PDF
- Verify certificate by code

**Backend Files**:

```
tempaskill-be/internal/certificate/
├── model.go                  # Certificate model
├── service.go                # PDF generation
├── handler.go                # Download endpoint
└── routes.go
```

**Frontend Files**:

```
tempaskill-fe/src/app/certificates/
├── page.tsx                  # Certificate list
└── [id]/page.tsx            # Certificate view
```

**NPM Packages**:

```bash
# Backend
go get github.com/jung-kurt/gofpdf
```

**Dependencies**: Course completion tracking ✅
**Blocks**: None

---

### 10. Live Session Scheduling

**Status**: ✅ Completed
**Estimated Time**: 6 hours
**Priority**: 🟡 Medium

**Description**:
Schedule bi-weekly live sessions untuk Q&A:

- ✅ Backend: session CRUD, participant management, attendance tracking
- ✅ Frontend: admin session management, calendar view, join session link

**Backend Files** (Created):

```
tempaskill-be/internal/session/
├── model.go                  # Session model ✅
├── dto.go                    # Request/Response DTOs ✅
├── repository.go             # Database operations ✅
├── service.go                # Business logic ✅
├── handler.go                # HTTP handlers ✅
└── routes.go                 # Route registration ✅
```

**Frontend Files** (Created):

```
tempaskill-fe/src/app/admin/sessions/
├── page.tsx                  # Session management ✅
└── new/page.tsx              # Create session form ✅

tempaskill-fe/src/app/sessions/
└── page.tsx                  # Sessions calendar ✅

tempaskill-fe/src/hooks/
└── use-sessions.ts           # Session API hooks ✅
```

**Database**:

- ✅ sessions table with all required fields
- ✅ session_participants table for enrollment tracking
- ✅ Proper foreign key constraints and indexes

**Features Implemented**:

- ✅ Session CRUD operations
- ✅ Participant registration/unregistration
- ✅ Attendance marking
- ✅ Admin session management UI
- ✅ Real-time session status (upcoming, live, completed, cancelled)

**Dependencies**: None
**Blocks**: None

---

### 11. Discussion Forum per Course

**Status**: ⏸️ Not Started  
**Estimated Time**: 8 hours  
**Priority**: 🟡 Medium

**Description**:
Forum diskusi untuk setiap course:

- Create thread, reply
- Upvote/downvote
- Mark as solved
- Filter by topic

**Backend Files**:

```
tempaskill-be/internal/discussion/
├── model.go                  # Thread, Reply models
├── dto.go
├── repository.go
├── service.go
├── handler.go
└── routes.go
```

**Frontend Files**:

```
tempaskill-fe/src/app/courses/[slug]/discussions/
├── page.tsx                  # Thread list
└── [threadId]/page.tsx      # Thread detail

tempaskill-fe/src/components/discussion/
├── thread-card.tsx
├── reply-form.tsx
└── vote-buttons.tsx
```

**Dependencies**: None
**Blocks**: None

---

### 12. User Profile & Settings

**Status**: ✅ Completed
**Estimated Time**: 5 hours
**Priority**: 🟡 Medium

**Description**:
Halaman user profile lengkap:

- ✅ Edit profile (name, bio)
- ✅ Change password
- ✅ Upload avatar
- ✅ Notification preferences

**Frontend Files** (Created):

```
tempaskill-fe/src/app/profile/
└── page.tsx                  # Profile view & edit ✅

tempaskill-fe/src/components/profile/
├── avatar-upload.tsx         # Avatar upload component ✅
└── settings-form.tsx         # Settings form ✅
```

**Backend Endpoints** (Already exists):

- ✅ GET /api/v1/users/me
- ✅ PATCH /api/v1/users/me
- ✅ PATCH /api/v1/users/me/password

**Features Implemented**:

- ✅ Profile information display
- ✅ Profile editing with form validation
- ✅ Password change functionality
- ✅ Avatar upload (if implemented)
- ✅ Responsive design with proper UI

**Dependencies**: None
**Blocks**: None

---

### 13. Course Reviews & Ratings

**Status**: ✅ Completed  
**Estimated Time**: 4 hours  
**Priority**: 🟡 Medium

**Description**:
Sistem review dan rating course:

- ✅ Submit review (rating 1-5 + text)
- ✅ Display reviews on course page
- ✅ Rating aggregation
- ✅ Filter reviews

**Backend Files**:

```
tempaskill-be/internal/review/
├── model.go                  # Review model ✅
├── dto.go                    # Request/Response DTOs ✅
├── repository.go             # Database operations ✅
├── service.go                # Business logic ✅
├── handler.go                # HTTP handlers ✅
└── routes.go                 # Route registration ✅
```

**Frontend Files**:

```
tempaskill-fe/src/components/review/
├── star-rating.tsx           # Star rating component ✅
├── review-card.tsx           # Individual review display ✅
├── review-form.tsx           # Review submission form ✅
├── review-list.tsx           # Paginated review list ✅
└── index.ts                  # Component exports ✅

tempaskill-fe/src/hooks/
└── use-reviews.ts            # Review API hooks ✅
```

**Database Migration**:

```
migrations/010_create_course_reviews_table.sql ✅
```

**Features Implemented**:

- ✅ Course review submission with rating (1-5 stars)
- ✅ Review display on course detail pages
- ✅ Rating aggregation and summary statistics
- ✅ Review filtering and pagination
- ✅ Verified purchase badges
- ✅ Indonesian UI text throughout
- ✅ Orange brand color consistency
- ✅ React Query integration for state management
- ✅ Form validation with Zod
- ✅ Responsive design

**Dependencies**: Enrollment system ✅
**Blocks**: None

---

### 14. Search & Filter Improvements

**Status**: ⏸️ Not Started  
**Estimated Time**: 4 hours  
**Priority**: 🟡 Medium

**Description**:
Advanced search dan filtering:

- Filter by category, difficulty, price, instructor
- Sort by popularity, newest, rating
- Search suggestions
- URL params untuk state persistence

**Frontend Files**:

```
tempaskill-fe/src/components/course/
├── search-bar.tsx           # Enhanced search
├── filter-sidebar.tsx       # Advanced filters
└── sort-dropdown.tsx        # Sort options
```

**Backend**:

- Optimize existing `/api/v1/courses` endpoint
- Add sort parameters

**Dependencies**: None
**Blocks**: None

---

### 15. Email Notifications

**Status**: ⏸️ Not Started  
**Estimated Time**: 5 hours  
**Priority**: 🟡 Medium

**Description**:
Email notification system:

- Events: enrollment, course completion, new lesson
- SMTP configuration
- Email templates (HTML)

**Backend Files**:

```
tempaskill-be/pkg/email/
├── client.go                 # SMTP client
├── templates.go              # Email templates
└── sender.go                 # Send methods
```

**Environment Variables**:

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@email.com
SMTP_PASSWORD=app_password
```

**Dependencies**: None
**Blocks**: None

---

## 🟢 Low Priority (Nice to Have)

### 16. Content Migration Script

**Status**: ⏸️ Not Started  
**Estimated Time**: 6 hours  
**Priority**: 🟢 Low

**Description**:
Bulk migrate existing HTML lessons to MDX:

- HTML to Markdown conversion
- Syntax validation
- Batch update database
- Progress tracking

**Files to Create**:

```
tempaskill-be/scripts/
└── migrate-to-mdx.go        # Migration script

tempaskill-be/pkg/converter/
└── html-to-mdx.go           # Conversion logic
```

**Usage**:

```bash
cd tempaskill-be
go run scripts/migrate-to-mdx.go
```

**Dependencies**: MDX System ✅
**Blocks**: None

---

### 17. E2E Tests - Core User Flows

**Status**: ⏸️ Not Started  
**Estimated Time**: 4 hours  
**Priority**: 🟢 Low

**Description**:
Playwright tests untuk user flows:

- Register → Login
- Browse courses → Enroll
- Complete lessons → Track progress
- Download certificate

**Files to Create**:

```
tempaskill-fe/tests/e2e/
├── user-flows.spec.ts       # User journey tests
└── fixtures/user-data.ts    # Test data
```

**Dependencies**: Certificate Generation
**Blocks**: None

---

### 18. E2E Tests - Admin Flows

**Status**: ⏸️ Not Started  
**Estimated Time**: 4 hours  
**Priority**: 🟢 Low

**Description**:
Playwright tests untuk admin flows:

- Create course
- Add lessons with MDX
- Publish course
- View analytics

**Files to Create**:

```
tempaskill-fe/tests/e2e/
└── admin-flows.spec.ts
```

**Dependencies**: Admin Panel, MDX Editor
**Blocks**: None

---

### 19. Performance Optimization - Image CDN

**Status**: ⏸️ Not Started  
**Estimated Time**: 6 hours  
**Priority**: 🟢 Low

**Description**:
Setup CDN untuk images:

- Cloudinary or AWS S3 integration
- Lazy loading images
- Responsive images (Next.js Image)
- Compression optimization

**Files to Update**:

```
tempaskill-fe/src/lib/
└── image-upload.ts          # Upload to CDN

tempaskill-be/internal/course/
└── handler.go               # Update image URLs
```

**Environment Variables**:

```
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

**Dependencies**: Admin Panel
**Blocks**: None

---

### 20. Analytics Dashboard

**Status**: ⏸️ Not Started  
**Estimated Time**: 8 hours  
**Priority**: 🟢 Low

**Description**:
Dashboard untuk instructor/admin:

- Enrollment statistics
- Completion rates
- Popular courses
- Revenue tracking (if payment implemented)

**Backend Files**:

```
tempaskill-be/internal/analytics/
├── service.go               # Analytics calculations
├── handler.go               # Analytics endpoints
└── routes.go
```

**Frontend Files**:

```
tempaskill-fe/src/app/admin/analytics/
└── page.tsx                 # Dashboard with charts

tempaskill-fe/src/components/analytics/
├── enrollment-chart.tsx
├── completion-chart.tsx
└── revenue-chart.tsx
```

**NPM Packages**:

```bash
yarn add recharts  # Chart library
```

**Dependencies**: Admin Panel
**Blocks**: None

---

## 📅 Recommended Implementation Order

Based on dependencies and business value:

### Sprint 1 (Week 1-2): Admin Foundation

1. ✅ Admin Panel - Course Management
2. ✅ Admin Panel - Lesson Management
3. ✅ MDX Editor dengan Live Preview

### Sprint 2 (Week 3-4): Custom Components

4. ✅ Custom MDX Components - Callout
5. ✅ Custom MDX Components - Tabs
6. ✅ Custom MDX Components - Quiz
7. ✅ Custom MDX Components - CodePlayground

### Sprint 3 (Week 5-6): User Features

8. ✅ User Profile & Settings
9. ✅ Search & Filter Improvements
10. ✅ Course Reviews & Ratings

### Sprint 4 (Week 7-8): Monetization

11. ✅ Payment Integration - Midtrans
12. ✅ Certificate Generation
13. ✅ Email Notifications

### Sprint 5 (Week 9-10): Community

14. ✅ Discussion Forum per Course
15. ✅ Live Session Scheduling

### Sprint 6 (Week 11-12): Quality & Performance

16. ✅ Content Migration Script
17. ✅ E2E Tests - Core User Flows
18. ✅ E2E Tests - Admin Flows
19. ✅ Performance Optimization - Image CDN
20. ✅ Analytics Dashboard

---

## 📊 Admin Dashboard Enhancements (Future)

### 21. Dashboard - Charts & Graphs

**Status**: ⏸️ Not Started  
**Estimated Time**: 6 hours  
**Priority**: 🟢 Low

**Description**:
Tambahkan visualisasi data pada admin dashboard:

- Revenue trend chart (monthly/weekly)
- Enrollment growth chart
- Course popularity chart
- Active users chart

**Files to Create/Update**:

```
tempaskill-fe/src/app/admin/dashboard/page.tsx
tempaskill-fe/src/components/admin/
├── revenue-chart.tsx         # Line chart for revenue
├── enrollment-chart.tsx      # Bar chart for enrollments
└── stats-overview.tsx        # Enhanced stats grid
```

**NPM Packages**:

```bash
yarn add recharts @tremor/react
```

**Dependencies**: Admin Stats Endpoint ✅
**Blocks**: None

---

### 22. Dashboard - Recent Activity

**Status**: ⏸️ Not Started  
**Estimated Time**: 4 hours  
**Priority**: 🟢 Low

**Description**:
Tampilkan aktivitas terbaru di dashboard:

- 10 transaksi pembayaran terbaru
- 10 enrollment terbaru
- Recent course updates
- Recent user registrations

**Files to Create**:

```
tempaskill-fe/src/components/admin/
├── recent-transactions.tsx   # Latest payments
├── recent-enrollments.tsx    # Latest enrollments
└── activity-feed.tsx         # Combined activity
```

**Backend Endpoints** (New):

```
GET /api/v1/admin/activity/payments?limit=10
GET /api/v1/admin/activity/enrollments?limit=10
```

**Dependencies**: Admin Stats Endpoint ✅
**Blocks**: None

---

### 23. Dashboard - Quick Actions

**Status**: ⏸️ Not Started  
**Estimated Time**: 3 hours  
**Priority**: 🟢 Low

**Description**:
Shortcuts ke tugas admin yang pending:

- View unpublished courses (with count badge)
- View pending payment approvals
- Manage upcoming sessions
- Review flagged content

**Files to Update**:

```
tempaskill-fe/src/app/admin/dashboard/page.tsx
```

**Components**:

```
tempaskill-fe/src/components/admin/
└── quick-actions.tsx        # Action cards with badges
```

**Dependencies**: Admin Stats Endpoint ✅
**Blocks**: None

---

### 24. Dashboard - Export Reports

**Status**: ⏸️ Not Started  
**Estimated Time**: 5 hours  
**Priority**: 🟢 Low

**Description**:
Export dashboard statistics ke berbagai format:

- CSV export untuk spreadsheet
- PDF export untuk reporting
- Date range filter
- Custom metric selection

**Files to Create**:

```
tempaskill-fe/src/lib/
├── export-csv.ts            # CSV generation
└── export-pdf.ts            # PDF generation

tempaskill-fe/src/components/admin/
└── export-button.tsx        # Export dropdown
```

**NPM Packages**:

```bash
yarn add papaparse jspdf
```

**Dependencies**: Admin Stats Endpoint ✅
**Blocks**: None

---

### 25. Dashboard - Real-time Updates (Advanced)

**Status**: ⏸️ Not Started  
**Estimated Time**: 12 hours  
**Priority**: 🟢 Low (Advanced)

**Description**:
Real-time dashboard updates menggunakan WebSocket:

- Live payment notifications
- Live enrollment updates
- Auto-refresh stats
- Live user count

**Backend Files**:

```
tempaskill-be/internal/websocket/
├── hub.go                   # WebSocket hub
├── client.go                # Client connection
├── handler.go               # WS endpoints
└── routes.go
```

**Frontend Files**:

```
tempaskill-fe/src/lib/
└── websocket-client.ts      # WS client

tempaskill-fe/src/hooks/
└── use-websocket.ts         # WS hook
```

**NPM Packages**:

```bash
yarn add socket.io-client
go get github.com/gorilla/websocket
```

**Dependencies**: Admin Stats Endpoint ✅
**Blocks**: None

---

## 🎯 Next Actions

**Immediate Priority** (Start this week):

1. [ ] **Custom MDX Components** - Callout, Tabs, Quiz (6 hours)
2. [ ] **Discussion Forum per Course** - Community interaction (8 hours)

**Medium Priority** (Next 2 weeks):

3. [ ] **Certificate Generation** - Course completion certificates (4 hours)
4. [ ] **Email Notifications** - Automated email system (6 hours)
5. [ ] **Search & Filter Improvements** - Advanced filtering (4 hours)

**Future Enhancements** (Post-MVP):

6. [ ] **Analytics Dashboard** - Instructor/admin analytics (8 hours)
7. [ ] **Content Migration Script** - Import existing content (4 hours)
8. [ ] **E2E Tests** - Automated testing suite (6 hours)
9. [ ] **Performance Optimization** - CDN and caching (4 hours)

**Admin Dashboard Enhancements** (Optional):

10. [ ] **Dashboard - Charts & Graphs** - Revenue trends, enrollment growth (6 hours)
11. [ ] **Dashboard - Recent Activity** - Latest transactions and enrollments (4 hours)
12. [ ] **Dashboard - Quick Actions** - Shortcuts to pending tasks (3 hours)
13. [ ] **Dashboard - Export Reports** - CSV/PDF export functionality (5 hours)
14. [ ] **Dashboard - Real-time Updates** - WebSocket live updates (12 hours - Advanced)

---

## 🚀 Business Flow Improvements & Future Enhancements

### 26. Multi-Language Support (Internationalization)

**Status**: ⏸️ Not Started  
**Estimated Time**: 15 hours  
**Priority**: 🟢 Low (Future)

**Description**:
Support multiple languages untuk expand market:

- Indonesian (default)
- English
- Other regional languages (Malay, Tagalog, etc.)

**Implementation**:

```
Frontend:
- Install next-intl or react-i18next
- Create translation files (id.json, en.json)
- Language switcher component
- Persist language preference

Backend:
- Localized course content (title, description)
- Multi-language support in database
```

**Benefits**:

- Expand to international market
- Better accessibility
- Competitive advantage

---

### 27. Course Bundle & Subscription

**Status**: ⏸️ Not Started  
**Estimated Time**: 12 hours  
**Priority**: 🟢 Low (Future)

**Description**:
Alternative pricing models untuk increase revenue:

- Course bundles (multiple courses at discount)
- Monthly subscription (unlimited access)
- Corporate plans (team licenses)

**Implementation**:

```
Backend:
- Bundle model (multiple courses)
- Subscription model (recurring payment)
- Corporate account management
- Midtrans recurring payment integration

Frontend:
- Bundle selection UI
- Subscription pricing page
- Corporate signup flow
```

**Benefits**:

- Higher revenue per user
- Better user retention
- Appeal to enterprise customers

---

### 28. Gamification & Achievements

**Status**: ⏸️ Not Started  
**Estimated Time**: 10 hours  
**Priority**: 🟢 Low (Future)

**Description**:
Increase engagement melalui gamification:

- Achievement badges (complete 5 courses, etc.)
- Leaderboard (top learners)
- Streak tracking (consecutive days learning)
- Points system

**Implementation**:

```
Backend:
- Achievement model
- Progress tracking enhancement
- Leaderboard queries
- Badge unlocking logic

Frontend:
- Badge showcase
- Leaderboard component
- Streak counter
- Achievement notifications
```

**Benefits**:

- Increase user engagement
- Better course completion rates
- Social proof and competition

---

### 29. AI-Powered Course Recommendations

**Status**: ⏸️ Not Started  
**Estimated Time**: 20 hours  
**Priority**: 🟢 Low (Advanced)

**Description**:
Personalized course recommendations menggunakan AI:

- Based on completed courses
- Based on user interests
- Skill gap analysis
- Learning path suggestions

**Implementation**:

```
Backend:
- Recommendation engine (collaborative filtering)
- OpenAI API integration for analysis
- User preference tracking
- Course similarity calculation

Frontend:
- "Recommended for You" section
- Learning path visualization
- Skill gap display
```

**Benefits**:

- Better course discovery
- Personalized learning experience
- Increase course enrollment

---

### 30. Video Content Support (Optional)

**Status**: ⏸️ Not Started  
**Estimated Time**: 16 hours  
**Priority**: 🟢 Low (Optional)

**Description**:
Optional video support untuk instructors yang ingin upload video:

- Video upload to cloud storage (AWS S3 / Cloudinary)
- Video streaming player
- Subtitle support
- Video progress tracking

**Implementation**:

```
Backend:
- Video upload endpoint
- Video metadata storage
- HLS streaming support
- Progress tracking per video

Frontend:
- Video player component (react-player)
- Subtitle display
- Playback speed control
- Video progress tracking
```

**Note**: Tetap fokus text-based, video is OPTIONAL

**Benefits**:

- Flexibility for instructors
- Compete with video-heavy platforms
- Premium course option

---

### 31. Mobile App (React Native)

**Status**: ⏸️ Not Started  
**Estimated Time**: 80+ hours  
**Priority**: 🟢 Low (Future)

**Description**:
Native mobile app untuk iOS dan Android:

- React Native app
- Offline content support
- Push notifications
- Mobile-optimized UX

**Implementation**:

```
Tech Stack:
- React Native + Expo
- React Query for state management
- AsyncStorage for offline data
- Firebase Cloud Messaging for push

Features:
- Course browsing and enrollment
- Offline lesson reading
- Progress syncing
- Payment integration
- Certificate download
```

**Benefits**:

- Better mobile experience
- Offline learning capability
- Push notifications for engagement
- App store presence

---

### 32. Live Coding Rooms (Advanced)

**Status**: ⏸️ Not Started  
**Estimated Time**: 30+ hours  
**Priority**: 🟢 Low (Advanced)

**Description**:
Real-time collaborative coding untuk live sessions:

- Code editor with real-time sync
- Multiple participants
- Syntax highlighting
- Code execution

**Implementation**:

```
Tech Stack:
- WebSocket (Socket.io)
- Monaco Editor (VS Code editor)
- Yjs for CRDT (conflict-free replication)
- Docker containers for code execution

Features:
- Real-time code collaboration
- Live cursor tracking
- Chat integration
- Code review tools
```

**Benefits**:

- Enhanced live session experience
- Collaborative learning
- Unique platform feature
- Premium offering

---

### 33. Content Marketplace

**Status**: ⏸️ Not Started  
**Estimated Time**: 25+ hours  
**Priority**: 🟢 Low (Future)

**Description**:
Allow anyone to become instructor dan sell courses:

- Public instructor registration
- Course submission and approval
- Revenue sharing system
- Quality control and moderation

**Implementation**:

```
Backend:
- Instructor application workflow
- Course approval system
- Automated payout system
- Quality metrics tracking

Frontend:
- "Become Instructor" page
- Course submission wizard
- Instructor dashboard (earnings, students)
- Course review and rating system
```

**Benefits**:

- Scale content creation
- Passive income for platform
- Diverse course catalog
- Community-driven growth

---

### 34. Integration with Learning Management Systems (LMS)

**Status**: ⏸️ Not Started  
**Estimated Time**: 20 hours  
**Priority**: 🟢 Low (Enterprise)

**Description**:
Integrate dengan corporate LMS (SCORM, LTI):

- SCORM package export
- LTI integration for Canvas, Moodle
- SSO support (SAML, OAuth)
- Grade passback

**Implementation**:

```
Backend:
- SCORM package generator
- LTI provider implementation
- SSO authentication
- Grade reporting API

Features:
- Export course as SCORM
- Embed in corporate LMS
- Single Sign-On support
- Automatic grade sync
```

**Benefits**:

- Enterprise market access
- B2B revenue stream
- Scalable to organizations
- Competitive differentiation

---

**Last Updated**: December 2, 2025  
**Total Estimated Time**: ~320+ hours (including all enhancements)  
**Core Tasks**: 34 tasks  
**Completed**: 13 core tasks (38%)  
**High Priority Remaining**: 0 tasks (MVP COMPLETE!)  
**Medium Priority**: 8 tasks  
**Low Priority**: 13 tasks

---

💡 **Tip**: Fokus pada High & Medium priority dulu. Low priority adalah future enhancements untuk scale platform.

🎯 **MVP Status**: ✅ **COMPLETE!** Ready untuk soft launch.

📈 **Next Focus**: Medium priority tasks untuk improve UX dan business flows.
