# Clean Architecture Implementation

This project follows Clean Architecture principles with four distinct layers: **Domain → Application → Infrastructure → Presentation**.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            PRESENTATION LAYER                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │  src/presentation/hooks/    │    src/presentation/views/            │   │
│  │  ├── useAuth.ts              │    ├── AuthView.tsx                   │   │
│  │  ├── useFamilies.ts          │    └── MainContent.tsx               │   │
│  │  ├── useMembers.ts           │                                        │   │
│  │  └── useAppHandlers.ts       │    src/components/                   │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────────────────┤
│                            APPLICATION LAYER                                │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │  src/application/services/                                            │   │
│  │  ├── FamilyService.ts    - Use cases for family management          │   │
│  │  ├── MemberService.ts    - Use cases for member management           │   │
│  │  └── ExportService.ts    - Use cases for data export/import          │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────────────────┤
│                             DOMAIN LAYER                                    │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │  src/domain/                                                          │   │
│  │  ├── entities/          - Core business objects (no dependencies)   │   │
│  │  │   └── UserProfile, Family, Member, TreeData                        │   │
│  │  ├── repositories/      - Interface definitions (contracts)         │   │
│  │  │   ├── IFamilyRepository.ts                                        │   │
│  │  │   ├── IMemberRepository.ts                                        │   │
│  │  │   └── IAuthRepository.ts                                          │   │
│  │  ├── valueObjects.ts   - Immutable value types                      │   │
│  │  └── events.ts          - Domain events                             │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────────────────┤
│                          INFRASTRUCTURE LAYER                               │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │  src/infrastructure/                                                  │   │
│  │  ├── repositories/           - Concrete implementations              │   │
│  │  │   ├── FirebaseFamilyRepository.ts                                 │   │
│  │  │   ├── FirebaseMemberRepository.ts                                 │   │
│  │  │   └── FirebaseAuthRepository.ts                                   │   │
│  │  ├── services/              - Infrastructure services               │   │
│  │  │   └── ExportService.ts                                            │   │
│  │  └── container.ts           - Dependency Injection (DI)             │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Layer Responsibilities

### 1. Domain Layer (Innermost - No Dependencies)

The Domain layer contains **business logic** that is independent of any framework or external concern.

| File | Purpose |
|------|---------|
| [`entities/index.ts`](src/domain/entities/index.ts) | Core entity interfaces: `UserProfile`, `Family`, `Member`, `TreeData` |
| [`repositories/IFamilyRepository.ts`](src/domain/repositories/IFamilyRepository.ts) | Contract for family data operations |
| [`repositories/IMemberRepository.ts`](src/domain/repositories/IMemberRepository.ts) | Contract for member data operations |
| [`repositories/IAuthRepository.ts`](src/domain/repositories/IAuthRepository.ts) | Contract for authentication operations |
| [`valueObjects.ts`](src/domain/valueObjects.ts) | Immutable value types (validations, calculations) |
| [`events.ts`](src/domain/events.ts) | Domain events definitions |

**Key Principle**: Entities and repository interfaces have no knowledge of how data is stored or retrieved.

---

### 2. Application Layer (Use Cases)

The Application layer contains **use cases** that orchestrate the flow of data and coordinate entities.

| File | Purpose |
|------|---------|
| [`FamilyService.ts`](src/application/services/FamilyService.ts) | Family use cases: create, update, delete, collaborators |
| [`MemberService.ts`](src/application/services/MemberService.ts) | Member use cases: CRUD, relationships (parents, spouses) |
| [`ExportService.ts`](src/application/services/ExportService.ts) | Export/import use cases (pure business logic) |

**Key Principle**: Services depend on repository **interfaces** (contracts), not concrete implementations.

**Dependency Flow**:
```
Application Service → Repository Interface (Domain)
         ↓
Infrastructure Repository (implements interface)
```

---

### 3. Infrastructure Layer (External Concerns)

The Infrastructure layer contains **concrete implementations** of the domain interfaces.

| File | Purpose |
|------|---------|
| [`FirebaseFamilyRepository.ts`](src/infrastructure/repositories/FirebaseFamilyRepository.ts) | Firestore implementation for families |
| [`FirebaseMemberRepository.ts`](src/infrastructure/repositories/FirebaseMemberRepository.ts) | Firestore implementation for members |
| [`FirebaseAuthRepository.ts`](src/infrastructure/repositories/FirebaseAuthRepository.ts) | Firebase Auth implementation |
| [`container.ts`](src/infrastructure/container.ts) | Dependency Injection wiring |

**Key Principle**: Infrastructure layer is **pluggable** - you can replace Firebase with REST API, local storage, etc.

---

### 4. Presentation Layer (UI)

The Presentation layer contains **React components and hooks** that consume application services.

| File | Purpose |
|------|---------|
| [`presentation/hooks/useAuth.ts`](src/presentation/hooks/useAuth.ts) | Authentication state & actions |
| [`presentation/hooks/useFamilies.ts`](src/presentation/hooks/useFamilies.ts) | Family management state |
| [`presentation/hooks/useMembers.ts`](src/presentation/hooks/useMembers.ts) | Member management state |
| [`presentation/views/AuthView.tsx`](src/presentation/views/AuthView.tsx) | Login page |
| [`presentation/views/MainContent.tsx`](src/presentation/views/MainContent.tsx) | Main application view |

**Key Principle**: Presentation layer depends on Application services (via DI container), never directly on infrastructure.

---

## Dependency Flow

```
                    ┌─────────────────┐
                    │   Presentation  │
                    │  (Hooks/Views)  │
                    └────────┬────────┘
                             │ depends on
                             ▼
                    ┌─────────────────┐
                    │   Application   │
                    │  (Services)     │
                    └────────┬────────┘
                             │ depends on
                             ▼
                    ┌─────────────────┐
                    │     Domain      │
                    │ (Interfaces)    │
                    └────────┬────────┘
                             │ implemented by
                             ▼
                    ┌─────────────────┐
                    │  Infrastructure │
                    │ (Firebase impl) │
                    └─────────────────┘
```

---

## Dependency Injection Container

The [`container.ts`](src/infrastructure/container.ts) wires everything together:

```typescript
// Infrastructure - Repositories
const familyRepository = new FirebaseFamilyRepository();
const memberRepository = new FirebaseMemberRepository();
const authRepository = new FirebaseAuthRepository();

// Application Services (injecting repositories)
export const familyService = new FamilyService(familyRepository);
export const memberService = new MemberService(memberRepository);
export const exportService = new ExportService();
export const authService = authRepository;
```

---

## Benefits of This Architecture

1. **Separation of Concerns**: Each layer has a single responsibility
2. **Testability**: Domain and Application layers can be tested without Firebase/React
3. **Maintainability**: Changes in one layer don't affect others
4. **Pluggability**: Infrastructure can be swapped (e.g., Firebase → REST API)
5. **Code Reuse**: Application services can be used by different UI frameworks
6. **Clear Dependencies**: Always clear which layer depends on what

---

## Key Files Reference

| Path | Layer | Description |
|------|-------|-------------|
| [`src/domain/entities/index.ts`](src/domain/entities/index.ts) | Domain | Entity interfaces |
| [`src/domain/repositories/IFamilyRepository.ts`](src/domain/repositories/IFamilyRepository.ts) | Domain | Repository contract |
| [`src/application/services/FamilyService.ts`](src/application/services/FamilyService.ts) | Application | Use case implementation |
| [`src/infrastructure/repositories/FirebaseFamilyRepository.ts`](src/infrastructure/repositories/FirebaseFamilyRepository.ts) | Infrastructure | Concrete implementation |
| [`src/infrastructure/container.ts`](src/infrastructure/container.ts) | Infrastructure | DI container |
| [`src/presentation/hooks/useFamilies.ts`](src/presentation/hooks/useFamilies.ts) | Presentation | React hook consuming services |

---

## Refactoring Summary

### 1. Removed Redundant `src/hooks/` Directory

The project had duplicate hook implementations at both `src/hooks/` and `src/presentation/hooks/`. The `src/hooks/` files were just re-exporting from `src/presentation/hooks/`. These were consolidated - the presentation hooks are now the single source of truth.

### 2. Cleaned Up Export Feature

The export functionality had multiple locations:
- `src/application/services/ExportService.ts` - Pure business logic (Domain layer)
- `src/infrastructure/services/ExportService.ts` - Firebase-specific implementation
- `src/features/export/ExportService.tsx` - UI-specific exports (CSV, Text reports)

Now properly organized:
- **Domain Layer**: Application-level ExportService handles pure logic (JSON export/import)
- **Infrastructure Layer**: FirebaseExportService wraps the app service with Firebase-specific import logic
- **Presentation/Features**: ExportService.tsx handles UI-specific exports (CSV, Text reports)
- **Features Index**: `src/features/export/index.ts` orchestrates all exports for convenient access

### 3. Features Folder Analysis

The `src/features/` folder contains presentation-layer UI components organized by feature:
- `ai/` - AI features (Kinship dictionary, KK scanning)
- `auth/` - Authentication UI
- `export/` - Export functionality (orchestrates multiple layers)
- `family/` - Family-related components
- `member/` - Member-related components
- `print/` - Print functionality
- `tree/` - Family tree visualization
- `ui/` - Shared UI components

This is a valid pattern for organizing presentation components, but it's separate from the core Clean Architecture layers.
