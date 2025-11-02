# Contributing to TempaSKill

First off, thank you for considering contributing to TempaSKill! 🎉

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How to Contribute](#how-to-contribute)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)

---

## 🤝 Code of Conduct

This project and everyone participating in it is governed by respect, professionalism, and collaboration. Please be kind and respectful to all contributors.

---

## 🚀 Getting Started

1. **Fork the repository**
   ```bash
   # Click "Fork" button on GitHub
   ```

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR-USERNAME/tempa-skill.git
   cd tempa-skill
   ```

3. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/Hasanromadon/tempa-skill.git
   ```

4. **Read the documentation**
   - [QUICKSTART.md](./QUICKSTART.md) - Setup instructions
   - [DEVELOPMENT.md](./DEVELOPMENT.md) - Coding standards
   - [CONTEXT.md](./CONTEXT.md) - AI rules & guidelines

---

## 💡 How to Contribute

### Reporting Bugs

If you find a bug, please create an issue with:
- Clear title and description
- Steps to reproduce
- Expected vs actual behavior
- Screenshots (if applicable)
- Environment details (OS, Go version, Node version)

### Suggesting Features

Feature suggestions are welcome! Please:
- Check existing issues first
- Provide clear use case
- Explain how it aligns with project goals
- Consider implementation complexity

### Code Contributions

We welcome:
- Bug fixes
- Feature implementations
- Documentation improvements
- Performance optimizations
- Test coverage improvements

---

## 🔄 Development Workflow

### 1. Create a Branch
```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

**Branch naming convention:**
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test additions/updates

### 2. Make Your Changes

**Backend (tempaskill-be):**
- Follow Go best practices
- Use layered architecture (handler → service → repository)
- Write tests for new code
- Update API documentation if needed

**Frontend (tempaskill-fe):**
- Follow TypeScript best practices
- Use TanStack Query for API calls
- Apply brand colors (orange, slate, blue)
- Ensure responsive design
- Write component tests

### 3. Test Your Changes

**Backend:**
```bash
cd tempaskill-be
go test ./...
go fmt ./...
```

**Frontend:**
```bash
cd tempaskill-fe
npm run type-check
npm run lint
npm test
```

### 4. Commit Your Changes
```bash
git add .
git commit -m "✨ feat: your descriptive commit message"
```

See [Commit Guidelines](#commit-guidelines) below.

### 5. Keep Your Branch Updated
```bash
git fetch upstream
git rebase upstream/main
```

### 6. Push to Your Fork
```bash
git push origin feature/your-feature-name
```

### 7. Create Pull Request
- Go to your fork on GitHub
- Click "New Pull Request"
- Fill in the PR template
- Link related issues

---

## 📏 Coding Standards

### Backend (Go)

```go
// ✅ Good
func (s *UserService) CreateUser(req CreateUserRequest) (*User, error) {
    if req.Email == "" {
        return nil, errors.New("email is required")
    }
    
    user, err := s.userRepo.Create(req)
    if err != nil {
        return nil, fmt.Errorf("failed to create user: %w", err)
    }
    
    return user, nil
}

// ❌ Bad
func create(r Request) *User {
    user, _ := repo.Create(r)  // Ignoring error
    return user
}
```

**Rules:**
- Always handle errors
- Use meaningful variable names
- Add comments for complex logic
- Follow Go naming conventions
- Run `go fmt` before commit

### Frontend (TypeScript/React)

```tsx
// ✅ Good
interface LoginFormProps {
  onSuccess?: () => void
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  })
  
  const { mutate: login, isPending } = useLogin()
  
  const onSubmit = (data: LoginInput) => {
    login(data, {
      onSuccess: () => onSuccess?.(),
    })
  }
  
  return (
    <Form {...form}>
      {/* Form content */}
    </Form>
  )
}

// ❌ Bad
function LoginForm() {
  const [email, setEmail] = useState('')  // No types
  // Direct fetch, no error handling
  const submit = () => fetch('/api/login')
  return <div>{/* ... */}</div>
}
```

**Rules:**
- Always use TypeScript types
- Use Zod for validation
- TanStack Query for API calls
- Shadcn/ui for components
- Tailwind for styling (no custom CSS)
- Brand colors only

---

## 📝 Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/).

### Format
```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style changes (formatting)
- `refactor` - Code refactoring
- `test` - Test additions/changes
- `chore` - Build/tooling changes

### Examples
```bash
✨ feat(auth): add JWT authentication middleware
🐛 fix(course): resolve enrollment duplicate issue
📝 docs(api): update endpoint documentation
♻️ refactor(user): improve service layer structure
✅ test(lesson): add completion tests
🔧 chore(deps): update Go dependencies
```

### Emoji (Optional but Encouraged)
- ✨ `:sparkles:` - New feature
- 🐛 `:bug:` - Bug fix
- 📝 `:memo:` - Documentation
- ♻️ `:recycle:` - Refactoring
- ✅ `:white_check_mark:` - Tests
- 🔧 `:wrench:` - Configuration
- 🎨 `:art:` - UI/Styling

---

## 🔍 Pull Request Process

### PR Checklist

Before submitting, ensure:

- [ ] Code follows project coding standards
- [ ] Tests pass (`go test ./...` or `npm test`)
- [ ] Documentation updated (if needed)
- [ ] Commits follow conventional commits
- [ ] Branch is up-to-date with `main`
- [ ] No merge conflicts
- [ ] Self-reviewed the code
- [ ] Added tests for new functionality

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Related Issues
Closes #123

## Testing
How did you test this?

## Screenshots (if applicable)
Add screenshots here

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-reviewed
- [ ] Commented complex code
- [ ] Updated documentation
- [ ] Added tests
- [ ] Tests pass
```

### Review Process

1. **Automated Checks**: CI/CD runs tests
2. **Code Review**: Maintainers review code
3. **Feedback**: Address review comments
4. **Approval**: At least 1 approval required
5. **Merge**: Squash and merge to main

---

## 🎯 Development Areas

### High Priority
- [ ] Backend authentication system
- [ ] Frontend auth pages
- [ ] Course CRUD operations
- [ ] Lesson reader component

### Medium Priority
- [ ] Progress tracking
- [ ] User dashboard
- [ ] Search functionality
- [ ] Admin panel

### Low Priority
- [ ] Email notifications
- [ ] Analytics dashboard
- [ ] Mobile app
- [ ] API rate limiting

---

## 📚 Resources

- [Go Documentation](https://go.dev/doc/)
- [Gin Framework](https://gin-gonic.com/docs/)
- [GORM](https://gorm.io/docs/)
- [Next.js](https://nextjs.org/docs)
- [TanStack Query](https://tanstack.com/query/latest)
- [Shadcn/ui](https://ui.shadcn.com/)

---

## 🙏 Recognition

Contributors will be recognized in:
- GitHub contributors list
- Project README
- Release notes

---

## ❓ Questions?

- Create a [Discussion](https://github.com/Hasanromadon/tempa-skill/discussions)
- Open an [Issue](https://github.com/Hasanromadon/tempa-skill/issues)
- Read [Documentation](./DOCS.md)

---

**Thank you for contributing to TempaSKill! 🔥**
