# 📝 TODO List - TempaSKill Platform

> Tracking semua fitur yang belum diimplementasikan
> 
> **Last Updated**: November 3, 2025

---

## 📊 Quick Stats

- **Total Tasks**: 20
- **Not Started**: 20
- **In Progress**: 0
- **Completed**: 0

---

## 🔴 High Priority (MVP Required)

### 1. Admin Panel - Course Management
**Status**: ⏸️ Not Started  
**Estimated Time**: 6 hours  
**Priority**: 🔴 Critical

**Description**:
Buat admin panel untuk CRUD courses dengan fitur:
- Create/edit/delete course
- Upload thumbnail dengan preview
- Set pricing (free/paid)
- Publish/unpublish course
- Course preview mode

**Files to Create**:
```
tempaskill-fe/src/app/admin/courses/
├── page.tsx                    # Course list with table
├── new/page.tsx               # Create course form
└── [id]/edit/page.tsx         # Edit course form

tempaskill-fe/src/components/admin/
├── course-form.tsx            # Reusable form component
└── image-upload.tsx           # Image upload with preview
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
**Status**: ⏸️ Not Started  
**Estimated Time**: 6 hours  
**Priority**: 🔴 Critical

**Description**:
Buat admin panel untuk CRUD lessons dengan fitur:
- Create/edit/delete lesson
- MDX editor dengan preview
- Drag-and-drop reorder lessons
- Set duration dan difficulty
- Lesson preview mode

**Files to Create**:
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
**Status**: ⏸️ Not Started  
**Estimated Time**: 8 hours  
**Priority**: 🔴 Critical

**Description**:
Buat MDX editor component untuk instructor menulis content:
- Split view (editor + preview)
- Syntax highlighting (Monaco Editor)
- Toolbar dengan shortcuts (bold, italic, code, heading)
- Auto-save draft functionality
- Template snippets

**Files to Create**:
```
tempaskill-fe/src/components/admin/
├── mdx-editor.tsx            # Main editor component
├── mdx-toolbar.tsx           # Editor toolbar
├── mdx-preview.tsx           # Live preview pane
└── mdx-templates.ts          # Code snippets/templates
```

**NPM Packages to Install**:
```bash
yarn add @monaco-editor/react
yarn add @uiw/react-md-editor  # Alternative simpler option
```

**Features**:
- [ ] Monaco Editor integration
- [ ] Split-pane layout
- [ ] Live MDX compilation
- [ ] Toolbar (H1-H3, bold, italic, code, link, image)
- [ ] Auto-save to localStorage
- [ ] Template insertion (code block, quiz, callout)
- [ ] Keyboard shortcuts (Ctrl+B, Ctrl+I, etc.)
- [ ] Full-screen mode

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
````markdown
<CodePlayground language="javascript" defaultCode={`
console.log("Hello, World!");
`}>
</CodePlayground>
````

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
  options={[
    "A JavaScript library",
    "A programming language",
    "A database"
  ]}
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
```tsx
<Tabs>
  <Tab label="JavaScript">
    ```javascript
    const greeting = "Hello";
    ```
  </Tab>
  <Tab label="TypeScript">
    ```typescript
    const greeting: string = "Hello";
    ```
  </Tab>
</Tabs>
```

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
**Status**: ⏸️ Not Started  
**Estimated Time**: 11 hours  
**Priority**: 🟡 Medium

**Description**:
Integrate Midtrans payment gateway untuk paid courses:
- Backend: payment handler, webhook verification
- Frontend: checkout page, payment status

**Backend Files**:
```
tempaskill-be/internal/payment/
├── model.go                  # Transaction model
├── dto.go                    # Payment DTOs
├── repository.go             # Transaction queries
├── service.go                # Midtrans integration
├── handler.go                # Payment endpoints
└── routes.go                 # Route registration
```

**Frontend Files**:
```
tempaskill-fe/src/app/checkout/[courseId]/
└── page.tsx                  # Checkout page

tempaskill-fe/src/hooks/
└── use-payment.ts            # Payment hooks
```

**Environment Variables**:
```
MIDTRANS_SERVER_KEY=
MIDTRANS_CLIENT_KEY=
MIDTRANS_IS_PRODUCTION=false
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
**Status**: ⏸️ Not Started  
**Estimated Time**: 6 hours  
**Priority**: 🟡 Medium

**Description**:
Schedule bi-weekly live sessions untuk Q&A:
- Backend: session CRUD, reminder emails
- Frontend: calendar view, join session link

**Backend Files**:
```
tempaskill-be/internal/session/
├── model.go                  # Session model
├── dto.go
├── repository.go
├── service.go
├── handler.go
└── routes.go
```

**Frontend Files**:
```
tempaskill-fe/src/app/courses/[slug]/sessions/
└── page.tsx                  # Sessions calendar

tempaskill-fe/src/components/session/
├── session-calendar.tsx
└── join-button.tsx
```

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
**Status**: ⏸️ Not Started  
**Estimated Time**: 5 hours  
**Priority**: 🟡 Medium

**Description**:
Halaman user profile lengkap:
- Edit profile (name, bio)
- Change password
- Upload avatar
- Notification preferences

**Frontend Files**:
```
tempaskill-fe/src/app/profile/
├── page.tsx                  # Profile view
└── edit/page.tsx            # Edit form

tempaskill-fe/src/components/profile/
├── avatar-upload.tsx
└── settings-form.tsx
```

**Backend Endpoints** (Already exists):
- ✅ GET /api/v1/users/me
- ✅ PATCH /api/v1/users/me
- ✅ PATCH /api/v1/users/me/password

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
1. [ ] Admin Panel - Course Management
2. [ ] Admin Panel - Lesson Management

**Quick Wins** (Can do anytime):
- [ ] Callout component (1 hour)
- [ ] Tabs component (2 hours)
- [ ] User Profile page (existing APIs)

**Research Needed**:
- [ ] Midtrans integration docs
- [ ] PDF generation libraries
- [ ] Monaco Editor setup

---

**Last Updated**: November 3, 2025  
**Total Estimated Time**: ~112 hours  
**Progress**: 0/20 tasks completed (0%)

---

💡 **Tip**: Update status setelah setiap task completion. Gunakan VS Code TODO extension untuk quick tracking.
