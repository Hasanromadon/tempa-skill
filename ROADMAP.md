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
□ Task 1.5: Project Setup (2 hours)
  ├─ Create Next.js app with TypeScript
  ├─ Install Tailwind CSS
  ├─ Install & configure Shadcn/ui
  ├─ Setup folder structure (src/)
  └─ Configure environment variables

□ Task 1.6: Design System (2 hours)
  ├─ Configure brand colors in tailwind.config.ts
  ├─ Install Shadcn components (Button, Card, Input, Form)
  ├─ Create base layout components
  └─ Setup global styles

□ Task 1.7: API Integration Setup (2 hours)
  ├─ Configure Axios client
  ├─ Setup TanStack Query
  ├─ Create auth store (Zustand)
  └─ Create API response types

□ Task 1.8: Authentication Pages (4 hours)
  ├─ Create Zod schemas (login, register)
  ├─ Create auth queries (useLogin, useRegister)
  ├─ Build LoginForm component
  ├─ Build RegisterForm component
  ├─ Create /login page
  ├─ Create /register page
  └─ Implement auth flow & redirect

□ Task 1.9: Protected Route Setup (1 hour)
  ├─ Create auth middleware
  ├─ Setup route protection
  └─ Add loading states
```

**Total Frontend: ~11 hours**

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

□ Task 2.2: Course Module (4 hours)
  ├─ course_model.go (Course, Lesson models)
  ├─ course_dto.go (CreateCourseRequest, CourseResponse)
  ├─ course_repository.go (Create, FindAll, FindByID)
  ├─ course_service.go (Business logic)
  ├─ course_handler.go (CRUD endpoints)
  └─ Add pagination & filtering

□ Task 2.3: Lesson Module (3 hours)
  ├─ lesson_handler.go (CRUD endpoints)
  ├─ lesson_service.go (GetLesson, CreateLesson)
  ├─ lesson_repository.go (DB operations)
  └─ MDX content storage strategy

□ Task 2.4: Enrollment System (2 hours)
  ├─ enrollment_model.go
  ├─ enrollment_handler.go (POST /courses/:id/enroll)
  ├─ enrollment_service.go (Enroll, CheckEnrollment)
  └─ enrollment_repository.go

□ Task 2.5: Progress Tracking (3 hours)
  ├─ progress_model.go
  ├─ progress_handler.go (POST /lessons/:id/complete)
  ├─ progress_service.go (MarkComplete, GetProgress)
  ├─ progress_repository.go
  └─ Calculate course progress percentage
```

**Total Backend: ~15 hours** (Task 2.1 ✅ COMPLETED, 3/15 hours done)

### Frontend Tasks

```
□ Task 2.6: Landing Page (3 hours)
  ├─ Create hero section (orange CTA)
  ├─ Create feature highlights
  ├─ Create course preview section
  └─ Responsive design

□ Task 2.7: Course Catalog (4 hours)
  ├─ Create CourseCard component
  ├─ Create CourseGrid component
  ├─ Create search & filter UI
  ├─ Implement useCourses query
  ├─ Add pagination
  └─ Add loading skeletons

□ Task 2.8: Course Detail Page (4 hours)
  ├─ Create course header section
  ├─ Create lesson list sidebar
  ├─ Create instructor info card
  ├─ Implement useCourse query
  ├─ Add enrollment button
  └─ Show progress if enrolled

□ Task 2.9: Lesson Reader (5 hours)
  ├─ Setup Velite for MDX processing
  ├─ Create LessonReader component
  ├─ Create lesson navigation
  ├─ Implement useLesson query
  ├─ Add "Mark as Complete" button
  ├─ Add prev/next navigation
  └─ Responsive reading experience

□ Task 2.10: Dashboard (3 hours)
  ├─ Create enrolled courses section
  ├─ Create progress overview
  ├─ Create recent activity
  ├─ Implement useProgress query
  └─ Add charts/visualizations
```

**Total Frontend: ~19 hours**

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

### 🚧 In Progress

- [ ] Backend infrastructure setup
- [ ] Frontend infrastructure setup

### ⏳ Upcoming

- [ ] Authentication implementation
- [ ] Course management
- [ ] Learning features
- [ ] Deployment

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

**Last Updated**: November 2, 2025  
**Roadmap Version**: 1.0.0

**Let's build something amazing! 🔥**
