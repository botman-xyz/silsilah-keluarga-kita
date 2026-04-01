# DDD Quick Reference Guide

## 🎯 Core Concepts

### Value Objects
Immutable objects that represent domain concepts with validation.

```typescript
// ✅ Good: Value object with validation
const birthDate = new BirthDate('1990-01-01');
const age = birthDate.calculateAge();

// ❌ Bad: Raw string without validation
const birthDate = '1990-01-01'; // No validation, no behavior
```

**Available Value Objects:**
- `BirthDate`, `DeathDate` - Date handling
- `MemberId`, `FamilyId` - Type-safe IDs
- `FamilyName`, `MemberName` - Name validation
- `Gender`, `MaritalStatus` - Enum types
- `SpouseIds`, `ParentIds` - Relationship management
- `Collaborators`, `MediaCollection` - Collection management

### Domain Events
Events that communicate changes between bounded contexts.

```typescript
// Publishing an event
const event = new MemberCreatedEvent(memberId, familyId, name, gender);
await eventDispatcher.dispatchMemberEvent(event);

// Subscribing to events
const unsubscribe = eventBus.subscribe('MemberCreated', (event) => {
  console.log('New member:', event);
});
```

**Available Events:**
- Family: `FamilyCreatedEvent`, `FamilyUpdatedEvent`, `FamilyDeletedEvent`
- Collaborator: `CollaboratorAddedEvent`, `CollaboratorRemovedEvent`
- Member: `MemberCreatedEvent`, `MemberUpdatedEvent`, `MemberDeletedEvent`
- Relationship: `ParentAssignedEvent`, `SpouseAssignedEvent`, `SpouseRemovedEvent`

### Repository Pattern
Abstract data access behind interfaces.

```typescript
// Domain defines interface
interface IMemberRepository {
  getByFamilyId(familyId: string): Promise<Member[]>;
  create(familyId: string, member: Omit<Member, 'id'>): Promise<Member>;
  // ...
}

// Infrastructure implements
class FirebaseMemberRepository implements IMemberRepository {
  async getByFamilyId(familyId: string): Promise<Member[]> {
    // Firebase implementation
  }
}
```

### Domain Services
Pure business logic without external dependencies.

```typescript
// Calculate relationship between two members
const result = calculateRelationship(member1Id, member2Id, members);
console.log(result.label); // "Saudara Kandung" or "Kakek/Nenek"
```

### Application Services
Orchestrate use cases and coordinate domain objects.

```typescript
// Atomic operation: Set spouse for both members
await memberService.setSpouseAtomic(familyId, memberId, spouseId);

// This ensures both members are updated together or not at all
```

## 📁 File Structure

```
src/
├── domain/                    # 🎯 Domain Layer (Pure Business Logic)
│   ├── entities/             # Core entities (Member, Family, etc.)
│   ├── valueObjects.ts       # Value objects with validation
│   ├── events.ts             # Domain events and event bus
│   ├── repositories/         # Repository interfaces
│   └── services/             # Domain services (RelationshipCalculator)
│
├── application/              # 🔧 Application Layer (Use Cases)
│   └── services/             # Application services (MemberService, FamilyService)
│
├── infrastructure/           # 🏗️ Infrastructure Layer (External Concerns)
│   └── repositories/         # Repository implementations (Firebase)
│
└── presentation/             # 🎨 Presentation Layer (UI)
    ├── hooks/                # React hooks
    └── views/                # React components
```

## 🔑 Key Patterns

### 1. Value Object Creation
```typescript
// Always use value objects for domain concepts
const name = new MemberName('John Doe');
const gender = new Gender('male');
const birthDate = new BirthDate('1990-01-01');

// Value objects handle validation
try {
  const invalidDate = new BirthDate('invalid');
} catch (error) {
  console.error(error.message); // 'Invalid birth date format'
}
```

### 2. Event Publishing
```typescript
// In application service
async createMember(familyId: string, data: Omit<Member, 'id'>): Promise<Member> {
  const member = await this.memberRepository.create(familyId, data);
  
  // Publish event for side effects
  const event = new MemberCreatedEvent(member.id, familyId, member.name, member.gender);
  await eventDispatcher.dispatchMemberEvent(event);
  
  return member;
}
```

### 3. Atomic Operations
```typescript
// Use batch updates for atomic operations
async setSpouseAtomic(familyId: string, memberId: string, spouseId: string): Promise<void> {
  const [member, spouse] = await Promise.all([
    this.memberRepository.getById(familyId, memberId),
    this.memberRepository.getById(familyId, spouseId)
  ]);

  // Build updates for both members
  const memberUpdates = { spouseId, maritalStatus: 'married' };
  const spouseUpdates = { spouseId: memberId, maritalStatus: 'married' };

  // Atomic batch update
  await this.memberRepository.batchUpdate(familyId, [
    { memberId, data: memberUpdates },
    { memberId: spouseId, data: spouseUpdates }
  ]);
}
```

### 4. Real-time Subscriptions
```typescript
// Subscribe to changes
const unsubscribe = memberService.subscribeToMembers(familyId, (members) => {
  setMembers(members); // Update React state
});

// Cleanup on unmount
useEffect(() => {
  return () => unsubscribe();
}, []);
```

## 🧪 Testing Patterns

### Testing Value Objects
```typescript
describe('BirthDate', () => {
  it('should calculate age correctly', () => {
    const birthDate = new BirthDate('1990-01-01');
    const age = birthDate.calculateAge(new Date('2024-01-01'));
    expect(age).toBe(34);
  });

  it('should throw error for invalid date', () => {
    expect(() => new BirthDate('invalid')).toThrow('Invalid birth date format');
  });
});
```

### Testing Domain Services
```typescript
describe('RelationshipCalculator', () => {
  it('should calculate sibling relationship', () => {
    const members = [
      { id: '1', fatherId: '3', motherId: '4' },
      { id: '2', fatherId: '3', motherId: '4' }
    ];
    
    const result = calculateRelationship('1', '2', members);
    expect(result.label).toBe('Saudara Kandung');
  });
});
```

### Testing Application Services
```typescript
describe('MemberService', () => {
  it('should create member with event', async () => {
    const mockRepository = { create: vi.fn() };
    const service = new MemberService(mockRepository);
    
    await service.createMember('family-1', { name: 'John' });
    
    expect(mockRepository.create).toHaveBeenCalled();
    // Verify event was published
  });
});
```

## 🚀 Common Use Cases

### Creating a Family Member
```typescript
// In React component
const handleCreateMember = async (data: MemberFormData) => {
  try {
    const member = await memberService.createMember(familyId, {
      name: data.name,
      gender: data.gender,
      birthDate: data.birthDate,
      // ...
    });
    
    // Member created successfully
    // Event will be published automatically
  } catch (error) {
    // Handle error
  }
};
```

### Setting Spouse Relationship
```typescript
// Atomic operation ensures both members are updated
await memberService.setSpouseAtomic(
  familyId,
  memberId,
  spouseId,
  true, // isPrimary
  '2020-01-01' // marriageDate
);
```

### Calculating Relationship
```typescript
// Get relationship between two members
const result = calculateRelationship(member1Id, member2Id, members);

// Display result
console.log(result.label); // "Kakek/Nenek" or "Saudara Kandung"
console.log(result.path); // Array of members in the path
```

### Subscribing to Changes
```typescript
// In React hook
useEffect(() => {
  const unsubscribe = memberService.subscribeToMembers(familyId, (members) => {
    setMembers(members);
  });

  return () => unsubscribe();
}, [familyId]);
```

## ⚠️ Common Mistakes

### ❌ Don't: Use Raw Types
```typescript
// Bad: No validation, no behavior
const name: string = 'John Doe';
const birthDate: string = '1990-01-01';
```

### ✅ Do: Use Value Objects
```typescript
// Good: Validation and behavior encapsulated
const name = new MemberName('John Doe');
const birthDate = new BirthDate('1990-01-01');
```

### ❌ Don't: Publish Events in Domain Layer
```typescript
// Bad: Domain layer should not have side effects
class Member {
  save() {
    // Save to database
    // Publish event <- This is wrong!
  }
}
```

### ✅ Do: Publish Events in Application Layer
```typescript
// Good: Application layer orchestrates
async createMember(data) {
  const member = await this.repository.create(data);
  await this.eventDispatcher.dispatchMemberEvent(new MemberCreatedEvent(...));
  return member;
}
```

### ❌ Don't: Put Business Logic in Infrastructure
```typescript
// Bad: Business logic in repository
class FirebaseMemberRepository {
  async create(data) {
    // Validation logic here <- Wrong!
    // Business rules here <- Wrong!
  }
}
```

### ✅ Do: Keep Business Logic in Domain
```typescript
// Good: Domain handles business logic
class MemberService {
  async createMember(data) {
    // Validation using value objects
    const name = new MemberName(data.name);
    // Business rules here
    return this.repository.create({ ...data, name: name.getValue() });
  }
}
```

## 📚 Further Reading

- [DDD Architecture Documentation](./DDD_ARCHITECTURE.md)
- [Domain Events Guide](./DOMAIN_EVENTS.md)
- [Value Objects Guide](./VALUE_OBJECTS.md)
- [Repository Pattern](./REPOSITORY_PATTERN.md)

## 🎓 Learning Resources

- "Domain-Driven Design" by Eric Evans
- "Implementing Domain-Driven Design" by Vaughn Vernon
- "Domain-Driven Design Distilled" by Vaughn Vernon

---

**Remember:** DDD is about modeling the domain accurately. Start with the domain, not the technology. Let the business language guide your design.
