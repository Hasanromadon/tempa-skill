# 🚀 AI-Assisted Development Guide - TempaSKill

> **Panduan lengkap untuk fast development dengan AI agents**

**Last Updated**: November 3, 2025  
**Project Status**: Production-Ready Architecture ✅

---

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [New Features Added](#new-features-added)
- [High Priority Recommendations](#high-priority-recommendations)
- [Medium Priority Recommendations](#medium-priority-recommendations)
- [Low Priority Enhancements](#low-priority-enhancements)
- [AI Agent Workflow](#ai-agent-workflow)
- [Common Pitfalls to Avoid](#common-pitfalls-to-avoid)
- [Performance Tips](#performance-tips)

---

## 🎯 Quick Start

### What's Already Excellent

✅ **Architecture** - Clean, modular, well-organized  
✅ **Documentation** - 27 files, comprehensive, no redundancy  
✅ **Testing** - 93.8% E2E coverage, multi-browser  
✅ **Security** - JWT, bcrypt, input validation  
✅ **DX** - Scripts, Makefile, quick start guides  
✅ **AI-Ready** - Copilot instructions (1000+ lines)

### Current Gaps (Now Fixed!)

❌ **VS Code Workspace** - Missing → ✅ **ADDED**  
❌ **AI Context** - Limited → ✅ **ENHANCED**  
❌ **Git Hooks** - None → ✅ **ADDED**  
❌ **Task Template** - Missing → ✅ **CREATED**

---

## 🆕 New Features Added (November 3, 2025)

### 1. **VS Code Workspace Configuration** ✨

**Files Created**:
- `.vscode/settings.json` - Editor settings, formatters, linters
- `.vscode/launch.json` - Debug configurations (BE, FE, E2E)
- `.vscode/extensions.json` - Recommended extensions
- `tempaskill.code-workspace` - Multi-folder workspace

**Benefits**:
- ✅ Consistent code formatting across team
- ✅ One-click debugging for backend & frontend
- ✅ Auto-install recommended extensions
- ✅ Better AI agent context awareness

**Usage**:
```bash
# Open workspace
code tempaskill.code-workspace

# Or in VS Code: File → Open Workspace from File
```

### 2. **AI Context Files** ✨

**Files Created**:
- `.github/AI_CONTEXT.md` - Quick reference for AI agents
- `.github/TASK_TEMPLATE.md` - Structured task planning

**Benefits**:
- ✅ AI agents understand project instantly
- ✅ Consistent task breakdown
- ✅ Checklist-driven development
- ✅ Faster onboarding for new AI tools

**Usage**:
```bash
# When starting new feature
cp .github/TASK_TEMPLATE.md tasks/feature-name.md
# Fill in details, let AI help implement
```

### 3. **Git Hooks** ✨

**Files Created**:
- `.githooks/pre-commit` - Quality checks before commit

**Features**:
- ✅ Auto-format code (Go fmt, ESLint)
- ✅ Detect credentials in code
- ✅ Warn about TODO/FIXME
- ✅ Check file sizes (prevent large files)

**Setup**:
```bash
# Enable git hooks
git config core.hooksPath .githooks

# Make executable (Linux/Mac)
chmod +x .githooks/pre-commit
```

---

## 🔥 High Priority Recommendations

### 1. **Add `.env.example` to Root** ⚠️

**Current**: Only in `tempaskill-be/`  
**Issue**: Frontend env vars not documented

**Action**:
```bash
# Create root .env.example
cat > .env.example << 'EOF'
# TempaSKill Environment Variables

## Backend (.env in tempaskill-be/)
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_DATABASE=tempaskill
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
SERVER_PORT=8080
ENV=development

## Frontend (.env.local in tempaskill-fe/)
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
NEXT_PUBLIC_APP_NAME=TempaSKill
NEXT_PUBLIC_APP_URL=http://localhost:3000
EOF
```

**Also create** `tempaskill-fe/.env.example`:
```bash
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
NEXT_PUBLIC_APP_NAME=TempaSKill
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. **Add Docker Setup** ⚠️

**Current**: Manual MySQL setup  
**Better**: Docker Compose for full stack

**Action**: Create `docker-compose.yml`:
```yaml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    container_name: tempaskill-db
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_PASSWORD:-password}
      MYSQL_DATABASE: ${MYSQL_DATABASE:-tempaskill}
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
      - ./tempaskill-be/migrations:/docker-entrypoint-initdb.d
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ./tempaskill-be
      dockerfile: Dockerfile
    container_name: tempaskill-backend
    depends_on:
      mysql:
        condition: service_healthy
    environment:
      MYSQL_HOST: mysql
      MYSQL_PORT: 3306
      MYSQL_USER: root
      MYSQL_PASSWORD: ${MYSQL_PASSWORD:-password}
      MYSQL_DATABASE: ${MYSQL_DATABASE:-tempaskill}
      JWT_SECRET: ${JWT_SECRET:-your-jwt-secret}
      SERVER_PORT: 8080
      ENV: development
    ports:
      - "8080:8080"
    volumes:
      - ./tempaskill-be:/app
    command: go run cmd/api/main.go

  frontend:
    build:
      context: ./tempaskill-fe
      dockerfile: Dockerfile.dev
    container_name: tempaskill-frontend
    depends_on:
      - backend
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:8080/api/v1
    ports:
      - "3000:3000"
    volumes:
      - ./tempaskill-fe:/app
      - /app/node_modules
    command: yarn dev

volumes:
  mysql_data:
```

**Benefits**:
- ✅ One command to start everything: `docker-compose up`
- ✅ Consistent environment across machines
- ✅ No manual MySQL installation
- ✅ Easier for new developers

### 3. **Add GitHub Actions CI/CD** ⚠️

**Current**: Manual testing  
**Better**: Automated tests on push

**Action**: Create `.github/workflows/ci.yml`:
```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    services:
      mysql:
        image: mysql:8.0
        env:
          MYSQL_ROOT_PASSWORD: password
          MYSQL_DATABASE: tempaskill_test
        ports:
          - 3306:3306
        options: --health-cmd="mysqladmin ping" --health-interval=10s
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Go
        uses: actions/setup-go@v4
        with:
          go-version: '1.21'
      
      - name: Run Backend Tests
        working-directory: ./tempaskill-be
        env:
          MYSQL_HOST: 127.0.0.1
          MYSQL_USER: root
          MYSQL_PASSWORD: password
          MYSQL_DATABASE: tempaskill_test
        run: |
          go test ./... -v -cover

  frontend-tests:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'yarn'
          cache-dependency-path: tempaskill-fe/yarn.lock
      
      - name: Install Dependencies
        working-directory: ./tempaskill-fe
        run: yarn install --frozen-lockfile
      
      - name: Run Linter
        working-directory: ./tempaskill-fe
        run: yarn lint
      
      - name: Build
        working-directory: ./tempaskill-fe
        run: yarn build

  e2e-tests:
    runs-on: ubuntu-latest
    needs: [backend-tests, frontend-tests]
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install Dependencies
        run: yarn install --frozen-lockfile
      
      - name: Install Playwright Browsers
        run: npx playwright install --with-deps
      
      - name: Run E2E Tests
        run: yarn test:e2e
      
      - name: Upload Test Results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

**Benefits**:
- ✅ Auto-run tests on every push
- ✅ Catch bugs before merge
- ✅ Visual test reports
- ✅ Professional workflow

### 4. **Add Error Tracking** ⚠️

**Recommended**: Sentry for production error monitoring

**Action**: Create `tempaskill-fe/lib/sentry.ts`:
```typescript
import * as Sentry from "@sentry/nextjs";

if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 0.1, // 10% of transactions
    beforeSend(event) {
      // Don't send errors in development
      if (process.env.NODE_ENV === 'development') {
        return null;
      }
      return event;
    },
  });
}
```

**Backend** (`tempaskill-be/pkg/sentry/sentry.go`):
```go
package sentry

import (
    "os"
    "github.com/getsentry/sentry-go"
)

func Init() error {
    return sentry.Init(sentry.ClientOptions{
        Dsn: os.Getenv("SENTRY_DSN"),
        Environment: os.Getenv("ENV"),
        TracesSampleRate: 0.1,
    })
}
```

---

## 🟡 Medium Priority Recommendations

### 5. **Add API Rate Limiting**

**Current**: No rate limiting  
**Risk**: API abuse, DDoS vulnerability

**Action**: Add middleware in `tempaskill-be/internal/middleware/rate_limit.go`:
```go
package middleware

import (
    "github.com/gin-gonic/gin"
    "golang.org/x/time/rate"
    "sync"
)

var limiters = make(map[string]*rate.Limiter)
var mu sync.Mutex

func RateLimit() gin.HandlerFunc {
    return func(c *gin.Context) {
        ip := c.ClientIP()
        
        mu.Lock()
        limiter, exists := limiters[ip]
        if !exists {
            limiter = rate.NewLimiter(10, 20) // 10 req/sec, burst 20
            limiters[ip] = limiter
        }
        mu.Unlock()
        
        if !limiter.Allow() {
            c.JSON(429, gin.H{
                "error": "Too many requests",
                "retry_after": "1 second",
            })
            c.Abort()
            return
        }
        
        c.Next()
    }
}
```

### 6. **Add Request/Response Logging**

**Current**: Limited logging  
**Better**: Structured request/response logs

**Action**: Already have request ID middleware, enhance with:
```go
// internal/middleware/logger.go
func Logger() gin.HandlerFunc {
    return func(c *gin.Context) {
        start := time.Now()
        path := c.Request.URL.Path
        raw := c.Request.URL.RawQuery
        
        c.Next()
        
        latency := time.Since(start)
        statusCode := c.Writer.Status()
        
        logger.Info("HTTP Request",
            zap.String("request_id", c.GetString("request_id")),
            zap.String("method", c.Request.Method),
            zap.String("path", path),
            zap.String("query", raw),
            zap.Int("status", statusCode),
            zap.Duration("latency", latency),
            zap.String("ip", c.ClientIP()),
        )
    }
}
```

### 7. **Add Frontend Performance Monitoring**

**Action**: Create `tempaskill-fe/lib/analytics.ts`:
```typescript
// Web Vitals tracking
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric: any) {
  // Send to your analytics service
  console.log(metric);
  
  // Or send to backend
  fetch('/api/analytics', {
    method: 'POST',
    body: JSON.stringify(metric),
  });
}

export function reportWebVitals() {
  getCLS(sendToAnalytics);
  getFID(sendToAnalytics);
  getFCP(sendToAnalytics);
  getLCP(sendToAnalytics);
  getTTFB(sendToAnalytics);
}
```

---

## 🟢 Low Priority Enhancements

### 8. **Add API Versioning Strategy**

**Current**: `/api/v1` hardcoded  
**Future**: Need versioning strategy

**Recommendation**: Document in `API_SPEC.md`:
- Keep v1 for backward compatibility
- Create v2 when breaking changes needed
- Support both versions for 6 months
- Deprecation warnings in responses

### 9. **Add Database Backup Script**

**Action**: Create `tempaskill-be/scripts/backup-db.sh`:
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="backups"
mkdir -p $BACKUP_DIR

mysqldump -u root -p tempaskill > "$BACKUP_DIR/tempaskill_$DATE.sql"
echo "Backup created: $BACKUP_DIR/tempaskill_$DATE.sql"

# Keep only last 7 days
find $BACKUP_DIR -name "tempaskill_*.sql" -mtime +7 -delete
```

### 10. **Add Health Check Endpoint Enhancement**

**Current**: Basic health check  
**Better**: Detailed health metrics

**Action**: Enhance `/health` endpoint:
```go
type HealthResponse struct {
    Status      string            `json:"status"`
    Version     string            `json:"version"`
    Environment string            `json:"environment"`
    Checks      map[string]string `json:"checks"`
    Uptime      int64             `json:"uptime_seconds"`
}

func (h *HealthHandler) DetailedHealth(c *gin.Context) {
    checks := make(map[string]string)
    
    // Database check
    if err := h.db.DB().Ping(); err != nil {
        checks["database"] = "unhealthy"
    } else {
        checks["database"] = "healthy"
    }
    
    // Redis check (if using)
    // checks["redis"] = "healthy"
    
    c.JSON(200, HealthResponse{
        Status:      "ok",
        Version:     "1.0.0",
        Environment: os.Getenv("ENV"),
        Checks:      checks,
        Uptime:      time.Since(startTime).Seconds(),
    })
}
```

---

## 🤖 AI Agent Workflow

### Recommended Workflow for Fast Development

```
1. 📋 Plan Task
   → Use .github/TASK_TEMPLATE.md
   → Fill in all sections
   → Get AI to review feasibility

2. 📖 Read Context
   → .github/AI_CONTEXT.md (quick reference)
   → .github/copilot-instructions.md (detailed patterns)
   → Related existing code

3. 🔧 Implement
   → Backend: Follow module pattern strictly
   → Frontend: Use React Query + React Hook Form
   → Write tests alongside code

4. ✅ Test
   → Run E2E tests: yarn test:e2e
   → Run backend tests: cd tempaskill-be && go test ./...
   → Manual testing in browser

5. 📝 Document
   → Update API_SPEC.md
   → Update API_QUICK_REFERENCE.md
   → Mark ROADMAP.md task as complete

6. 🚀 Commit
   → Git hooks will auto-format
   → Follow commit message format:
     "feat: add feature description"
     "fix: fix bug description"
     "docs: update documentation"
     "test: add tests for feature"

7. 🔄 Push & Review
   → GitHub Actions will run tests
   → Review test results
   → Merge when green
```

### AI Prompts for Common Tasks

#### Creating New Module (Backend)
```
Create a new [module] module in tempaskill-be following these requirements:

Context:
- Read .github/copilot-instructions.md backend section
- Follow the pattern from internal/auth/ module
- Use standard GORM model with hooks

Requirements:
1. Create model.go with GORM model
2. Create dto.go with request/response DTOs
3. Create repository.go with interface and implementation
4. Create service.go with business logic
5. Create handler.go with HTTP endpoints
6. Create routes.go for route registration
7. Add tests for each layer

Database:
- Table: [table_name]
- Fields: [list fields]
- Relationships: [describe relationships]

API Endpoints:
- POST /api/v1/[resource] - Create
- GET /api/v1/[resource] - List with pagination
- GET /api/v1/[resource]/:id - Get by ID
- PUT /api/v1/[resource]/:id - Update
- DELETE /api/v1/[resource]/:id - Delete

Please implement following the exact pattern from internal/auth/
```

#### Creating New Page (Frontend)
```
Create a new [page] page in tempaskill-fe following these requirements:

Context:
- Read .github/copilot-instructions.md frontend section
- Use Next.js 15 App Router
- Follow pattern from app/courses/page.tsx

Requirements:
1. Create app/[route]/page.tsx
2. Create components/[feature]/[Component].tsx
3. Create hooks/use-[feature].ts with React Query
4. Create types/[feature].ts for TypeScript types
5. Use Shadcn UI components
6. Orange brand color (#ea580c)
7. Indonesian text for all UI

Features:
- [List features needed]

Please use:
- React Query for data fetching
- React Hook Form for forms
- Shadcn UI components (Button, Card, Alert, etc.)
- Orange primary color
- Indonesian UI text
```

---

## ⚠️ Common Pitfalls to Avoid

### 1. **Next.js 15 Async Params**
```typescript
// ❌ WRONG - Will error in Next.js 15
export default function Page({ params }) {
  const { slug } = params; // ERROR!
}

// ✅ CORRECT - Use React.use()
import { use } from "react";

export default function Page({ params }) {
  const { slug } = use(params); // ✅ Works!
}
```

### 2. **Indonesian UI Text**
```typescript
// ❌ WRONG
<Button>Login</Button>
<h1>My Courses</h1>

// ✅ CORRECT
<Button>Masuk</Button>
<h1>Kursus Saya</h1>
```

### 3. **Brand Colors**
```typescript
// ❌ WRONG
<Button className="bg-blue-600">...</Button>

// ✅ CORRECT
<Button className="bg-orange-600 hover:bg-orange-700">...</Button>
```

### 4. **Backend Module Pattern**
```go
// ❌ WRONG - Not following pattern
type UserService struct {
    DB *gorm.DB // Direct DB access
}

// ✅ CORRECT - Use repository
type UserService interface {
    Create(req CreateUserRequest) (*User, error)
}

type userService struct {
    repo UserRepository // Use repository
}
```

---

## 🚀 Performance Tips

### Backend Optimization

1. **Use Database Indexes**
   ```sql
   -- Already done in migrations
   INDEX idx_email ON users(email)
   INDEX idx_slug ON courses(slug)
   ```

2. **Use Preload to Avoid N+1**
   ```go
   // ✅ GOOD
   db.Preload("Lessons").Find(&courses)
   
   // ❌ BAD - N+1 queries
   for _, course := range courses {
       db.Where("course_id = ?", course.ID).Find(&lessons)
   }
   ```

3. **Use Select to Limit Fields**
   ```go
   db.Select("id", "title", "slug").Find(&courses)
   ```

### Frontend Optimization

1. **Use React Query Stale Time**
   ```typescript
   const { data } = useCourses({
     staleTime: 5 * 60 * 1000, // 5 minutes
   });
   ```

2. **Use Next.js Image Optimization**
   ```typescript
   import Image from 'next/image';
   
   <Image 
     src="/image.jpg" 
     width={500} 
     height={300}
     alt="..."
   />
   ```

3. **Lazy Load Components**
   ```typescript
   import dynamic from 'next/dynamic';
   
   const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
     loading: () => <Skeleton />,
   });
   ```

---

## 📊 Project Health Metrics

### Current Status (November 3, 2025)

| Metric | Status | Target |
|--------|--------|--------|
| Documentation | 27 files ✅ | 20+ |
| E2E Test Coverage | 93.8% ✅ | >90% |
| Backend Tests | Partial ⚠️ | Full coverage |
| API Endpoints | 15+ ✅ | As needed |
| Security Audit | Complete ✅ | Annual |
| Code Quality | Excellent ✅ | Maintain |

### Next Milestones

1. **Week 5-6**: Phase 2 - Core Features
   - Enrollment flow
   - Progress tracking dashboard
   - Search & filters

2. **Week 7-8**: Phase 3 - Enhancement
   - Payment integration
   - Email notifications
   - Admin dashboard

3. **Week 9-10**: Phase 4 - Deployment
   - Docker setup ✅ (planned today)
   - CI/CD pipeline ✅ (planned today)
   - Production deployment

---

## 🎯 Summary

### ✅ What's Already Great

- Clean architecture
- Comprehensive documentation
- Good test coverage
- Security best practices
- Developer-friendly setup

### 🆕 What We Just Added

- VS Code workspace configuration
- AI context files
- Git hooks for quality
- Task template for planning

### 🔥 What to Do Next

**High Priority**:
1. Add `.env.example` files
2. Setup Docker Compose
3. Add GitHub Actions CI/CD
4. Add error tracking (Sentry)

**Medium Priority**:
5. Add rate limiting
6. Enhance logging
7. Add performance monitoring

**Low Priority**:
8. Database backup automation
9. Enhanced health checks
10. API versioning documentation

---

**Ready for AI-Assisted Development!** 🚀

All tools and documentation are in place for fast, high-quality development with AI assistance.

---

**Last Updated**: November 3, 2025  
**Version**: 1.0.0
