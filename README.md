# Silsilah Keluarga Kita - Family Tree Application

<div align="center">
  <img width="800" height="400" alt="Family Tree App Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

A comprehensive family tree management application built with **React**, **Firebase**, and **Domain-Driven Design (DDD)** architecture. Manage your family genealogy, visualize family trees, and preserve family history for generations.

## 🚀 Features

### Core Functionality
- **Family Tree Management** - Create and manage multiple family trees
- **Member Management** - Add, edit, delete family members with detailed information
- **Relationship Tracking** - Track parent-child, spouse, and sibling relationships
- **Visual Tree Display** - Interactive family tree visualization with zoom/pan controls

### Advanced Features
- **AI-Powered Features** - Scan KK (Family Card) to extract family data using Gemini AI
- **Kinship Dictionary** - Comprehensive Indonesian kinship terminology
- **Media Support** - Upload photos and documents for family members
- **Export Options** - Export family data to PDF or image formats
- **Family Statistics** - View demographics and statistics

### Collaboration
- **Multi-User Support** - Share family trees with family members
- **Role-Based Access** - Owner, Admin, Editor, Viewer roles
- **Real-time Sync** - Changes sync across all devices

---

## 🏗️ Architecture

This project follows **Clean Architecture** with **Domain-Driven Design (DDD)** principles.

```
src/
├── domain/                    # 🎯 Domain Layer (Pure Business Logic)
│   ├── entities/             # Core entities (Member, Family, User)
│   ├── valueObjects.ts       # Immutable value objects with validation
│   ├── events.ts             # Domain events and event bus
│   ├── repositories/         # Repository interfaces (abstractions)
│   ├── services/             # Domain services (RelationshipCalculator)
│   └── validation/           # Domain validation rules
│
├── application/              # 🔧 Application Layer (Use Cases)
│   ├── services/             # Application services (MemberService, FamilyService)
│   ├── commands/             # Command definitions (CQRS)
│   ├── queries/              # Query definitions (CQRS)
│   └── handlers/             # Command and query handlers
│
├── infrastructure/           # 🏗️ Infrastructure Layer (External Concerns)
│   ├── repositories/         # Repository implementations (Firebase)
│   ├── events/               # Event store implementations
│   ├── cache/               # Caching implementations
│   └── services/             # External service implementations
│
├── presentation/             # 🎨 Presentation Layer (UI)
│   ├── hooks/                # React hooks for state and logic
│   ├── views/                # Page-level components
│   └── components/           # Shared UI components
│
└── features/                 # 🎛️ Feature Modules
    ├── family/              # Family tree visualization
    ├── member/              # Member management forms
    ├── auth/                # Authentication flow
    ├── export/              # Export functionality
    ├── tree/                # Tree rendering components
    ├── print/               # Print templates
    └── ai/                  # AI-powered features
```

### Layer Dependencies

```
UI (Presentation) → Application → Domain ← Infrastructure
                    (Use Cases)  (Entities)
```

**Important Rules:**
- **Domain Layer** MUST NOT depend on any external frameworks or infrastructure
- **Application Layer** depends only on Domain
- **Infrastructure Layer** implements Domain interfaces
- **Presentation Layer** depends on Application services

---

## 🛠️ Tech Stack

### Frontend
- **React 19** - UI framework
- **TypeScript 5.8** - Type-safe development
- **Vite 6** - Build tool
- **Tailwind CSS 4** - Styling
- **@xyflow/react** - Tree visualization (React Flow)
- **d3** / **dagre** - Tree layout algorithms
- **Recharts** - Data visualization
- **Lucide React** - Icons
- **date-fns** - Date utilities

### Backend (Firebase)
- **Firebase Auth** - Authentication
- **Cloud Firestore** - Database
- **Firebase Storage** - File storage

### AI Integration
- **Google Gemini API** - AI-powered features (KK scanning)

### Testing
- **Vitest** - Unit and integration testing
- **Playwright** - E2E testing
- **Storybook** - Component documentation

---

## 📋 Prerequisites

1. **Node.js** (v18+)
2. **pnpm** (recommended) or npm
3. **Firebase Project** - Set up at [firebase.google.com](https://firebase.google.com)

---

## 🚦 Getting Started

### 1. Install Dependencies

```bash
npm install
# or if using pnpm
pnpm install
```

### 2. Configure Environment

Copy the example environment file and add your configuration:

```bash
cp .env.example .env.local
```

Required variables:
- `GEMINI_API_KEY` - Your Google Gemini API key for AI features

### 3. Configure Firebase

1. Create a Firebase project at [firebase.google.com](https://firebase.google.com)
2. Enable **Authentication** (Google Sign-in)
3. Enable **Cloud Firestore**
4. Enable **Storage** (optional, for media uploads)
5. Download your config file and place it as `firebase-applet-config.json`

### 4. Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### 5. Build for Production

```bash
npm run build
```

---

## 🧪 Testing

### Unit & Integration Tests

```bash
# Run all tests
npm run test

# Run tests once (no watch mode)
npm run test:run

# Run with coverage
npm run test -- --coverage
```

### E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Run specific test file
npx playwright test e2e/family-tree-zoom.spec.ts
```

### Storybook

```bash
# Start Storybook
npm run storybook

# Build Storybook
npm run build-storybook
```

---

## 📁 Project Structure

### Core Files

| File | Description |
|------|-------------|
| `vite.config.ts` | Vite configuration |
| `tsconfig.json` | TypeScript configuration |
| `firebase.json` | Firebase CLI configuration |
| `firestore.rules` | Firestore security rules |
| `playwright.config.ts` | E2E test configuration |
| `vitest.config.ts` | Unit test configuration |

### Key Directories

| Directory | Description |
|-----------|-------------|
| `src/domain/` | Domain layer (entities, value objects, services) |
| `src/application/` | Application layer (use cases, handlers) |
| `src/infrastructure/` | Infrastructure (Firebase repositories) |
| `src/presentation/` | Presentation layer (hooks, views) |
| `src/features/` | Feature modules (family, member, auth, etc.) |
| `e2e/` | E2E tests |
| `__tests__/` | Unit and integration tests |
| `docs/` | Architecture documentation |

---

## 🔐 Security

### Firestore Rules

The project uses comprehensive Firestore security rules:

- **Default: DENY ALL** - All access is denied by default
- **Authentication Required** - All operations require authentication
- **Role-Based Access** - Users can only access their family data
- **Input Validation** - All data is validated before write operations

### Key Security Functions

```firestore
isAuthenticated()    // Check if user is logged in
isSelf(userId)       // Check if user owns the resource
isFamilyOwner(id)   // Check if user owns the family
canReadFamily(id)  // Check read permissions
canWriteFamily(id)  // Check write permissions
```

---

## 🤝 Contributing

### Development Workflow

1. **Follow DDD Principles**
   - Keep domain logic pure (no side effects)
   - Use value objects for domain concepts
   - Publish domain events for side effects

2. **Maintain Architecture**
   - Don't mix layers
   - Keep dependencies flowing inward
   - Use repository pattern for data access

3. **Write Tests**
   - Unit test value objects and domain services
   - Integration test application services
   - E2E test complete workflows

4. **Update Documentation**
   - Update relevant documentation when making changes
   - Add examples for new patterns

### Code Style

- Use **English** for code (variable names, comments)
- Use **clear naming** conventions
- Keep files under **300 lines**
- Prefer **small, focused functions**
- Follow **SOLID** principles

---

## 📚 Documentation

### Architecture Docs

- [DDD Architecture](./docs/DDD_ARCHITECTURE.md) - Complete DDD guide
- [DDD Quick Reference](./docs/DDD_QUICK_REFERENCE.md) - Quick reference
- [Clean Architecture](./docs/CLEAN_ARCHITECTURE.md) - Clean Architecture guide
- [DDD Next Steps](./docs/DDD_NEXT_STEPS.md) - Future enhancements

### API Reference

- **Domain Layer**: `src/domain/`
- **Application Services**: `src/application/services/`
- **Infrastructure**: `src/infrastructure/repositories/`
- **Presentation Hooks**: `src/presentation/hooks/`

---

## 🧩 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Type check |
| `npm run test` | Run tests in watch mode |
| `npm run test:run` | Run tests once |
| `npm run test:e2e` | Run E2E tests |
| `npm run storybook` | Start Storybook |

---

## 🔧 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | Yes* | Google Gemini API key for AI features |
| `APP_URL` | Auto* | Application URL (auto-injected in AI Studio) |

*Auto-injected in AI Studio environment

---

## 📄 License

This project is for educational and personal use. Modify and distribute as needed.

---

## 🙏 Acknowledgments

- [Firebase](https://firebase.google.com) - Backend-as-a-Service
- [React Flow](https://reactflow.dev) - Tree visualization
- [Google Gemini](https://gemini.google.com) - AI capabilities
- [Domain-Driven Design](https://dddcommunity.org) - Architecture principles

---

**Version:** 1.0.0  
**Last Updated:** 2026-04-08  
**Maintainer:** Family Tree Development Team
