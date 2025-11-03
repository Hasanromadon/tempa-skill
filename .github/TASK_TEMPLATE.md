# Task Template for AI Agents

> Use this template when planning new features with AI assistance

## Task: [Feature Name]

**Priority**: High / Medium / Low  
**Estimated Time**: X hours  
**Status**: Not Started / In Progress / Completed

---

## 📋 Context

**What**: Brief description of what needs to be built

**Why**: Business reason or user need

**Where**: Which modules/files will be affected

---

## 🎯 Acceptance Criteria

- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

---

## 🔧 Technical Details

### Backend Changes

**Files to Create/Modify**:

- `internal/module/model.go` - [description]
- `internal/module/dto.go` - [description]
- `internal/module/repository.go` - [description]
- `internal/module/service.go` - [description]
- `internal/module/handler.go` - [description]

**Database Changes**:

- [ ] New table: `table_name`
- [ ] New migration: `migrations/XXX_description.sql`
- [ ] Seed data needed: Yes/No

**API Endpoints**:

- `POST /api/v1/resource` - Create
- `GET /api/v1/resource/:id` - Read
- `PUT /api/v1/resource/:id` - Update
- `DELETE /api/v1/resource/:id` - Delete

### Frontend Changes

**Files to Create/Modify**:

- `app/feature/page.tsx` - [description]
- `components/feature/Component.tsx` - [description]
- `hooks/use-feature.ts` - [description]
- `types/feature.ts` - [description]

**UI Components Needed**:

- [ ] Form with React Hook Form
- [ ] List view with pagination
- [ ] Detail view
- [ ] Delete confirmation dialog

---

## 🧪 Testing Plan

### E2E Tests (Playwright)

- [ ] Test: User can create resource
- [ ] Test: User can view resource list
- [ ] Test: User can update resource
- [ ] Test: User can delete resource
- [ ] Test: Error handling for invalid input

**File**: `e2e/feature.spec.ts`

### Backend Tests (Go)

- [ ] Test: Repository CRUD operations
- [ ] Test: Service business logic
- [ ] Test: Handler endpoints
- [ ] Test: Validation errors

**Files**: `internal/module/*_test.go`

---

## 📝 Documentation Updates

- [ ] Update `API_SPEC.md` with new endpoints
- [ ] Update `API_QUICK_REFERENCE.md`
- [ ] Update `DATABASE.md` if schema changes
- [ ] Update `ROADMAP.md` to mark task as complete
- [ ] Add examples to `FRONTEND_API_GUIDE.md`

---

## 🔒 Security Checklist

- [ ] Input validation implemented
- [ ] Authentication required (if protected)
- [ ] Authorization checks (if role-based)
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention (proper escaping)
- [ ] Rate limiting considered

---

## 🎨 Brand Guidelines Check

- [ ] Orange #ea580c used for primary colors
- [ ] Indonesian text for all UI labels
- [ ] Shadcn UI components used
- [ ] Consistent with existing design

---

## 🚀 Deployment Checklist

- [ ] Environment variables documented
- [ ] Database migration tested
- [ ] Backward compatible with existing data
- [ ] Feature flag needed? Yes/No

---

## 📎 Related Files

**Must Read Before Starting**:

- `.github/copilot-instructions.md` - Development patterns
- `DEVELOPMENT.md` - Coding standards
- `API_SPEC.md` - Existing API patterns
- `DATABASE.md` - Current schema

**Similar Features to Reference**:

- Module: `internal/auth/` - Authentication example
- Component: `components/course/CourseCard.tsx` - Card pattern

---

## 💡 AI Agent Tips

1. **Start with**: Read related files first
2. **Follow pattern**: Copy existing module structure
3. **Test as you go**: Write tests alongside code
4. **Indonesian UI**: All labels must be in Bahasa Indonesia
5. **Orange brand**: Primary color always #ea580c
6. **Update docs**: Don't forget documentation updates

---

## ✅ Completion Checklist

- [ ] Code written and tested
- [ ] All tests passing
- [ ] Documentation updated
- [ ] ROADMAP.md marked as complete
- [ ] Git commit with proper message
- [ ] Pushed to repository

---

**Template Version**: 1.0.0  
**Last Updated**: November 3, 2025
