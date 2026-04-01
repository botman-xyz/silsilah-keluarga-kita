# DDD Architecture Diagram

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         PRESENTATION LAYER                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │
│  │   React     │  │   React     │  │   React     │  │   React     │  │
│  │ Components  │  │   Hooks     │  │   Views     │  │   Pages     │  │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        APPLICATION LAYER                                │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │                    Application Services                         │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │  │
│  │  │  Member     │  │  Family     │  │   Auth      │            │  │
│  │  │  Service    │  │  Service    │  │  Service    │            │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘            │  │
│  └─────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          DOMAIN LAYER                                   │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │                      Domain Services                            │  │
│  │  ┌─────────────────────────────────────────────────────────┐  │  │
│  │  │              RelationshipCalculator                      │  │  │
│  │  │  • buildRelationshipGraph()                             │  │  │
│  │  │  • findRelationshipPath()                               │  │  │
│  │  │  • describePath()                                       │  │  │
│  │  │  • calculateRelationship()                              │  │  │
│  │  └─────────────────────────────────────────────────────────┘  │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │                      Domain Events                              │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │  │
│  │  │   Family    │  │   Member    │  │Collaborator │            │  │
│  │  │   Events    │  │   Events    │  │   Events    │            │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘            │  │
│  │                                                                  │  │
│  │  ┌─────────────────────────────────────────────────────────┐  │  │
│  │  │              EventBus & Dispatcher                       │  │  │
│  │  └─────────────────────────────────────────────────────────┘  │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │                      Value Objects                              │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │  │
│  │  │   Date      │  │    ID       │  │   Name      │            │  │
│  │  │   VOs       │  │    VOs      │  │   VOs       │            │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘            │  │
│  │                                                                  │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │  │
│  │  │  Gender     │  │  Marital    │  │  Spouse     │            │  │
│  │  │             │  │  Status     │  │   IDs       │            │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘            │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │                      Entities                                   │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │  │
│  │  │   Member    │  │   Family    │  │   User      │            │  │
│  │  │             │  │             │  │   Profile   │            │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘            │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │                  Repository Interfaces                          │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │  │
│  │  │  IMember    │  │  IFamily    │  │  IAuth      │            │  │
│  │  │ Repository  │  │ Repository  │  │ Repository  │            │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘            │  │
│  └─────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                       INFRASTRUCTURE LAYER                              │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │                  Repository Implementations                     │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │  │
│  │  │  Firebase    │  │  Firebase   │  │  Firebase   │            │  │
│  │  │  Member      │  │  Family     │  │  Auth       │            │  │
│  │  │ Repository   │  │ Repository  │  │ Repository  │            │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘            │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │                  External Services                              │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │  │
│  │  │  Firebase    │  │  Firebase   │  │  Firebase   │            │  │
│  │  │  Firestore   │  │  Auth       │  │  Storage    │            │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘            │  │
│  └─────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

## Domain Model Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                            DOMAIN MODEL                                 │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐
│     Family      │
├─────────────────┤
│ id: FamilyId    │
│ name: FamilyName│
│ ownerId: string │
│ collaborators:  │
│   Collaborators │
│ createdAt: Date │
└────────┬────────┘
         │
         │ 1:N
         │
┌────────▼────────┐
│     Member      │
├─────────────────┤
│ id: MemberId    │
│ familyId: string│
│ name: MemberName│
│ gender: Gender  │
│ birthDate:      │
│   BirthDate     │
│ deathDate:      │
│   DeathDate     │
│ fatherId?:      │
│   MemberId      │
│ motherId?:      │
│   MemberId      │
│ spouseId?:      │
│   MemberId      │
│ spouseIds:      │
│   SpouseIds     │
│ maritalStatus:  │
│   MaritalStatus │
│ media:          │
│   MediaCollection│
└─────────────────┘

┌─────────────────┐
│   UserProfile   │
├─────────────────┤
│ uid: string     │
│ displayName:    │
│   string | null │
│ photoURL:       │
│   string | null │
│ createdAt: Date │
│ role: 'user' |  │
│       'admin'   │
└─────────────────┘
```

## Value Objects Hierarchy

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         VALUE OBJECTS                                   │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   Date VOs      │  │    ID VOs       │  │   Name VOs      │
├─────────────────┤  ├─────────────────┤  ├─────────────────┤
│ BirthDate       │  │ MemberId        │  │ FamilyName      │
│ • value: string │  │ • value: string │  │ • value: string │
│ • calculateAge()│  │ • equals()      │  │ • normalized()  │
│                 │  │ • toString()    │  │ • equals()      │
│ DeathDate       │  │                 │  │                 │
│ • value: string │  │ FamilyId        │  │ MemberName      │
│                 │  │ • value: string │  │ • value: string │
│                 │  │ • equals()      │  │ • normalized()  │
│                 │  │ • toString()    │  │ • equals()      │
└─────────────────┘  └─────────────────┘  └─────────────────┘

┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│  Enum VOs       │  │ Relationship VOs│  │ Collection VOs  │
├─────────────────┤  ├─────────────────┤  ├─────────────────┤
│ Gender          │  │ SpouseIds       │  │ Collaborators   │
│ • value:        │  │ • value: string[]│  │ • value: string[]│
│   'male' |      │  │ • primary?:     │  │ • add()         │
│   'female' |    │  │   string        │  │ • remove()      │
│   'other'       │  │ • add()         │  │ • has()         │
│ • isMale()      │  │ • remove()      │  │ • count()       │
│ • isFemale()    │  │ • hasSpouse()   │  │                 │
│                 │  │ • count()       │  │ MediaCollection │
│ MaritalStatus   │  │                 │  │ • items:        │
│ • value:        │  │ ParentIds       │  │   MediaItem[]   │
│   'single' |    │  │ • fatherId?:    │  │ • getImages()   │
│   'married' |   │  │   string        │  │ • getDocuments()│
│   'divorced' |  │  │ • motherId?:    │  │ • add()         │
│   'widowed'     │  │   string        │  │ • remove()      │
│ • isMarried()   │  │ • hasFather()   │  │ • count()       │
│ • isSingle()    │  │ • hasMother()   │  │                 │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

## Domain Events Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        DOMAIN EVENTS FLOW                               │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────┐
│   Action    │
│ (e.g.,      │
│  Create     │
│  Member)    │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│   Application   │
│   Service       │
│ (MemberService) │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│   Domain Event  │
│   Created       │
│ (MemberCreated  │
│  Event)         │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│   Event Bus     │
│ (EventBus.      │
│  getInstance()) │
└──────┬──────────┘
       │
       ├──────────────────────────────────────┐
       │                                      │
       ▼                                      ▼
┌─────────────────┐                    ┌─────────────────┐
│   Handler 1     │                    │   Handler 2     │
│ (Update UI)     │                    │ (Send Email)    │
└─────────────────┘                    └─────────────────┘
```

## Repository Pattern

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        REPOSITORY PATTERN                               │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐
│   Domain Layer  │
│                 │
│  ┌───────────┐  │
│  │ Interface  │  │
│  │ IMember    │  │
│  │ Repository │  │
│  └─────┬─────┘  │
└────────┼────────┘
         │
         │ implements
         │
┌────────▼────────┐
│ Infrastructure  │
│     Layer       │
│                 │
│  ┌───────────┐  │
│  │ Firebase   │  │
│  │ Member     │  │
│  │ Repository │  │
│  └───────────┘  │
└─────────────────┘
```

## Application Service Orchestration

```
┌─────────────────────────────────────────────────────────────────────────┐
│                  APPLICATION SERVICE ORCHESTRATION                      │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐
│   React Hook    │
│ (useMembers)    │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│   Application   │
│   Service       │
│ (MemberService) │
└──────┬──────────┘
       │
       ├──────────────────────────────────────┐
       │                                      │
       ▼                                      ▼
┌─────────────────┐                    ┌─────────────────┐
│   Repository    │                    │   Domain Event  │
│   (IMember      │                    │   Dispatcher    │
│   Repository)   │                    │                 │
└──────┬──────────┘                    └──────┬──────────┘
       │                                      │
       ▼                                      ▼
┌─────────────────┐                    ┌─────────────────┐
│   Firebase      │                    │   Event Bus     │
│   Firestore     │                    │                 │
└─────────────────┘                    └─────────────────┘
```

## Bounded Contexts

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         BOUNDED CONTEXTS                                │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   Family        │  │   Member        │  │   Auth          │
│   Context       │  │   Context       │  │   Context       │
├─────────────────┤  ├─────────────────┤  ├─────────────────┤
│ • Family        │  │ • Member        │  │ • UserProfile   │
│ • FamilyName    │  │ • MemberName    │  │ • AuthToken     │
│ • Collaborators │  │ • Gender        │  │ • Credentials   │
│ • FamilyEvents  │  │ • BirthDate     │  │ • AuthEvents    │
│                 │  │ • SpouseIds     │  │                 │
│                 │  │ • ParentIds     │  │                 │
│                 │  │ • MemberEvents  │  │                 │
└─────────────────┘  └─────────────────┘  └─────────────────┘
         │                    │                    │
         │                    │                    │
         └────────────────────┴────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │   Shared        │
                    │   Kernel        │
                    ├─────────────────┤
                    │ • Value Objects │
                    │ • Events        │
                    │ • Interfaces    │
                    └─────────────────┘
```

## Event-Driven Communication

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    EVENT-DRIVEN COMMUNICATION                           │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐
│ Member Service  │
│ (Application)   │
└──────┬──────────┘
       │
       │ creates
       ▼
┌─────────────────┐
│ MemberCreated   │
│ Event           │
└──────┬──────────┘
       │
       │ publishes
       ▼
┌─────────────────┐
│   Event Bus     │
└──────┬──────────┘
       │
       ├──────────────────────────────────────┐
       │                                      │
       ▼                                      ▼
┌─────────────────┐                    ┌─────────────────┐
│ UI Handler      │                    │ Analytics       │
│ (Update Tree)   │                    │ Handler         │
└─────────────────┘                    └─────────────────┘
```

## Testing Strategy

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         TESTING STRATEGY                                │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐
│   Unit Tests    │
│ (Value Objects, │
│  Domain Services│
│  Pure Logic)    │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│ Integration     │
│ Tests           │
│ (Application    │
│  Services with  │
│  Mocked         │
│  Repositories)  │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│ E2E Tests       │
│ (Complete       │
│  Workflows      │
│  with Real      │
│  Database)      │
└─────────────────┘
```

## Key Benefits

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         KEY BENEFITS                                    │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│  Separation     │  │  Testability    │  │  Maintainability│
│  of Concerns    │  │                 │  │                 │
├─────────────────┤  ├─────────────────┤  ├─────────────────┤
│ • Domain logic  │  │ • Value objects │  │ • Clear         │
│   isolated      │  │   can be unit   │  │   boundaries    │
│ • Infrastructure│  │   tested        │  │ • Easy to       │
│   separated     │  │ • Domain        │  │   modify        │
│ • UI logic      │  │   services have │  │ • New features  │
│   separated     │  │   no external   │  │   can be added  │
│                 │  │   dependencies  │  │   easily        │
└─────────────────┘  └─────────────────┘  └─────────────────┘

┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│  Scalability    │  │  Type Safety    │  │  Event-Driven   │
│                 │  │                 │  │                 │
├─────────────────┤  ├─────────────────┤  ├─────────────────┤
│ • Event-driven  │  │ • Value objects │  │ • Decoupled     │
│   architecture  │  │   enforce type  │  │   communication │
│ • Repository    │  │   constraints   │  │ • Supports      │
│   pattern       │  │ • TypeScript    │  │   distributed   │
│   allows        │  │   ensures       │  │   systems       │
│   switching     │  │   compile-time  │  │ • Easy to add   │
│   data sources  │  │   safety        │  │   new handlers  │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

---

**Note:** These diagrams illustrate the DDD architecture implemented in this project. The actual implementation may vary slightly based on specific requirements and constraints.
