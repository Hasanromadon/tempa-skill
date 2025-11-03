# AI Development Context - TempaSKill

## Quick Facts

- **Stack**: Go (Gin) + Next.js 15 + MySQL + Playwright
- **Language**: Indonesian UI, English code/docs
- **Brand**: Orange #ea580c
- **Architecture**: Monorepo, Clean Architecture

## File Conventions

- **Backend**: `module_pattern.go` (model → dto → repository → service → handler)
- **Frontend**: `kebab-case.tsx` for files, PascalCase for components
- **Tests**: `*.spec.ts` for E2E, `*_test.go` for backend

## Common Patterns

### Backend (Go)

```go
// Always follow this module structure
type Service interface { Method(req DTO) (*Response, error) }
type service struct { repo Repository }

// Always validate input
if err := c.ShouldBindJSON(&req); err != nil {
    c.JSON(400, gin.H{"error": err.Error()})
    return
}
```

### Frontend (Next.js 15)

```typescript
// CRITICAL: Use React.use() for async params
import { use } from "react";
const { slug } = use(params); // params is Promise in Next.js 15

// Always use React Query
const { data, isLoading, error } = useCourse(slug);

// Always use React Hook Form
const {
  register,
  handleSubmit,
  formState: { errors },
} = useForm();
```

## Key Documentation

- **Setup**: QUICKSTART.md
- **API**: API_SPEC.md, API_QUICK_REFERENCE.md
- **Patterns**: .github/copilot-instructions.md (1000+ lines)
- **Database**: DATABASE.md

## Testing Rules

- E2E tests must use `data-testid` attributes
- Backend tests need table cleanup
- Use test helpers in `e2e/helpers/`

## Security Checklist

- ✅ JWT tokens (24h expiration)
- ✅ Password hashing (bcrypt cost 10)
- ✅ Input validation (binding tags)
- ✅ CORS configured
- ✅ Rate limiting (TODO for production)

## Brand Guidelines

- Primary: Orange #ea580c (orange-600)
- Gradients: from-orange-50 to-orange-100
- Buttons: bg-orange-600 hover:bg-orange-700
- Never use blue as primary color

## Common Commands

```bash
# Start development
yarn dev                    # Both BE + FE
yarn dev:backend           # Backend only
yarn dev:frontend          # Frontend only

# Testing
yarn test:e2e              # E2E tests
yarn test:e2e:ui           # Playwright UI
cd tempaskill-be && go test ./...  # Backend tests

# Database
cd tempaskill-be && make db-create
cd tempaskill-be && make db-seed
```

## Current Status (November 3, 2025)

- ✅ Auth system complete
- ✅ Course & Lesson modules complete
- ✅ Progress tracking complete
- ✅ E2E tests 61/65 passing (93.8%)
- ✅ Documentation complete (27 files)
- 🚧 Payment integration (not started)
- 🚧 Email notifications (not started)

## Next Tasks (See ROADMAP.md)

- Phase 2: Core features (enrollment, progress)
- Phase 3: Enhancement (search, filters, analytics)
- Phase 4: Deployment (Docker, CI/CD)

## AI Agent Instructions

1. **Always check** .github/copilot-instructions.md for detailed patterns
2. **Indonesian text** for all UI elements
3. **Orange brand** for all primary colors
4. **Follow module pattern** strictly (backend)
5. **Use React.use()** for Next.js 15 async params
6. **Write tests** for new features
7. **Update ROADMAP.md** when completing tasks
