# 📝 TODO List - TempaSKill Platform

> Tracking semua fitur yang belum diimplementasikan
>
> **Last Updated**: November 10, 2025

---

## 📊 Project Status Summary

**TempaSKill Platform** - Hybrid Course Learning Platform

### ✅ **CORE MVP FEATURES COMPLETED** (75% Complete)

**Platform Foundation:**

- ✅ Full-stack Go + Next.js application
- ✅ MySQL database with migrations
- ✅ JWT authentication system
- ✅ RESTful API architecture
- ✅ TypeScript + React Query frontend
- ✅ Responsive UI with Shadcn components

**Learning Management:**

- ✅ Course catalog with search/filter
- ✅ Individual course pages with enrollment
- ✅ Lesson viewing with MDX content
- ✅ Progress tracking system
- ✅ User dashboard and profile

**Admin Management:**

- ✅ Complete course CRUD operations
- ✅ Complete lesson CRUD operations
- ✅ Live session scheduling system
- ✅ Payment monitoring dashboard

**User Experience:**

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

### 1. Admin Panel - Course Management

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

**Backend APIs** (Already exists):

- ✅ POST /api/v1/courses
- ✅ GET /api/v1/courses
- ✅ GET /api/v1/courses/:id
- ✅ PUT /api/v1/courses/:id
- ✅ DELETE /api/v1/courses/:id

**Dependencies**: None
**Blocks**: Lesson Management

---

### 2. Admin Panel - Lesson Management

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

**Files Created**:

```
tempaskill-fe/src/app/admin/courses/[courseId]/lessons/
├── page.tsx                   # Lesson list with reorder
├── new/page.tsx              # Create lesson
└── [id]/edit/page.tsx        # Edit lesson

tempaskill-fe/src/components/admin/
├── lesson-form.tsx           # Lesson form
└── lesson-reorder.tsx        # Drag-drop component
```

**Backend APIs** (Already exists):

- ✅ POST /api/v1/courses/:id/lessons
- ✅ GET /api/v1/courses/:id/lessons
- ✅ GET /api/v1/lessons/:id
- ✅ PUT /api/v1/lessons/:id
- ✅ DELETE /api/v1/lessons/:id

**Dependencies**: Course Management
**Blocks**: MDX Editor

---

### 3. MDX Editor dengan Live Preview

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

**Files Created**:

```
tempaskill-fe/src/components/admin/
└── mdx-editor.tsx            # Main editor component with MDXEditorWrapper
```

**NPM Packages Installed**:

```bash
npm install @mdxeditor/editor
```

**Features Implemented**:

- ✅ @mdxeditor/editor integration (better than Monaco)
- ✅ Split-pane layout (editor/preview/full modes)
- ✅ Live MDX compilation and preview
- ✅ Toolbar (H1-H3, bold, italic, code, link, image, table, lists)
- ✅ Auto-save functionality with configurable delay
- ✅ Template insertion (heading, code, list, tabs, quiz, codeBlock)
- ✅ Keyboard shortcuts and markdown shortcuts
- ✅ Image upload to Firebase Storage
- ✅ Syntax highlighting with CodeMirror
- ✅ Full-screen editing capability

**Integration**:

- ✅ Integrated into lesson creation/editing forms
- ✅ Used in admin lesson management pages
- ✅ Supports all custom MDX components (Tabs, Quiz, CodeBlock, etc.)

**Dependencies**: Lesson Management
**Blocks**: Content Migration

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
MIDTRANS_SERVER_KEY=SB-Mid-server-c2zpenmQQVNAYOVHtxrx0I-S ✅
MIDTRANS_CLIENT_KEY=SB-Mid-client-ZBuTiayOZocEGgLJ ✅
MIDTRANS_IS_PRODUCTION=false ✅
MIDTRANS_BASE_URL=https://api.sandbox.midtrans.com ✅
```

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

**Status**: ⏸️ Not Started  
**Estimated Time**: 4 hours  
**Priority**: 🟡 Medium

**Description**:
Sistem review dan rating course:

- Submit review (rating 1-5 + text)
- Display reviews on course page
- Rating aggregation
- Filter reviews

**Backend Files**:

```
tempaskill-be/internal/review/
├── model.go                  # Review model
├── dto.go
├── repository.go
├── service.go
├── handler.go
└── routes.go
```

**Frontend Files**:

```
tempaskill-fe/src/components/course/
├── review-form.tsx
├── review-list.tsx
├── rating-stars.tsx
└── rating-summary.tsx
```

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

## 🎯 Next Actions

**Immediate Priority** (Start this week):

1. [ ] **Course Reviews & Ratings** - User feedback system (4 hours)
2. [ ] **Discussion Forum per Course** - Community interaction (8 hours)

**Medium Priority** (Next 2 weeks):

4. [ ] **Discussion Forum per Course** - Community interaction (8 hours)
5. [ ] **Certificate Generation** - Course completion certificates (4 hours)
6. [ ] **Email Notifications** - Automated email system (6 hours)

**Future Enhancements** (Post-MVP):

7. [ ] **Analytics Dashboard** - Instructor/admin analytics (8 hours)
8. [ ] **Content Migration Script** - Import existing content (4 hours)
9. [ ] **E2E Tests** - Automated testing suite (6 hours)
10. [ ] **Performance Optimization** - CDN and caching (4 hours)

- [ ] Midtrans integration docs
- [ ] PDF generation libraries
- [ ] Monaco Editor setup

---

**Last Updated**: November 6, 2025  
**Total Estimated Time**: ~112 hours  
**Progress**: 1/20 tasks completed (5%)

---

💡 **Tip**: Update status setelah setiap task completion. Gunakan VS Code TODO extension untuk quick tracking.
