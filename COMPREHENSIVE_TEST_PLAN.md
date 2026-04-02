# Comprehensive Test Plan - Silsilah Keluarga Kita

## Overview
This document outlines the comprehensive testing strategy for the Family Tree application, covering all features from domain logic to UI components.

## Test Coverage Summary

### ✅ Already Tested
1. **Family Tree Structure** - 5 generations with menantu relationships
2. **Edge Cases** - Member relationships, orphan members, circular references
3. **Member Repository** - Firebase operations, data structure validation
4. **Basic E2E** - Login flow, zoom controls

### 🔄 Needs Testing

## 1. Domain Layer Tests

### 1.1 Value Objects (`src/domain/valueObjects.ts`)
- [ ] Email validation
- [ ] Phone number validation
- [ ] Date validation (birthDate, deathDate, marriageDate)
- [ ] Gender validation
- [ ] Marital status validation

### 1.2 Domain Events (`src/domain/events.ts`)
- [ ] MemberCreated event
- [ ] MemberUpdated event
- [ ] MemberDeleted event
- [ ] FamilyCreated event
- [ ] FamilyUpdated event

### 1.3 Relationship Calculator (`src/domain/services/RelationshipCalculator.ts`)
- [ ] Calculate parent-child relationship
- [ ] Calculate spouse relationship
- [ ] Calculate sibling relationship
- [ ] Calculate grandparent relationship
- [ ] Calculate uncle/aunt relationship
- [ ] Calculate menantu (in-law) relationship
- [ ] Calculate cousin relationship

### 1.4 Member Validation (`src/domain/validation/MemberValidation.ts`)
- [ ] Required fields validation
- [ ] Date consistency validation (deathDate > birthDate)
- [ ] Circular reference prevention
- [ ] Self-reference prevention

## 2. Application Layer Tests

### 2.1 Command Handlers (`src/application/handlers/MemberCommandHandler.ts`)
- [ ] CreateMember command
- [ ] UpdateMember command
- [ ] DeleteMember command
- [ ] MoveMember command
- [ ] MergeFamilies command

### 2.2 Query Handlers (`src/application/handlers/MemberQueryHandler.ts`)
- [ ] GetMemberById query
- [ ] GetMembersByFamilyId query
- [ ] SearchMembers query
- [ ] GetFamilyTree query

### 2.3 Services
- [ ] MemberService (`src/application/services/MemberService.ts`)
  - [ ] CRUD operations
  - [ ] Relationship management
  - [ ] Duplicate detection
- [ ] FamilyService (`src/application/services/FamilyService.ts`)
  - [ ] Family CRUD
  - [ ] Collaborator management
  - [ ] Family merge
- [ ] ExportService (`src/application/services/ExportService.ts`)
  - [ ] Export to JSON
  - [ ] Import from JSON
  - [ ] Data validation

## 3. Infrastructure Layer Tests

### 3.1 Repositories
- [ ] FirebaseMemberRepository (`src/infrastructure/repositories/FirebaseMemberRepository.ts`)
  - [ ] CRUD operations
  - [ ] Query operations
  - [ ] Real-time subscriptions
- [ ] FirebaseFamilyRepository (`src/infrastructure/repositories/FirebaseFamilyRepository.ts`)
  - [ ] Family CRUD
  - [ ] Collaborator management
- [ ] FirebaseAuthRepository (`src/infrastructure/repositories/FirebaseAuthRepository.ts`)
  - [ ] Sign in with Google
  - [ ] Sign out
  - [ ] User profile management

### 3.2 Cache
- [ ] RedisCache (`src/infrastructure/cache/RedisCache.ts`)
  - [ ] Cache get/set
  - [ ] Cache invalidation
  - [ ] TTL management

### 3.3 Event Store
- [ ] FirebaseEventStore (`src/infrastructure/events/FirebaseEventStore.ts`)
  - [ ] Event persistence
  - [ ] Event retrieval
  - [ ] Event sourcing

## 4. Feature Tests

### 4.1 AI Features
- [ ] ScanKKModal (`src/features/ai/ScanKKModal.tsx`)
  - [ ] Image upload
  - [ ] OCR processing
  - [ ] Data extraction
  - [ ] Error handling
- [ ] KinshipDictionaryModal (`src/features/ai/KinshipDictionaryModal.tsx`)
  - [ ] Relationship lookup
  - [ ] Dictionary display

### 4.2 Export Features (`src/features/export/`)
- [ ] Export to JSON
- [ ] Export to PDF
- [ ] Import from JSON
- [ ] Data validation on import

### 4.3 Print Features (`src/features/print/`)
- [ ] Print layout generation
- [ ] Print preview
- [ ] Print execution

### 4.4 Tree Features (`src/features/tree/`)
- [ ] Tree building algorithm
- [ ] Tree layout calculation
- [ ] Node rendering
- [ ] Connection rendering
- [ ] Zoom controls
- [ ] Pan controls

### 4.5 Family Features (`src/features/family/`)
- [ ] FamilyForm component
- [ ] FamilyStats component
- [ ] FamilyStory component
- [ ] FamilyTimeline component
- [ ] GenTree component
- [ ] RelationshipCalculator component

### 4.6 Member Features (`src/features/member/`)
- [ ] MemberForm component
- [ ] MemberList component
- [ ] MemberDetailView component
- [ ] Member validation

## 5. Component Tests

### 5.1 Modals
- [ ] FamilyModal (`src/components/modals/FamilyModal.tsx`)
  - [ ] Create family
  - [ ] Edit family
  - [ ] Form validation
- [ ] ShareModal (`src/components/modals/ShareModal.tsx`)
  - [ ] Add collaborator
  - [ ] Remove collaborator
  - [ ] Share link generation
- [ ] SearchModal (`src/components/modals/SearchModal.tsx`)
  - [ ] Search functionality
  - [ ] Results display
  - [ ] Member selection
- [ ] MemberDetailModal (`src/components/modals/MemberDetailModal.tsx`)
  - [ ] Member info display
  - [ ] Edit action
  - [ ] Delete action
  - [ ] Move action
- [ ] MemberFormModal (`src/components/modals/MemberFormModal.tsx`)
  - [ ] Create member
  - [ ] Edit member
  - [ ] Form validation
  - [ ] Relationship selection
- [ ] HelpModal (`src/components/modals/HelpModal.tsx`)
  - [ ] Export action
  - [ ] Import action
  - [ ] Scan action
  - [ ] Delete all action
- [ ] DeleteFamilyConfirmModal (`src/components/modals/DeleteFamilyConfirmModal.tsx`)
  - [ ] Confirmation display
  - [ ] Delete action
- [ ] MergeFamiliesModal (`src/components/modals/MergeFamiliesModal.tsx`)
  - [ ] Family selection
  - [ ] Member selection
  - [ ] Merge action
- [ ] MoveMemberModal (`src/components/modals/MoveMemberModal.tsx`)
  - [ ] Family selection
  - [ ] Move action

### 5.2 UI Components
- [ ] Header (`src/features/ui/Header.tsx`)
  - [ ] Navigation
  - [ ] Actions (search, add, share, help, print)
  - [ ] Mobile menu toggle
- [ ] Sidebar (`src/features/ui/Sidebar.tsx`)
  - [ ] Family list
  - [ ] View mode selection
  - [ ] Member list
  - [ ] Actions (add, edit, delete, share, merge)

### 5.3 Presentation Views
- [ ] AuthView (`src/presentation/views/AuthView.tsx`)
  - [ ] Login display
  - [ ] First family creation
- [ ] MainContent (`src/presentation/views/MainContent.tsx`)
  - [ ] View mode switching
  - [ ] Content rendering

## 6. Hook Tests

### 6.1 Presentation Hooks
- [ ] useAuth (`src/presentation/hooks/useAuth.ts`)
  - [ ] Authentication state
  - [ ] Sign in/out functions
- [ ] useFamilies (`src/presentation/hooks/useFamilies.ts`)
  - [ ] Family list
  - [ ] Selected family
- [ ] useMembers (`src/presentation/hooks/useMembers.ts`)
  - [ ] Member list
  - [ ] Member filtering
- [ ] useAppHandlers (`src/presentation/hooks/useAppHandlers.ts`)
  - [ ] All handler functions
- [ ] useAppUtils (`src/presentation/hooks/useAppUtils.ts`)
  - [ ] Utility functions
- [ ] useMemberUtils (`src/presentation/hooks/useMemberUtils.ts`)
  - [ ] Member utility functions
- [ ] useSpouseSync (`src/presentation/hooks/useSpouseSync.ts`)
  - [ ] Spouse synchronization
- [ ] useTreeState (`src/presentation/hooks/useTreeState.ts`)
  - [ ] Tree state management

## 7. E2E Tests

### 7.1 Authentication Flow
- [ ] Login with Google
- [ ] Logout
- [ ] Session persistence

### 7.2 Family Management Flow
- [ ] Create family
- [ ] Edit family
- [ ] Delete family
- [ ] Share family
- [ ] Merge families

### 7.3 Member Management Flow
- [ ] Add member
- [ ] Edit member
- [ ] Delete member
- [ ] Move member between families
- [ ] Set relationships (parent, spouse)

### 7.4 Tree Navigation Flow
- [ ] View tree
- [ ] Zoom in/out
- [ ] Pan tree
- [ ] Toggle POV
- [ ] Click on member

### 7.5 Search Flow
- [ ] Open search
- [ ] Search for member
- [ ] Select member from results

### 7.6 Export/Import Flow
- [ ] Export data
- [ ] Import data
- [ ] Validate imported data

### 7.7 AI Features Flow
- [ ] Scan KK
- [ ] View kinship dictionary

## 8. Performance Tests

### 8.1 Large Dataset Handling
- [ ] Load 100+ members
- [ ] Render tree with 50+ nodes
- [ ] Search performance with large dataset

### 8.2 Real-time Updates
- [ ] Subscription performance
- [ ] Update propagation speed

## 9. Security Tests

### 9.1 Authentication
- [ ] Unauthorized access prevention
- [ ] Token validation
- [ ] Session management

### 9.2 Authorization
- [ ] Family owner permissions
- [ ] Collaborator permissions
- [ ] Data isolation between families

## 10. Accessibility Tests

### 10.1 Keyboard Navigation
- [ ] Tab navigation
- [ ] Enter/Space activation
- [ ] Escape to close modals

### 10.2 Screen Reader Support
- [ ] ARIA labels
- [ ] Semantic HTML
- [ ] Focus management

## Test Execution Strategy

### Unit Tests
- Run with: `pnpm test`
- Coverage target: 80%+
- Focus on domain and application layers

### Integration Tests
- Run with: `pnpm test:integration`
- Focus on infrastructure layer
- Use Firebase emulator

### E2E Tests
- Run with: `pnpm test:e2e`
- Focus on user flows
- Use Playwright

### Performance Tests
- Run with: `pnpm test:performance`
- Focus on large datasets
- Use benchmarking tools

## Test Data Management

### Test Fixtures
- Create reusable test data factories
- Maintain test data consistency
- Clean up after tests

### Mock Strategy
- Mock external services (Firebase, AI APIs)
- Mock browser APIs (localStorage, sessionStorage)
- Mock time-dependent functions

## Continuous Integration

### Pre-commit Hooks
- Run unit tests
- Run linter
- Run type checker

### CI Pipeline
- Run all tests
- Generate coverage report
- Run security audit
- Build verification

## Test Maintenance

### Regular Tasks
- Review and update test data
- Remove obsolete tests
- Add tests for new features
- Update mocks for API changes

### Documentation
- Document test patterns
- Document mock strategies
- Document test data factories
