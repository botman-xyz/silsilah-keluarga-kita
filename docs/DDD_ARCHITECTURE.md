# Domain-Driven Design (DDD) Architecture

## Overview

This project implements a comprehensive Domain-Driven Design architecture for the Family Tree application. The DDD approach ensures that the business logic is properly separated from infrastructure concerns, making the codebase maintainable, testable, and scalable.

## Architecture Layers

```
┌─────────────────────────────────────────────────┐
│           Presentation Layer                    │
│  (React Components, Hooks, UI Logic)           │
├─────────────────────────────────────────────────┤
│           Application Layer                     │
│  (Use Cases, Services, Orchestration)          │
├─────────────────────────────────────────────────┤
│              Domain Layer                       │
│  (Entities, Value Objects, Events, Services)   │
├─────────────────────────────────────────────────┤
│          Infrastructure Layer                   │
│  (Repositories, External Services, APIs)       │
└─────────────────────────────────────────────────┘
```

## Domain Layer (`src/domain/`)

### Entities (`src/domain/entities/`)

Core business entities representing the family tree domain:

- **UserProfile**: User account information
- **Family**: Family unit with owner and collaborators
- **Member**: Individual family member with relationships
- **TreeData**: Hierarchical tree structure for visualization

### Value Objects (`src/domain/valueObjects.ts`)

Immutable objects that represent domain concepts:

#### Date Value Objects
- **BirthDate**: Validates and encapsulates birth date with age calculation
- **DeathDate**: Validates death date format

#### ID Value Objects
- **MemberId**: Type-safe member identifier with validation
- **FamilyId**: Type-safe family identifier with validation

#### Family Value Objects
- **FamilyName**: Validates family name (1-100 chars, normalized comparison)
- **Collaborators**: Manages collaborator list with add/remove operations

#### Member Value Objects
- **Gender**: Enum-based gender (male/female/other) with type guards
- **MaritalStatus**: Enum-based status (single/married/divorced/widowed)
- **MemberName**: Validates member name (1-100 chars, normalized comparison)
- **SpouseIds**: Manages multiple spouse relationships with primary spouse
- **ParentIds**: Manages father/mother relationships

#### Media Value Objects
- **MediaCollection**: Manages photos and documents with type filtering

### Domain Events (`src/domain/events.ts`)

Event-driven communication between bounded contexts:

#### Family Events
- `FamilyCreatedEvent`: When a new family is created
- `FamilyUpdatedEvent`: When family details are modified
- `FamilyDeletedEvent`: When a family is deleted
- `CollaboratorAddedEvent`: When a collaborator joins a family
- `CollaboratorRemovedEvent`: When a collaborator leaves a family

#### Member Events
- `MemberCreatedEvent`: When a new member is added
- `MemberUpdatedEvent`: When member details are modified
- `MemberDeletedEvent`: When a member is removed
- `ParentAssignedEvent`: When parent relationships are established
- `SpouseAssignedEvent`: When spouse relationships are established
- `SpouseRemovedEvent`: When spouse relationships are dissolved

#### Event Infrastructure
- **EventBus**: Singleton event bus with priority-based handlers
- **DomainEventDispatcher**: Central dispatcher for domain events

### Domain Services (`src/domain/services/`)

Pure business logic without external dependencies:

#### RelationshipCalculator
- **buildRelationshipGraph**: Creates adjacency graph from family members
- **findRelationshipPath**: BFS algorithm to find shortest relationship path
- **describePath**: Converts path to human-readable relationship labels
- **calculateRelationship**: Main entry point for relationship calculation

Supported relationships:
- Orang yang sama (Same person)
- Suami/Istri (Spouse)
- Saudara Kandung (Sibling)
- Orang Tua (Parent)
- Kakek/Nenek (Grandparent)
- Paman/Bibi (Uncle/Aunt)
- Keponakan (Nephew/Niece)
- Sepupu (Cousin)

### Repository Interfaces (`src/domain/repositories/`)

Contracts that infrastructure must implement:

#### IMemberRepository
```typescript
interface IMemberRepository {
  getByFamilyId(familyId: string): Promise<Member[]>;
  getById(familyId: string, memberId: string): Promise<Member | null>;
  create(familyId: string, member: Omit<Member, 'id'>): Promise<Member>;
  update(familyId: string, memberId: string, data: Partial<Member>): Promise<void>;
  delete(familyId: string, memberId: string): Promise<void>;
  subscribeByFamilyId(familyId: string, callback: (members: Member[]) => void): () => void;
  batchUpdate(familyId: string, updates: Array<{ memberId: string; data: Partial<Member> }>): Promise<void>;
}
```

## Application Layer (`src/application/`)

### Services (`src/application/services/`)

Use case orchestration and business workflow:

#### MemberService
Orchestrates member-related operations:

**Basic CRUD Operations:**
- `getMembersByFamily()`: Retrieve all members in a family
- `getMember()`: Retrieve a single member
- `createMember()`: Create a new member
- `updateMember()`: Update member details
- `deleteMember()`: Delete a member

**Relationship Management:**
- `setParents()`: Set father/mother relationships
- `setSpouse()`: Set spouse relationship (supports multiple spouses)
- `removeSpouse()`: Remove spouse relationship

**Atomic Operations:**
- `setSpouseAtomic()`: Atomically set spouse for both members
- `removeSpouseAtomic()`: Atomically remove spouse from both members
- `setParentsAtomic()`: Atomically update parent-child relationships
- `deleteMemberAtomic()`: Atomically delete member and clear all references

**Real-time Subscriptions:**
- `subscribeToMembers()`: Subscribe to family member changes
- `subscribeToMembersByFamilies()`: Subscribe to multiple families

**Validation:**
- `findPotentialDuplicates()`: Find duplicate members by name/birth date
- `isDuplicateMember()`: Check if member already exists

## Infrastructure Layer (`src/infrastructure/`)

### Repositories (`src/infrastructure/repositories/`)

Concrete implementations of domain repository interfaces:

#### FirebaseMemberRepository
Implements `IMemberRepository` using Firebase Firestore:
- Real-time synchronization with Firestore
- Batch write operations for atomic updates
- Error handling and logging
- Timestamp management

## Presentation Layer (`src/presentation/`)

### Hooks (`src/presentation/hooks/`)

React hooks that consume application services:

- **useMembers**: Manages member state and operations
- **useFamilies**: Manages family state and operations
- **useAuth**: Manages authentication state
- **useTreeState**: Manages tree visualization state
- **useMemberUtils**: Utility functions for member operations
- **useSpouseSync**: Synchronizes spouse relationships

### Components (`src/features/`)

Feature-based component organization:

- **tree/**: Family tree visualization components
- **member/**: Member management components
- **family/**: Family management components
- **auth/**: Authentication components
- **ui/**: Shared UI components

## Key DDD Patterns Used

### 1. Value Objects
Immutable objects that encapsulate validation and business rules:
```typescript
const birthDate = new BirthDate('1990-01-01');
const age = birthDate.calculateAge(); // Pure function
```

### 2. Domain Events
Decoupled communication between bounded contexts:
```typescript
const event = new MemberCreatedEvent(memberId, familyId, name, gender);
await eventDispatcher.dispatchMemberEvent(event);
```

### 3. Repository Pattern
Abstract data access behind interfaces:
```typescript
// Domain defines interface
interface IMemberRepository { ... }

// Infrastructure implements
class FirebaseMemberRepository implements IMemberRepository { ... }
```

### 4. Domain Services
Pure business logic without side effects:
```typescript
const relationship = calculateRelationship(member1Id, member2Id, members);
```

### 5. Application Services
Orchestrate use cases and coordinate domain objects:
```typescript
await memberService.setSpouseAtomic(familyId, memberId, spouseId);
```

## Benefits of This Architecture

### 1. Separation of Concerns
- Domain logic is isolated from infrastructure
- Business rules are explicit and testable
- UI logic is separated from business logic

### 2. Testability
- Value objects can be unit tested in isolation
- Domain services have no external dependencies
- Application services can be tested with mocked repositories

### 3. Maintainability
- Changes to infrastructure don't affect domain logic
- New features can be added without modifying existing code
- Clear boundaries between different parts of the system

### 4. Scalability
- Event-driven architecture supports distributed systems
- Repository pattern allows switching data sources
- Domain services can be extracted to microservices

### 5. Type Safety
- Value objects enforce type constraints
- TypeScript ensures compile-time safety
- Reduces runtime errors

## Usage Examples

### Creating a Member with Value Objects
```typescript
import { MemberName, Gender, BirthDate } from '../domain/valueObjects';

const name = new MemberName('John Doe');
const gender = new Gender('male');
const birthDate = new BirthDate('1990-01-01');

const member = await memberService.createMember(familyId, {
  name: name.getValue(),
  gender: gender.getValue(),
  birthDate: birthDate.getValue(),
  // ...
});
```

### Calculating Relationships
```typescript
import { calculateRelationship } from '../domain/services/RelationshipCalculator';

const result = calculateRelationship(member1Id, member2Id, members);
console.log(result.label); // "Saudara Kandung" or "Kakek/Nenek"
```

### Publishing Domain Events
```typescript
import { eventDispatcher, MemberCreatedEvent } from '../domain/events';

const event = new MemberCreatedEvent(memberId, familyId, name, gender);
await eventDispatcher.dispatchMemberEvent(event);
```

### Subscribing to Events
```typescript
import { EventBus } from '../domain/events';

const eventBus = EventBus.getInstance();
const unsubscribe = eventBus.subscribe('MemberCreated', (event) => {
  console.log('New member created:', event);
});

// Later: unsubscribe();
```

## Best Practices

### 1. Keep Domain Pure
- No external dependencies in domain layer
- Use value objects for all domain concepts
- Publish events for side effects

### 2. Use Application Services for Orchestration
- Coordinate multiple domain objects
- Handle transactions
- Manage cross-cutting concerns

### 3. Implement Repositories in Infrastructure
- Keep data access logic separate
- Support multiple data sources
- Handle errors gracefully

### 4. Leverage TypeScript
- Use strict type checking
- Create branded types for IDs
- Use discriminated unions for events

### 5. Test Thoroughly
- Unit test value objects and domain services
- Integration test application services
- E2E test complete workflows

## Future Enhancements

### 1. CQRS (Command Query Responsibility Segregation)
- Separate read and write models
- Optimize queries for different use cases
- Support event sourcing

### 2. Event Sourcing
- Store all domain events
- Rebuild state from events
- Support temporal queries

### 3. Microservices
- Extract bounded contexts to services
- Use event bus for communication
- Support distributed transactions

### 4. Advanced Validation
- Schema validation with Zod
- Business rule validation
- Cross-entity validation

## Conclusion

This DDD architecture provides a solid foundation for the Family Tree application. The clear separation of concerns, type safety, and event-driven communication make the codebase maintainable, testable, and ready for future growth.

The architecture follows DDD principles while remaining practical and not over-engineered. It strikes a balance between complexity and maintainability, ensuring that the code remains understandable and modifiable as the project evolves.
