# 🗺️ Development Roadmap - TempaSKill

> Visual timeline & task breakdown untuk development

---

## 📅 Timeline Overview

```
┌─────────────┬─────────────┬─────────────┬─────────────┐
│  Week 1-2   │  Week 3-4   │  Week 5-6   │  Week 7-8   │
│ Foundation  │ Core Feat.  │ Enhancement │ Deployment  │
└─────────────┴─────────────┴─────────────┴─────────────┘
```

---

## 🎯 Phase 1: Foundation (Week 1-2)

**Goal**: Setup infrastructure & authentication

### Backend Tasks

```
✅ Task 1.1: Project Setup (2 hours) - COMPLETED
  ✓ Initialize Go module
  ✓ Setup folder structure (internal/, pkg/, cmd/)
  ✓ Install dependencies (Gin, GORM, JWT)
  ✓ Create .env configuration
  ✓ Setup MySQL connection

✅ Task 1.2: Database Schema (2 hours) - COMPLETED
  ✓ Create users table
  ✓ Create GORM models
  ✓ Setup auto migration
  ✓ Test database connection

✅ Task 1.3: Authentication Module (4 hours) - COMPLETED
  ✓ auth_model.go (User model)
  ✓ auth_dto.go (RegisterRequest, LoginRequest)
  ✓ auth_repository.go (Create, FindByEmail)
  ✓ auth_service.go (Register, Login, GenerateJWT)
  ✓ auth_handler.go (POST /register, POST /login)
  ✓ middleware/auth.go (JWT validation)

✅ Task 1.4: Testing (1 hour) - COMPLETED
  ✓ Test register endpoint
  ✓ Test login endpoint
  ✓ Test protected route with JWT
```

**Total Backend: ~9 hours** ✅ COMPLETED

### Frontend Tasks

```
✅ Task 1.5: Project Setup (2 hours) - COMPLETED
  ✓ Create Next.js app with TypeScript
  ✓ Install Tailwind CSS
  ✓ Install & configure Shadcn/ui
  ✓ Setup folder structure (src/)
  ✓ Configure environment variables

✅ Task 1.6: Design System (2 hours) - COMPLETED
  ✓ Configure brand colors in tailwind.config.ts (Orange primary, Blue accent)
  ✓ Install Shadcn components (Button, Card, Input, Badge, Alert, Progress, Skeleton)
  ✓ Create base layout components
  ✓ Setup global styles

✅ Task 1.7: API Integration Setup (2 hours) - COMPLETED
  ✓ Configure Axios client with interceptors
  ✓ Setup TanStack Query (QueryClientProvider)
  ✓ Auth state via React Query + localStorage
  ✓ Create comprehensive API response types

✅ Task 1.8: Authentication Pages (4 hours) - COMPLETED
  ✓ Auth hooks (useLogin, useRegister, useCurrentUser)
  ✓ Build LoginForm component with validation
  ✓ Build RegisterForm component with password confirmation
  ✓ Create /login page (Bahasa Indonesia)
  ✓ Create /register page (Bahasa Indonesia)
  ✓ Implement auth flow & redirect to dashboard
  ✓ Fixed race condition in token storage

✅ Task 1.9: Protected Route Setup (1 hour) - COMPLETED
  ✓ Auth state checking with useIsAuthenticated
  ✓ Protected route redirects (dashboard, profile)
  ✓ Loading states with skeletons
```

**Total Frontend: ~11 hours** ✅ COMPLETED

**Phase 1 Total: ~20 hours (~2 weeks casual pace)**

---

## 🚀 Phase 2: Core Features (Week 3-4)

**Goal**: Course management & learning experience

### Backend Tasks

```
✅ Task 2.1: User Profile (3 hours) - COMPLETED
  ✓ user_dto.go (UpdateProfileRequest, ChangePasswordRequest)
  ✓ user_repository.go (FindByID, Update, UpdatePassword)
  ✓ user_service.go (GetUserByID, UpdateProfile, ChangePassword)
  ✓ user_handler.go (GET /users/:id, PATCH /users/me, PATCH /users/me/password)
  ✓ Comprehensive testing (11 unit + integration tests)

✅ Task 2.2: Course Module (4 hours) - COMPLETED
  ✓ course_model.go (Course, Lesson, Enrollment models)
  ✓ course_dto.go (CreateCourseRequest, UpdateCourseRequest, CourseResponse)
  ✓ course_repository.go (Create, FindAll, FindByID, Update, Delete)
  ✓ course_service.go (Business logic with authorization)
  ✓ course_handler.go (CRUD endpoints)
  ✓ Pagination & filtering (search, category, difficulty)
  ✓ Slug-based retrieval support

✅ Task 2.3: Lesson Module (3 hours) - COMPLETED
  ✓ lesson_handler.go (CRUD endpoints)
  ✓ lesson_service.go (GetLesson, CreateLesson, UpdateLesson, DeleteLesson)
  ✓ lesson_repository.go (DB operations with ordering)
  ✓ MDX content storage in database
  ✓ Free lesson access logic

✅ Task 2.4: Enrollment System (2 hours) - COMPLETED
  ✓ enrollment_model.go (with timestamps)
  ✓ enrollment_handler.go (POST /courses/:id/enroll, DELETE /courses/:id/unenroll)
  ✓ enrollment_service.go (Enroll, Unenroll, CheckEnrollment)
  ✓ enrollment_repository.go (with duplicate prevention)
  ✓ Published course validation

✅ Task 2.5: Progress Tracking (3 hours) - COMPLETED
  ✓ progress_model.go (LessonProgress with indexes)
  ✓ progress_handler.go (POST /lessons/:id/complete, GET /courses/:id/progress, GET /users/me/progress)
  ✓ progress_service.go (MarkComplete, GetProgress, percentage calculation)
  ✓ progress_repository.go (idempotent completion, progress queries)
  ✓ progress_dto.go (CourseProgressResponse, UserProgressSummary)
  ✓ Comprehensive testing (10/10 tests passing)
  ✓ Course completion detection (100%)
```

**Total Backend: ~15 hours** ✅ COMPLETED

### Frontend Tasks

```
✅ Task 2.6: Landing Page (3 hours) - COMPLETED
  ✓ Create hero section with brand orange CTA
  ✓ Create feature highlights (4 cards)
  ✓ Create course preview section
  ✓ Fully responsive design
  ✓ All text in Bahasa Indonesia

✅ Task 2.7: Course Catalog (4 hours) - COMPLETED
  ✓ Create CourseCard component with instructor, stats
  ✓ Create CourseGrid with responsive layout
  ✓ Search input with debounce
  ✓ Category & difficulty filters
  ✓ Implement useCourses query with pagination
  ✓ Add loading skeletons
  ✓ Show enrollment status for logged-in users

✅ Task 2.8: Course Detail Page (4 hours) - COMPLETED
  ✓ Course header with thumbnail, title, description (521 lines)
  ✓ Lesson list with completion status
  ✓ Instructor info card with bio
  ✓ Implement useCourse query (slug-based)
  ✓ Enroll/Unenroll buttons with state management
  ✓ Progress bar for enrolled users
  ✓ "Mulai Belajar" button to first lesson

✅ Task 2.9: Lesson Viewer (5 hours) - COMPLETED
  ✓ MDX support configured (@next/mdx)
  ✓ LessonPage component (319 lines)
  ✓ Collapsible sidebar with all lessons
  ✓ Lesson content rendering (HTML/MDX)
  ✓ Custom MDX components (headings, code, tables, Note, Callout)
  ✓ "Tandai Selesai" button
  ✓ Prev/Next navigation buttons
  ✓ Progress tracking integration
  ✓ Mobile responsive with sidebar toggle
  ✓ Sticky header with progress bar

✅ Task 2.10: Dashboard (3 hours) - COMPLETED
  ✓ Enrolled courses section with cards
  ✓ Progress overview (total enrolled, completed)
  ✓ User greeting in Bahasa Indonesia
  ✓ Implement useUserProgress query
  ✓ Progress bars for each course
  ✓ "Lanjutkan Belajar" quick access
  ✓ Logout functionality
```

**Total Frontend: ~19 hours** ✅ COMPLETED

**Phase 2 Total: ~33 hours (~2 weeks)**

---

## ✨ Phase 3: Enhancement (Week 5-6)

**Goal**: Polish UX & add advanced features

### Backend Tasks

```
□ Task 3.1: Search & Filter (3 hours)
  ├─ Add full-text search
  ├─ Category filtering
  ├─ Difficulty filtering
  └─ Optimize queries with indexes

□ Task 3.2: Admin Panel API (4 hours)
  ├─ Role-based access control
  ├─ Course management endpoints
  ├─ User management endpoints
  └─ Analytics endpoints

□ Task 3.3: Performance Optimization (2 hours)
  ├─ Add database indexes
  ├─ Implement caching (Redis - optional)
  ├─ Query optimization
  └─ Pagination improvements

□ Task 3.4: Error Handling & Logging (2 hours)
  ├─ Structured logging
  ├─ Error tracking
  └─ Request/response logging
```

**Total Backend: ~11 hours**

### Frontend Tasks

```
□ Task 3.5: Profile Page (2 hours)
  ├─ Create profile view
  ├─ Create profile edit form
  ├─ Avatar upload
  └─ Settings section

□ Task 3.6: Enhanced Search (3 hours)
  ├─ Create search bar component
  ├─ Implement debounced search
  ├─ Add filter dropdowns
  └─ Search results page

□ Task 3.7: Notifications (2 hours)
  ├─ Toast notifications
  ├─ Success/error messages
  └─ Loading indicators

□ Task 3.8: Accessibility (2 hours)
  ├─ Keyboard navigation
  ├─ ARIA labels
  ├─ Focus management
  └─ Screen reader testing

□ Task 3.9: Performance (2 hours)
  ├─ Image optimization
  ├─ Code splitting
  ├─ Lazy loading
  └─ Bundle analysis

□ Task 3.10: Mobile Optimization (3 hours)
  ├─ Mobile navigation
  ├─ Touch interactions
  ├─ Responsive layouts
  └─ Mobile testing
```

**Total Frontend: ~14 hours**

**Phase 3 Total: ~25 hours (~2 weeks)**

---

## 🚢 Phase 4: Deployment (Week 7-8)

**Goal**: Production deployment & monitoring

### Backend Tasks

```
□ Task 4.1: Production Build (2 hours)
  ├─ Optimize Go binary
  ├─ Environment configuration
  ├─ Security hardening
  └─ Build scripts

□ Task 4.2: VPS Setup (3 hours)
  ├─ Setup Linux VPS
  ├─ Install MySQL
  ├─ Configure firewall
  └─ SSL certificate

□ Task 4.3: Deployment (3 hours)
  ├─ Create systemd service
  ├─ Setup Nginx reverse proxy
  ├─ Deploy binary
  ├─ Run migrations
  └─ Test endpoints

□ Task 4.4: Monitoring (2 hours)
  ├─ Setup logging
  ├─ Error tracking
  ├─ Performance monitoring
  └─ Uptime monitoring
```

**Total Backend: ~10 hours**

### Frontend Tasks

```
□ Task 4.5: Vercel Setup (1 hour)
  ├─ Connect GitHub repo
  ├─ Configure build settings
  ├─ Set environment variables
  └─ Custom domain

□ Task 4.6: Production Build (2 hours)
  ├─ Optimize production build
  ├─ Test production mode locally
  ├─ Fix build warnings
  └─ Bundle size optimization

□ Task 4.7: Deployment (1 hour)
  ├─ Deploy to Vercel
  ├─ Test production site
  ├─ Verify API connection
  └─ Check all routes

□ Task 4.8: Testing & QA (2 hours)
  ├─ End-to-end testing
  ├─ Cross-browser testing
  ├─ Mobile device testing
  └─ Fix bugs
```

**Total Frontend: ~6 hours**

### DevOps Tasks

```
□ Task 4.9: CI/CD (3 hours)
  ├─ Setup GitHub Actions
  ├─ Automated testing
  ├─ Automated deployment
  └─ Rollback strategy

□ Task 4.10: Documentation (2 hours)
  ├─ Update README.md
  ├─ API documentation
  ├─ Deployment guide
  └─ User documentation
```

**Total DevOps: ~5 hours**

**Phase 4 Total: ~21 hours (~2 weeks)**

---

## 📊 Summary

```
┌──────────────────┬───────────┬─────────────┬────────┐
│ Phase            │ Backend   │ Frontend    │ Total  │
├──────────────────┼───────────┼─────────────┼────────┤
│ 1. Foundation    │  9 hours  │  11 hours   │ 20 hrs │
│ 2. Core Features │ 14 hours  │  19 hours   │ 33 hrs │
│ 3. Enhancement   │ 11 hours  │  14 hours   │ 25 hrs │
│ 4. Deployment    │ 10 hours  │   6 hours   │ 21 hrs │
├──────────────────┼───────────┼─────────────┼────────┤
│ TOTAL            │ 44 hours  │  50 hours   │ 99 hrs │
└──────────────────┴───────────┴─────────────┴────────┘

📅 Estimated Timeline: 8 weeks (casual, ~12-15 hours/week)
📅 Intensive Timeline: 4 weeks (focused, ~25 hours/week)
```

---

## 🎯 Current Status

Update checklist as you progress:

### ✅ Completed

- [x] Project planning & documentation
- [x] Architecture design
- [x] Database schema design
- [x] API specification
- [x] **Phase 1: Foundation (Backend)** - All auth & infrastructure
- [x] **Phase 1: Foundation (Frontend)** - Auth pages, design system, API setup
- [x] **Phase 2: Core Features (Backend)** - User, Course, Lesson, Enrollment, Progress
- [x] **Phase 2: Core Features (Frontend)** - Landing, Catalog, Detail, Lesson Viewer, Dashboard
- [x] E2E Testing Infrastructure (46 tests with Playwright)
- [x] Development Scripts (PowerShell + NPM)

### 🚧 In Progress

- [ ] **Phase 3: Enhancement** - UX Polish & Advanced Features
  - [ ] Search & Filter optimization
  - [ ] Profile page
  - [ ] Enhanced notifications
  - [ ] Accessibility improvements
  - [ ] Performance optimization
  - [ ] Mobile UX enhancements

### ⏳ Upcoming

- [ ] Phase 4: Deployment & Production
- [ ] CI/CD setup
- [ ] Monitoring & logging
- [ ] Documentation updates

---

## 📋 Daily Development Template

Copy this for daily tracking:

```markdown
## [Date] - Development Log

### 🎯 Goals Today

- [ ] Task 1
- [ ] Task 2
- [ ] Task 3

### ✅ Completed

- [x] Completed task

### 🐛 Bugs Found

- Bug description & status

### 📝 Notes

- Important learnings
- Decisions made
- Questions for tomorrow

### ⏱️ Time Spent

Backend: X hours
Frontend: X hours
Total: X hours
```

---

## 🔄 Iteration Strategy

### Sprint 1 (Week 1-2)

**Focus**: MVP Authentication

- Backend: Auth API working
- Frontend: Login/Register functional
- **Demo**: User can create account & login

### Sprint 2 (Week 3-4)

**Focus**: Course Browsing

- Backend: Course/Lesson API
- Frontend: Course catalog & detail page
- **Demo**: User can browse & view courses

### Sprint 3 (Week 5-6)

**Focus**: Learning Experience

- Backend: Progress tracking
- Frontend: Lesson reader & dashboard
- **Demo**: User can learn & track progress

### Sprint 4 (Week 7-8)

**Focus**: Production Ready

- Deployment & testing
- Bug fixes & polish
- **Demo**: Live production site

---

## 🚀 Quick Start Next Steps

**Immediate Action Items:**

1. [ ] Setup MySQL database
2. [ ] Create `tempaskill-be` folder
3. [ ] Create `tempaskill-fe` folder
4. [ ] Start Phase 1, Task 1.1 (Backend Setup)

**Command to run:**

```powershell
# Create workspaces
cd d:\non-bri\tempa-skill
mkdir tempaskill-be
mkdir tempaskill-fe

# Initialize backend
cd tempaskill-be
go mod init github.com/yourusername/tempaskill-be

# Initialize frontend
cd ..\tempaskill-fe
npx create-next-app@latest . --typescript --tailwind --app
```

---

## 📞 Get Help

**Stuck? Ask AI:**

- "Bagaimana cara implementasi Task 1.3?"
- "Show me example code for auth_service.go"
- "Help me debug login endpoint"

**Before asking, provide:**

1. Current task number
2. Workspace (backend/frontend)
3. What you've tried
4. Error message (if any)

---

**Last Updated**: November 3, 2025  
**Roadmap Version**: 1.0.1

**Let's build something amazing! 🔥**
