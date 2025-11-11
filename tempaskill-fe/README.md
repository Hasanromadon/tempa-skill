# TempaSKill Frontend

**TempaSKill** adalah platform pembelajaran hybrid modern yang dibangun dengan Next.js 15, menyediakan pengalaman belajar yang komprehensif dengan konten berbasis teks dan sesi live interaktif.

## 🚀 Teknologi

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **UI Components**: Shadcn/ui + Radix UI
- **State Management**: React Query (server state) + Zustand (client state)
- **Forms**: React Hook Form + Zod validation
- **Content**: MDX untuk rendering konten kursus
- **Drag & Drop**: @dnd-kit untuk reordering
- **Testing**: Playwright (E2E)

## 📁 Struktur Proyek

```
tempaskill-fe/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Route group: login, register
│   │   ├── admin/             # Admin panel pages
│   │   ├── courses/           # Course catalog & detail
│   │   ├── dashboard/         # User dashboard
│   │   ├── payments/          # Payment pages
│   │   ├── profile/           # User profile
│   │   ├── sessions/          # Live sessions
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Homepage
│   ├── components/            # Reusable components
│   │   ├── ui/                # Shadcn/ui components
│   │   ├── common/            # Business components
│   │   ├── course/            # Course-specific components
│   │   ├── payment/           # Payment components
│   │   ├── review/            # Review components
│   │   └── admin/             # Admin components
│   ├── hooks/                 # Custom React hooks
│   │   ├── use-auth.ts        # Authentication
│   │   ├── use-courses.ts     # Course management
│   │   ├── use-lessons.ts     # Lesson handling
│   │   ├── use-progress.ts    # Progress tracking
│   │   ├── use-payment.ts     # Payment transactions
│   │   ├── use-reviews.ts     # Course reviews
│   │   └── use-sessions.ts    # Live sessions
│   ├── lib/                   # Utilities & configuration
│   │   ├── api-client.ts      # Axios instance
│   │   ├── constants.ts       # App constants & routes
│   │   ├── utils.ts           # Helper functions
│   │   └── validators.ts      # Zod schemas
│   ├── types/                 # TypeScript definitions
│   │   ├── api.ts             # API response types
│   │   └── common.ts          # Shared types
│   └── styles/                # Global styles
├── public/                    # Static assets
├── e2e/                       # End-to-end tests
└── docs/                      # Documentation
```

## 🛠️ Setup & Development

### Prerequisites

- Node.js 18+
- npm/yarn/pnpm
- Backend server running (see tempaskill-be README)

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

### Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=your_midtrans_client_key
```

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript check
npm test:e2e         # Run Playwright tests
npm test:e2e:ui      # Run tests with UI
```

## 🎨 Design System

### Brand Colors

- **Primary**: Orange (#ea580c) - `bg-orange-600`
- **Secondary**: Blue (#3b82f6) - `bg-blue-600`
- **Accent**: Gray scale untuk text dan borders

### Typography

- **Font Family**: Inter (via next/font)
- **Headings**: Bold weights untuk hierarchy
- **Body**: Regular weight untuk readability

### Components

Menggunakan Shadcn/ui sebagai base component library dengan custom styling untuk brand consistency.

## 🔧 Development Guidelines

### Code Organization

1. **Components**: Group by domain (course/, payment/, admin/)
2. **Hooks**: Custom hooks untuk business logic
3. **Types**: Centralized type definitions
4. **Constants**: Routes, API endpoints, messages

### State Management

- **Server State**: React Query untuk API data
- **Client State**: Zustand untuk auth state
- **Form State**: React Hook Form untuk forms

### API Integration

```typescript
// Using custom hooks
const { data: courses, isLoading } = useCourses();
const enrollMutation = useEnrollCourse();

// Direct API calls
import { apiClient } from "@/lib/api-client";
const response = await apiClient.get("/courses");
```

### Form Handling

```typescript
// React Hook Form + Zod
const schema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

const {
  register,
  handleSubmit,
  formState: { errors },
} = useForm({
  resolver: zodResolver(schema),
});
```

## 📱 Pages & Features

### Public Pages

- **Homepage** (`/`): Landing page dengan featured courses
- **Course Catalog** (`/courses`): Browse dan search courses
- **Course Detail** (`/courses/[slug]`): Course overview dan enrollment
- **Lesson Viewer** (`/courses/[slug]/lessons/[id]`): MDX content rendering

### Protected Pages

- **Dashboard** (`/dashboard`): User progress dan enrolled courses
- **Profile** (`/profile`): User profile management
- **Payments** (`/payments`): Payment history dan transactions

### Admin Pages

- **Admin Dashboard** (`/admin/dashboard`): Overview dan statistics
- **Course Management** (`/admin/courses`): CRUD operations untuk courses
- **Payment Management** (`/admin/payments`): Payment monitoring
- **Session Management** (`/admin/sessions`): Live session scheduling

## 🧪 Testing

### E2E Testing dengan Playwright

```bash
# Run all tests
npm run test:e2e

# Run with UI
npm run test:e2e:ui

# Run specific test
npx playwright test tests/auth.spec.ts
```

### Test Structure

```
e2e/
├── helpers/           # Test utilities
│   ├── test-helpers.ts # Login, register helpers
│   └── fixtures.ts    # Test data
├── tests/             # Test files
│   ├── auth.spec.ts   # Authentication tests
│   ├── courses.spec.ts # Course browsing tests
│   └── admin.spec.ts  # Admin functionality
└── playwright.config.ts
```

## 🚀 Deployment

### Build Process

```bash
# Build for production
npm run build

# Start production server
npm run start
```

### Environment Setup

- **Development**: Local development dengan hot reload
- **Staging**: Testing environment sebelum production
- **Production**: Optimized build dengan static generation

## 📚 Documentation

- [Frontend Architecture Guide](../docs/FRONTEND_ARCHITECTURE.md)
- [API Integration Guide](../docs/FRONTEND_API_GUIDE.md)
- [Component Library](../docs/COMPONENT_LIBRARY.md)
- [Testing Guide](../e2e/README.md)

## 🤝 Contributing

1. Follow the established code patterns
2. Use TypeScript strictly (no `any` types)
3. Run `npm run build` before committing
4. Add tests for new features
5. Update documentation as needed

## 📄 License

This project is part of TempaSKill platform.
