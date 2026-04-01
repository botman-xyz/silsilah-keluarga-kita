# Documentation Index

Welcome to the Family Tree application documentation. This directory contains comprehensive documentation for the project architecture, design patterns, and implementation details.

## 📚 Documentation Overview

### 🏗️ Architecture Documentation

#### [DDD Architecture](./DDD_ARCHITECTURE.md)
Comprehensive guide to the Domain-Driven Design architecture implemented in this project. Covers:
- Architecture layers (Domain, Application, Infrastructure, Presentation)
- Domain model (Entities, Value Objects, Domain Events)
- Repository pattern
- Domain services
- Application services
- Benefits and best practices

#### [DDD Quick Reference](./DDD_QUICK_REFERENCE.md)
Quick reference guide for developers working with DDD patterns. Includes:
- Core concepts (Value Objects, Domain Events, Repository Pattern)
- File structure overview
- Key patterns with code examples
- Common use cases
- Testing patterns
- Common mistakes to avoid

#### [DDD Architecture Diagram](./DDD_ARCHITECTURE_DIAGRAM.md)
Visual diagrams illustrating the DDD architecture:
- High-level architecture diagram
- Domain model diagram
- Value objects hierarchy
- Domain events flow
- Repository pattern
- Application service orchestration
- Bounded contexts
- Event-driven communication
- Testing strategy

#### [DDD Implementation Summary](./DDD_IMPLEMENTATION_SUMMARY.md)
Summary of the DDD implementation status:
- Completed components overview
- Architecture highlights
- Key metrics
- Learning resources
- Benefits achieved
- Future enhancements

### 🎯 Project Documentation

#### [Clean Architecture](./CLEAN_ARCHITECTURE.md)
Detailed guide to the clean architecture principles used in this project:
- Separation of concerns
- Dependency rule
- Layer responsibilities
- Testing strategies

## 🚀 Quick Start

### For New Developers

1. **Start with [DDD Quick Reference](./DDD_QUICK_REFERENCE.md)**
   - Understand core DDD concepts
   - Learn the file structure
   - See code examples

2. **Review [DDD Architecture](./DDD_ARCHITECTURE.md)**
   - Understand the overall architecture
   - Learn about each layer's responsibilities
   - Understand how layers interact

3. **Study [DDD Architecture Diagram](./DDD_ARCHITECTURE_DIAGRAM.md)**
   - Visualize the architecture
   - Understand data flow
   - See component relationships

4. **Check [DDD Implementation Summary](./DDD_IMPLEMENTATION_SUMMARY.md)**
   - See what's already implemented
   - Understand current status
   - Plan future work

### For Experienced Developers

1. **Review [DDD Architecture](./DDD_ARCHITECTURE.md)**
   - Understand design decisions
   - Learn about patterns used
   - See best practices

2. **Check [DDD Implementation Summary](./DDD_IMPLEMENTATION_SUMMARY.md)**
   - See implementation status
   - Understand metrics
   - Plan enhancements

## 🎓 Learning Path

### Beginner Level
1. Read [DDD Quick Reference](./DDD_QUICK_REFERENCE.md)
2. Explore `src/domain/valueObjects.ts` - See value objects in action
3. Explore `src/domain/events.ts` - See domain events in action
4. Review `src/domain/services/RelationshipCalculator.ts` - See domain services

### Intermediate Level
1. Read [DDD Architecture](./DDD_ARCHITECTURE.md)
2. Study [DDD Architecture Diagram](./DDD_ARCHITECTURE_DIAGRAM.md)
3. Review `src/application/services/MemberService.ts` - See application services
4. Review `src/infrastructure/repositories/` - See repository implementations

### Advanced Level
1. Read [DDD Implementation Summary](./DDD_IMPLEMENTATION_SUMMARY.md)
2. Study [Clean Architecture](./CLEAN_ARCHITECTURE.md)
3. Review all domain layer code
4. Plan and implement enhancements

## 📁 Project Structure

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

## 🔑 Key Concepts

### Value Objects
Immutable objects that represent domain concepts with validation:
```typescript
const birthDate = new BirthDate('1990-01-01');
const age = birthDate.calculateAge();
```

### Domain Events
Events that communicate changes between bounded contexts:
```typescript
const event = new MemberCreatedEvent(memberId, familyId, name, gender);
await eventDispatcher.dispatchMemberEvent(event);
```

### Repository Pattern
Abstract data access behind interfaces:
```typescript
interface IMemberRepository {
  getByFamilyId(familyId: string): Promise<Member[]>;
}
```

### Domain Services
Pure business logic without external dependencies:
```typescript
const result = calculateRelationship(member1Id, member2Id, members);
```

### Application Services
Use case orchestration and business workflow:
```typescript
await memberService.setSpouseAtomic(familyId, memberId, spouseId);
```

## 🧪 Testing

### Unit Tests
- Value objects: `src/domain/valueObjects.ts`
- Domain services: `src/domain/services/RelationshipCalculator.ts`

### Integration Tests
- Application services: `src/application/services/MemberService.ts`
- Repository implementations: `src/infrastructure/repositories/`

### E2E Tests
- Complete workflows: `e2e/`

## 📖 Additional Resources

### Books
- "Domain-Driven Design" by Eric Evans
- "Implementing Domain-Driven Design" by Vaughn Vernon
- "Domain-Driven Design Distilled" by Vaughn Vernon

### Online Resources
- [DDD Community](https://dddcommunity.org/)
- [Martin Fowler - DDD](https://martinfowler.com/bliki/DomainDrivenDesign.html)
- [Microsoft - DDD](https://docs.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/)

## 🤝 Contributing

When contributing to this project:

1. **Follow DDD Principles**
   - Keep domain logic pure
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
   - Keep diagrams up to date

## 📞 Support

For questions or issues:
1. Check the relevant documentation
2. Review code examples in the codebase
3. Consult the learning resources
4. Reach out to the development team

---

**Last Updated:** 2026-04-01
**Version:** 1.0.0
