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

# 🌌� Vision

> Build a digital genealogy platform that becomes the **source of truth for family identity**, enabling:

* Historical preservation of family heritage
* AI-driven insights and relationship inference
* Social + economic integration (future: cooperatives, DAOs, etc.)

This platform is designed to scale with the **SATU-RAYA ecosystem** — connecting with SatuKas (financial), SatuSuara (governance), and future integrations.

---

# 🔄 Application Workflow

```
[User Action]
     ↓
[React UI (Presentation Layer)]
     ↓
[Hook / Controller (useAppHandlers)]
     ↓
[Application Service (Use Case)]
     ↓
[Domain Logic (Entities, Services, Validation)]
     ↓
[Repository Interface (Abstraction)]
     ↓
[Infrastructure (Firebase)]
     ↓
[Response → UI Update via React State]
```

### Example Flow: Add Family Member

```
User clicks "Add Member"
  ↓
MemberForm.tsx (UI captures input)
  ↓
useAddMember() hook (presentation)
  ↓
MemberService.execute(command) [Application Layer]
  ↓
Validate via MemberValidation [Domain Layer]
  ↓
MemberRepository.save(entity) [Infrastructure Layer]
  ↓
Emit Domain Event: MemberCreated [Event Bus]
  ↓
React state update → Tree re-renders
```

---

# 📡 Domain Event Flow

```
[Domain Event]
      ↓
Event Bus (src/domain/events.ts)
      ↓
├── Update Family Statistics
├── Recalculate Relationships
├── Trigger AI Suggestions
├── Sync Real-time Updates (Firebase)
└── Invalidate Cache
```

### Core Domain Events

| Event | Purpose | Handlers |
|-------|---------|----------|
| `MemberCreated` | New member added | Update stats, recalculate tree |
| `MemberUpdated` | Member info changed | Refresh UI, invalidate cache |
| `MemberDeleted` | Member removed | Reindex relationships |
| `RelationshipAdded` | Parent-child/spouse linked | Recalculate degrees |
| `FamilyShared` | Family access granted | Sync permissions |
| `MediaUploaded` | Photo/document added | Update member gallery |

### Event Implementation

```typescript
// Domain publishes event
class Member extends Entity<MemberProps> {
  create(props: MemberProps): Member {
    const member = new Member(props);
    this.addDomainEvent(new MemberCreated(member));
    return member;
  }
}

// Infrastructure handles event
class FirebaseEventStore implements IEventStore {
  async publish(event: DomainEvent): Promise<void> {
    // Emit to Firebase or trigger Cloud Functions
  }
}
```

---

# 🧠 AI Context (Bounded Context)

AI is not just a feature — it's a **core bounded context** that deserves its own domain.

```
src/features/ai/
├── domain/                 # AI-specific business logic
│   ├── services/          # AI parsing, extraction
│   └── valueObjects/     # ParsedKK, ExtractedEntity
├── application/           # AI use cases
│   └── services/         # ScanKKService, InferRelationService
├── infrastructure/       # AI implementations
│   └── ai/              # Gemini API integration
└── presentation/         # AI UI components
    ├── ScanKKModal.tsx
    └── KinshipDictionaryModal.tsx
```

### AI Responsibilities

| Responsibility | Description |
|----------------|-------------|
| **KK OCR Parsing** | Extract text from Family Card images |
| **Entity Extraction** | Parse names, birth dates, relationships |
| **Relationship Inference** | Predict familial connections |
| **Data Normalization** | Standardize Indonesian naming conventions |
| **Kinship Suggestions** | Propose correct kinship terms |

---

# 🧠 State Management Strategy

```
┌─────────────────────────────────────────────────────────────────┐
│                        SERVER STATE                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │   Firebase  │  │  Firestore  │  │   Storage   │              │
│  │    Auth     │  │  (Source of │  │  (Media)    │              │
│  └─────────────┘  │   Truth)    │  └─────────────┘              │
│                   └─────────────┘                               │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│                      CLIENT STATE                                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │ React Hooks │  │  useState   │  │ useReducer  │              │
│  │ (useMembers│  │ (UI state)  │  │ (complex    │              │
│  │  useFamilies│  │             │  │  state)     │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│                      DERIVED STATE                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │  Tree Layout│  │   Family    │  │Relationship │              │
│  │  (dagre)    │  │  Statistics │  │ Calculator  │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
└─────────────────────────────────────────────────────────────────┘
```

### State Responsibilities

| Layer | Technology | Responsibility |
|-------|------------|-----------------|
| Server State | Firebase | Source of truth, persistence |
| Client State | React hooks | User interactions, form state |
| Derived State | Computed | Tree layout, statistics, relationships |
| Cache | Optional (Redis/Local) | Performance optimization |

---

# 🏢 Multi-Tenant Architecture (SaaS Ready)

This application is designed for **multi-tenant** usage — each family is a tenant with isolated data.

```
┌─────────────────────────────────────────────────────────────────┐
│                     TENANT: Family A                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │  Members    │  │Relationships│  │   Media     │              │
│  │  {familyId}│  │  {familyId} │  │  {familyId} │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
└─────────────────────────────────────────────────────────────────┘
                             │
                             │ (Firestore Rules enforce isolation)
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│                     TENANT: Family B                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │  Members    │  │Relationships│  │   Media     │              │
│  │  {familyId}│  │  {familyId} │  │  {familyId} │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
└─────────────────────────────────────────────────────────────────┘
```

### Tenant Isolation Rules

| Rule | Implementation |
|------|----------------|
| **Data Scoping** | All queries filtered by `familyId` |
| **Access Control** | Firestore rules enforce ownership |
| **Role-Based** | Owner, Admin, Editor, Viewer per family |
| **Tenant ID** | Embedded in all entity IDs |

### Firestore Collection Design

```
firestore
├── users/{uid}                    # User profiles
├── families/{familyId}            # Family metadata
│   ├── members/{memberId}        # Family members
│   ├── relationships/            # Member relationships
│   └── media/{mediaId}          # Media files
└── shared/{familyId}             # Cross-family sharing
```

---

# 🎯 Domain Design Principles (Anti-Anemic)

Our domain follows **rich domain model** principles — entities contain behavior, not just data.

### Core Principles

| Principle | Implementation |
|-----------|----------------|
| **Entities contain behavior** | `Member.create()`, `Member.update()` |
| **Value Objects for concepts** | `Name`, `BirthDate`, `Gender`, `Kinship` |
| **No primitive obsession** | Wrap primitives in VOs |
| **Domain enforces invariants** | Business rules in domain, not UI |

### Value Objects (src/domain/valueObjects.ts)

```typescript
// Instead of: string name, Date birthDate
// Use:

class Name {
  constructor(
    public readonly first: string,
    public readonly last?: string
  ) {
    if (!first || first.trim().length === 0) {
      throw new DomainError('INVALID_NAME');
    }
  }
}

class BirthDate {
  constructor(
    public readonly value: Date,
    public readonly isApproximate: boolean = false
  ) {
    if (value > new Date()) {
      throw new DomainError('INVALID_BIRTH_DATE');
    }
  }
}

class Gender {
  static readonly MALE = new Gender('male');
  static readonly FEMALE = new Gender('female');
  static readonly UNKNOWN = new Gender('unknown');
}
```

### Domain Invariants

| Invariant | Rule |
|-----------|------|
| No circular parent | A member cannot be their own ancestor |
| Valid age difference | Parent must be older than child (min 12 years) |
| Max parents | Maximum 2 parents per member |
| Valid spouse | Spouse must be of opposite gender or same-gender allowed |

---

# 🧪 Testing Strategy (Test Pyramid)

| Layer | Test Type | Coverage Target |
|-------|-----------|-----------------|
| **Domain** | Pure Unit Tests | 100% |
| **Application** | Use Case Tests | 90% |
| **Infrastructure** | Integration Tests | 80% |
| **UI** | Component + E2E Tests | 70% |

### Test Structure

```
__tests__/
├── domain/                     # Pure domain logic
│   ├── valueObjects.test.ts
│   ├── memberValidation.test.ts
│   └── relationshipCalculator.test.ts
│
├── application/                # Use case tests
│   ├── memberService.test.ts
│   └── familyService.test.ts
│
├── infrastructure/             # Integration with Firebase
│   ├── memberRepository.test.ts
│   └── firestoreEmulator.test.ts
│
e2e/                           # End-to-end flows
├── auth-login.spec.ts
├── comprehensive-flows.spec.ts
└── family-tree-zoom.spec.ts
```

### Running Tests

```bash
# Unit tests (Domain + Application)
npm run test:run

# Integration tests (with Firestore Emulator)
npm run test:integration

# E2E tests (with Playwright)
npm run test:e2e

# All tests with coverage
npm run test:coverage
```

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
