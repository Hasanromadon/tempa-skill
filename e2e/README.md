# E2E Testing dengan Playwright

Testing end-to-end untuk TempaSKill platform menggunakan Playwright.

## 📋 Prerequisites

- Node.js dan Yarn terinstall
- Go terinstall (untuk backend)
- MySQL database running dengan database `tempaskill`
- Backend server running di `http://localhost:8080`
- Frontend server running di `http://localhost:3000`

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# Di root project
yarn install

# Install browser binaries
npx playwright install
```

### 2. Start Backend & Frontend

**PENTING:** E2E tests membutuhkan backend dan frontend running.

#### Opsi A: Jalankan di 2 Terminal Terpisah (Recommended)

```powershell
# Terminal 1 - Start Backend
.\start-backend.ps1

# Terminal 2 - Start Frontend
.\start-frontend.ps1

# Terminal 3 - Run Tests
yarn test:e2e
```

#### Opsi B: Auto-Start via Playwright Config

Playwright config sudah diset untuk auto-start frontend (`yarn dev`), tapi **backend harus sudah running**:

```powershell
# Terminal 1 - Start Backend
.\start-backend.ps1

# Terminal 2 - Run Tests (frontend auto-start)
yarn test:e2e
```

#### Opsi C: Start Keduanya dengan Concurrently

```powershell
# Start backend + frontend bersamaan
yarn dev

# Di terminal lain, run tests
yarn test:e2e
```

### 3. Run Tests

```bash
# Run all E2E tests (headless mode)
yarn test:e2e

# Run with browser UI (headed mode)
yarn test:e2e:headed

# Run dengan Playwright UI mode (recommended untuk debugging)
yarn test:e2e:ui

# Run specific browser
yarn test:e2e:chromium
yarn test:e2e:firefox
yarn test:e2e:webkit

# Run mobile tests only
yarn test:e2e:mobile

# Show test report
yarn test:e2e:report
```

## 📁 Test Structure

```
e2e/
├── helpers/
│   └── test-helpers.ts      # Utility functions untuk testing
├── auth.spec.ts             # Authentication flow tests
├── courses.spec.ts          # Course browsing & enrollment tests
├── lessons.spec.ts          # Lesson viewer tests
└── dashboard.spec.ts        # Dashboard tests
```

## 🧪 Test Suites

### 1. Authentication Tests (`auth.spec.ts`)

- ✅ Register user baru
- ✅ Login dengan credentials valid
- ✅ Logout
- ✅ Validasi error messages
- ✅ Redirect ke login untuk protected pages
- ✅ Semua text dalam Bahasa Indonesia

### 2. Course Browsing Tests (`courses.spec.ts`)

- ✅ Landing page display
- ✅ Courses list page
- ✅ Course detail page
- ✅ Filter & search courses
- ✅ Enroll/unenroll course
- ✅ Instructor information display

### 3. Lesson Viewer Tests (`lessons.spec.ts`)

- ✅ Lesson page access untuk enrolled user
- ✅ Lesson sidebar navigation
- ✅ Previous/Next lesson buttons
- ✅ Mark lesson as complete
- ✅ Progress tracking updates
- ✅ Mobile responsive sidebar toggle

### 4. Dashboard Tests (`dashboard.spec.ts`)

- ✅ Dashboard access untuk authenticated user
- ✅ Enrolled courses display
- ✅ Progress bars dan statistics
- ✅ Continue learning buttons
- ✅ Empty state untuk new users

## 🔧 Configuration

### Playwright Config (`playwright.config.ts`)

```typescript
{
  testDir: './e2e',
  baseURL: 'http://localhost:3000',

  // Browser projects
  projects: [
    'chromium',    // Desktop Chrome
    'firefox',     // Desktop Firefox
    'webkit',      // Desktop Safari
    'Mobile Chrome', // Mobile Chrome (Pixel 5)
    'Mobile Safari'  // Mobile Safari (iPhone 12)
  ],

  // Auto-start development server
  webServer: {
    command: 'cd tempaskill-fe && yarn dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true
  }
}
```

## 📝 Helper Functions

### Authentication Helpers

```typescript
// Register new user
await register(page, name, email, password);

// Login
await login(page, email, password);

// Logout
await logout(page);

// Generate test user
const user = generateTestUser();
```

### Navigation Helpers

```typescript
// Navigate to course
await goToCourse(page, "course-slug");

// Navigate to lesson
await goToLesson(page, "course-slug", lessonId);

// Enroll in course
await enrollCourse(page);

// Mark lesson complete
await markLessonComplete(page);
```

### Assertion Helpers

```typescript
// Check if authenticated
const isAuth = await isAuthenticated(page);

// Assert text visible
await assertTextVisible(page, "Expected Text");

// Take screenshot
await takeScreenshot(page, "test-screenshot");
```

## 🎯 Best Practices

### 1. Test Isolation

- Setiap test membuat user baru menggunakan `generateTestUser()`
- Tidak bergantung pada data yang sudah ada di database
- Tests dapat di-run dalam urutan apapun

### 2. Wait Strategies

```typescript
// Wait for network idle
await page.waitForLoadState("networkidle");

// Wait for specific URL
await page.waitForURL("/dashboard");

// Wait for element
await expect(page.locator("text=Dashboard")).toBeVisible();

// Wait for API response
await waitForAPIResponse(page, "/api/v1/courses", "GET");
```

### 3. Selectors

- Gunakan text locators untuk Bahasa Indonesia: `text=/daftar|enroll/i`
- Fallback ke English jika perlu: `text=/daftar|enroll/i`
- Hindari CSS selectors yang fragile

### 4. Debugging

```bash
# Run with UI mode (best for debugging)
yarn test:e2e:ui

# Run with headed browser
yarn test:e2e:headed

# Run specific test file
npx playwright test auth.spec.ts

# Run specific test
npx playwright test auth.spec.ts -g "should register new user"

# Debug mode
npx playwright test --debug
```

## 📊 Reports

### HTML Report

Setelah test run, HTML report otomatis generated di `playwright-report/`:

```bash
# Open report
yarn test:e2e:report
```

Report includes:

- Test results (pass/fail)
- Screenshots on failure
- Videos on failure
- Execution traces
- Test timing

### CI/CD Integration

Test configuration sudah ready untuk CI dengan:

- Retries on CI: 2x
- Single worker on CI
- Screenshot & video on failure
- HTML report artifact

## 🐛 Troubleshooting

### Backend tidak running

E2E tests memerlukan backend running di port 8080.

**Solusi 1: PowerShell Script (Recommended)**

```powershell
# Di terminal terpisah, jalankan:
.\start-backend.ps1
```

**Solusi 2: Manual**

```bash
cd tempaskill-be
go run cmd/api/main.go
```

**Verify backend running:**

- Buka http://localhost:8080/api/v1/health
- Should return: `{"status":"healthy"}`

### Frontend tidak running

Playwright config sudah auto-start frontend via `webServer`, tapi bisa manual jika error:

**Solusi 1: PowerShell Script**

```powershell
# Di terminal terpisah:
.\start-frontend.ps1
```

**Solusi 2: Manual**

```bash
cd tempaskill-fe
yarn dev
```

**Verify frontend running:**

- Buka http://localhost:3000
- Should show landing page

### Database tidak accessible

```bash
# Check MySQL running
mysql -u root -p

# Create database jika belum ada
CREATE DATABASE tempaskill;

# Check backend config
cd tempaskill-be
cat .env
# Pastikan DB_HOST, DB_USER, DB_PASSWORD correct
```

### Port sudah dipakai

```bash
# Port 8080 conflict
# Edit tempaskill-be/.env atau backend config
PORT=8081

# Port 3000 conflict
# Edit playwright.config.ts
baseURL: 'http://localhost:3001'

# Dan start frontend di port lain
cd tempaskill-fe
PORT=3001 yarn dev
```

### Browser tidak terinstall

```bash
npx playwright install

# Atau install specific browser
npx playwright install chromium
npx playwright install firefox
npx playwright install webkit
```

### Test timeout

Increase timeout di test:

```typescript
test("slow test", async ({ page }) => {
  test.setTimeout(60000); // 60 seconds
  // test code
});
```

### Database conflicts

Jika test create user conflicts:

- Pastikan menggunakan `generateTestUser()` untuk unique emails
- Check backend tidak memiliki email validation yang terlalu strict

### CORS errors

Jika test fail dengan CORS errors:

- Check backend CORS config allows `http://localhost:3000`
- Pastikan backend running dengan proper CORS headers

### "Cannot connect to server" errors

```bash
# 1. Pastikan backend running
curl http://localhost:8080/api/v1/health

# 2. Pastikan frontend running
curl http://localhost:3000

# 3. Check firewall tidak block ports

# 4. Try restart servers:
# Ctrl+C di terminal backend/frontend
# Lalu start ulang dengan .\start-backend.ps1 & .\start-frontend.ps1
```

## 📈 Coverage

Test coverage meliputi:

- ✅ **Auth Flow**: Register, Login, Logout
- ✅ **Course Browsing**: List, Detail, Filter, Search
- ✅ **Enrollment**: Enroll, Unenroll
- ✅ **Lesson Viewer**: Navigation, Content, Progress
- ✅ **Dashboard**: Stats, Enrolled Courses, Continue Learning
- ✅ **Mobile Responsive**: Sidebar toggle, Touch UI
- ✅ **Bahasa Indonesia**: Semua UI text

## 🔄 Continuous Testing

### Watch Mode

```bash
# Tidak ada built-in watch mode, tapi bisa gunakan:
npx playwright test --watch
```

### Run on file change

```bash
# Gunakan nodemon atau similar tool
npx nodemon --watch e2e --exec "yarn test:e2e"
```

## 📚 Resources

- [Playwright Documentation](https://playwright.dev)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Debugging Guide](https://playwright.dev/docs/debug)
- [CI/CD Integration](https://playwright.dev/docs/ci)

## 🤝 Contributing

Ketika menambahkan test baru:

1. Gunakan helper functions dari `test-helpers.ts`
2. Test isolation - create new user per test
3. Use Indonesian text selectors
4. Add appropriate waits
5. Include error scenarios
6. Test mobile responsive jika applicable

## 📄 License

MIT License - Part of TempaSKill Platform
