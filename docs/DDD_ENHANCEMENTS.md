# DDD Enhancements Implementation Guide

## Overview

This document describes the Domain-Driven Design (DDD) enhancements implemented in the Family Tree application. These enhancements follow DDD principles to improve code organization, maintainability, and scalability.

## Implemented Enhancements

### 1. CQRS (Command Query Responsibility Segregation)

CQRS separates read and write operations into different models, allowing for optimized queries and commands.

#### Components

**Commands** (`src/application/commands/MemberCommands.ts`)
- `CreateMemberCommand`: Creates a new family member
- `UpdateMemberCommand`: Updates an existing member
- `DeleteMemberCommand`: Deletes a member
- `SetParentsCommand`: Sets parent relationships
- `SetSpouseCommand`: Sets spouse relationship
- `RemoveSpouseCommand`: Removes spouse relationship

**Queries** (`src/application/queries/MemberQueries.ts`)
- `GetMemberQuery`: Retrieves a single member
- `GetFamilyMembersQuery`: Retrieves all members in a family
- `GetMembersWithFiltersQuery`: Retrieves members with filters
- `SearchMembersQuery`: Searches members by name
- `GetFamilyStatsQuery`: Retrieves family statistics
- `GetMemberRelationshipsQuery`: Retrieves member relationships
- `GetFamilyTreeQuery`: Retrieves family tree data

**Command Handler** (`src/application/handlers/MemberCommandHandler.ts`)
- Handles all write operations
- Validates commands
- Publishes domain events
- Manages atomic operations

**Query Handler** (`src/application/handlers/MemberQueryHandler.ts`)
- Handles all read operations
- Uses read models for optimized queries
- Supports filtering and searching
- Projects domain models to read models

**Read Model** (`src/domain/repositories/IMemberReadModelRepository.ts`)
- `MemberReadModel`: Optimized data structure for read operations
- `FamilyStatsReadModel`: Family statistics data structure
- `IMemberReadModelRepository`: Repository interface for read models

**Read Model Repository** (`src/infrastructure/repositories/FirebaseMemberReadModelRepository.ts`)
- Firebase implementation of read model repository
- Supports filtering, searching, and statistics
- Caches family statistics

#### Benefits

1. **Performance**: Read models are optimized for queries
2. **Scalability**: Read and write operations can scale independently
3. **Flexibility**: Different data models for different use cases
4. **Maintainability**: Clear separation of concerns

### 2. Advanced Validation with Zod

Zod provides runtime type validation with TypeScript type inference.

#### Validation Schemas (`src/domain/validation/MemberValidation.ts`)

**Basic Schemas**
- `GenderSchema`: Validates gender values
- `MaritalStatusSchema`: Validates marital status values
- `MemberNameSchema`: Validates member names (1-100 characters)
- `BirthDateSchema`: Validates birth dates (YYYY-MM-DD format)
- `DeathDateSchema`: Validates death dates (YYYY-MM-DD format)
- `MarriageDateSchema`: Validates marriage dates (YYYY-MM-DD format)
- `BioSchema`: Validates bio text (max 1000 characters)
- `PhotoUrlSchema`: Validates photo URLs

**Command Schemas**
- `CreateMemberSchema`: Validates member creation data
- `UpdateMemberSchema`: Validates member update data
- `DeleteMemberSchema`: Validates member deletion data
- `SetParentsSchema`: Validates parent setting data
- `SetSpouseSchema`: Validates spouse setting data
- `RemoveSpouseSchema`: Validates spouse removal data

**Validation Rules**
- Death date must be after birth date
- Marriage date must be after birth date
- All required fields must be present
- String length limits are enforced
- Date formats are validated

#### Benefits

1. **Type Safety**: Runtime validation with TypeScript types
2. **Error Messages**: Clear, actionable error messages
3. **Reusability**: Schemas can be reused across the application
4. **Maintainability**: Validation rules are centralized

### 3. Caching Strategy

Caching improves performance by storing frequently accessed data in memory or Redis.

#### Cache Interface (`src/domain/cache/ICache.ts`)

**ICache Interface**
- `get(key)`: Retrieves a value from cache
- `set(key, value, ttlSeconds?)`: Stores a value in cache
- `delete(key)`: Removes a value from cache
- `clear()`: Clears all cache
- `has(key)`: Checks if key exists

**CacheKeyGenerator**
- `member(familyId, memberId)`: Generates cache key for member
- `familyMembers(familyId)`: Generates cache key for family members
- `familyStats(familyId)`: Generates cache key for family stats
- `search(familyId, searchTerm)`: Generates cache key for search results
- `filteredMembers(familyId, filters)`: Generates cache key for filtered members

#### Implementations

**RedisCache** (`src/infrastructure/cache/RedisCache.ts`)
- Redis-based cache implementation
- Supports TTL (Time To Live)
- Suitable for production environments

**InMemoryCache** (`src/infrastructure/cache/RedisCache.ts`)
- In-memory cache implementation
- Suitable for development/testing
- Automatic cleanup of expired entries

**CachedMemberRepository** (`src/infrastructure/repositories/CachedMemberRepository.ts`)
- Wraps existing member repository with caching
- Caches individual members and family members
- Invalidates cache on updates

#### Benefits

1. **Performance**: Faster data retrieval
2. **Reduced Load**: Less database queries
3. **Scalability**: Can handle more concurrent users
4. **Flexibility**: Multiple cache implementations

### 4. Event Sourcing

Event sourcing stores all changes as a sequence of events, allowing for complete audit trail and state reconstruction.

#### Event Store (`src/domain/events/EventStore.ts`)

**IEventStore Interface**
- `append(event, metadata?)`: Appends an event to the store
- `getEvents(aggregateId)`: Gets all events for an aggregate
- `getEventsSince(aggregateId, version)`: Gets events since a version
- `getEventsByType(eventType)`: Gets all events of a type
- `getEventsByAggregateType(aggregateType)`: Gets all events for aggregate type

**ISnapshotStore Interface**
- `getSnapshot(aggregateId)`: Gets snapshot for aggregate
- `saveSnapshot(snapshot)`: Saves snapshot for aggregate
- `deleteSnapshot(aggregateId)`: Deletes snapshot for aggregate

**StoredEvent**
- `id`: Unique event ID
- `aggregateId`: ID of the aggregate
- `aggregateType`: Type of aggregate (Family, Member)
- `eventType`: Type of event
- `eventData`: JSON serialized event data
- `version`: Event version
- `occurredAt`: When event occurred
- `metadata`: Additional metadata

#### Implementations

**FirebaseEventStore** (`src/infrastructure/events/FirebaseEventStore.ts`)
- Stores events in Firebase Firestore
- Supports querying by aggregate, type, and version
- Automatic version management

**FirebaseSnapshotStore** (`src/infrastructure/events/FirebaseSnapshotStore.ts`)
- Stores aggregate snapshots in Firebase Firestore
- Supports snapshot creation and retrieval
- Automatic snapshot management

**EventSourcedMemberRepository** (`src/infrastructure/repositories/EventSourcedMemberRepository.ts`)
- Uses event sourcing for member operations
- Reconstitutes state from events
- Supports snapshots for performance

#### Benefits

1. **Audit Trail**: Complete history of all changes
2. **Debugging**: Easy to trace how state evolved
3. **Flexibility**: Can rebuild state at any point in time
4. **Scalability**: Events can be processed asynchronously

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                        │
│  (React Components, Hooks, UI Logic)                       │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   Application Layer                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Commands   │  │   Queries    │  │   Handlers   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     Domain Layer                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Entities   │  │ Value Objects│  │    Events    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Repositories │  │   Services   │  │  Validation  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  Infrastructure Layer                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Repositories│  │  Event Store │  │    Cache     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

## Usage Examples

### CQRS Example

```typescript
// Create member using command
const command: CreateMemberCommand = {
  familyId: 'family-123',
  name: 'John Doe',
  gender: 'male',
  birthDate: '1990-01-01'
};

const member = await memberCommandHandler.handleCreateMember(command);

// Get member using query
const query: GetMemberQuery = {
  familyId: 'family-123',
  memberId: member.id
};

const memberReadModel = await memberQueryHandler.handleGetMember(query);
```

### Validation Example

```typescript
import { CreateMemberSchema } from '../domain/validation/MemberValidation';

// Validate member data
const result = CreateMemberSchema.safeParse({
  familyId: 'family-123',
  name: 'John Doe',
  gender: 'male',
  birthDate: '1990-01-01'
});

if (!result.success) {
  console.error(result.error.errors);
}
```

### Caching Example

```typescript
import { InMemoryCache } from '../infrastructure/cache/RedisCache';
import { CachedMemberRepository } from '../infrastructure/repositories/CachedMemberRepository';

// Create cache
const cache = new InMemoryCache<Member[]>({ defaultTtlSeconds: 300 });
const memberCache = new InMemoryCache<Member>({ defaultTtlSeconds: 300 });

// Create cached repository
const cachedRepository = new CachedMemberRepository(
  memberRepository,
  cache,
  memberCache
);

// Use cached repository
const members = await cachedRepository.getByFamilyId('family-123');
```

### Event Sourcing Example

```typescript
import { FirebaseEventStore } from '../infrastructure/events/FirebaseEventStore';
import { FirebaseSnapshotStore } from '../infrastructure/events/FirebaseSnapshotStore';
import { EventSourcedMemberRepository } from '../infrastructure/repositories/EventSourcedMemberRepository';

// Create event store
const eventStore = new FirebaseEventStore();
const snapshotStore = new FirebaseSnapshotStore<MemberState>();

// Create event sourced repository
const eventSourcedRepository = new EventSourcedMemberRepository(
  eventStore,
  snapshotStore
);

// Use event sourced repository
const member = await eventSourcedRepository.getById('family-123', 'member-456');
```

## Best Practices

### CQRS

1. **Separate Read and Write Models**: Keep read and write models separate
2. **Use Read Models for Queries**: Optimize read models for query performance
3. **Validate Commands**: Always validate commands before processing
4. **Publish Events**: Publish domain events for all state changes

### Validation

1. **Use Zod Schemas**: Define validation schemas for all data
2. **Centralize Validation**: Keep validation rules in one place
3. **Provide Clear Errors**: Use descriptive error messages
4. **Validate Early**: Validate data as early as possible

### Caching

1. **Cache Frequently Accessed Data**: Cache data that's read often
2. **Invalidate on Updates**: Invalidate cache when data changes
3. **Use Appropriate TTL**: Set appropriate time-to-live values
4. **Monitor Cache Hit Rate**: Track cache effectiveness

### Event Sourcing

1. **Store All Events**: Never delete events
2. **Use Snapshots**: Use snapshots for performance
3. **Version Events**: Version your events for compatibility
4. **Project Events**: Create projections for queries

## Future Enhancements

### 1. CQRS with Separate Databases

- Use different databases for read and write models
- Optimize read database for queries
- Optimize write database for transactions

### 2. Event Versioning

- Add version numbers to events
- Support event upcasting
- Handle event schema evolution

### 3. Distributed Caching

- Use Redis for distributed caching
- Support cache replication
- Implement cache warming

### 4. Event Replay

- Support replaying events to rebuild state
- Implement event replay tools
- Support selective replay

### 5. Projections

- Create projections for different query patterns
- Support real-time projections
- Implement projection rebuilding

## Conclusion

These DDD enhancements provide a solid foundation for building scalable, maintainable applications. The CQRS pattern separates concerns, validation ensures data integrity, caching improves performance, and event sourcing provides complete audit trails.

By following these patterns, the Family Tree application is well-positioned for future growth and evolution.
