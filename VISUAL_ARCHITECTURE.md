# 📊 Visual Architecture & Data Flow Diagrams

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Browser (Client)                        │
├────────────────────────────┬────────────────────────────────────┤
│                            │                                    │
│  ┌──────────────────┐  ┌────────────────────────────────────┐  │
│  │ React Component  │  │     React Hooks / State            │  │
│  │ FeaturedProviders│  │ - useState(providers, loading)     │  │
│  │                  │  │ - useEffect(fetch data)            │  │
│  │ - Fetch on mount │  │ - useProviderFilter(filter logic)  │  │
│  │ - Loading state  │  └────────────────────────────────────┘  │
│  │ - Error handling │                                           │
│  │ - Render grid    │                                           │
│  └────────┬─────────┘                                           │
│           │                                                     │
│           │ fetch("/api/providers/top-rated")                   │
│           │ HTTP GET Request                                    │
│           │                                                     │
└───────────┼─────────────────────────────────────────────────────┘
            │
            │ HTTP
            │
┌───────────┼─────────────────────────────────────────────────────┐
│           ▼                   Server (Backend)                   │
│  ┌─────────────────────────────────────────────────────┐        │
│  │        Next.js API Route Handler                    │        │
│  │    /api/providers/top-rated/route.ts               │        │
│  │                                                     │        │
│  │ - Validate query params                            │        │
│  │ - Call getTopRatedProviders(limit)                 │        │
│  │ - Format response with formatProviderForDisplay()  │        │
│  │ - Return JSON response                             │        │
│  └────────────────┬────────────────────────────────────┘        │
│                   │                                              │
│                   │ Call server function                        │
│                   ▼                                              │
│  ┌─────────────────────────────────────────────────────┐        │
│  │     src/lib/providers.ts                            │        │
│  │                                                     │        │
│  │ getTopRatedProviders(limit) {                       │        │
│  │   prisma.serviceProvider.findMany({                 │        │
│  │     where: {                                        │        │
│  │       verificationStatus: 'APPROVED'                │        │
│  │       isAvailable: true                             │        │
│  │     }                                               │        │
│  │     orderBy: [                                      │        │
│  │       { averageRating: 'desc' }                     │        │
│  │       { totalReviews: 'desc' }                      │        │
│  │     ]                                               │        │
│  │     take: limit                                     │        │
│  │     include: {                                      │        │
│  │       user: select { ... }                          │        │
│  │       services: { isActive: true }                  │        │
│  │     }                                               │        │
│  │   })                                                │        │
│  │ }                                                   │        │
│  └────────────────┬────────────────────────────────────┘        │
│                   │                                              │
│                   │ Database Query                               │
│                   ▼                                              │
│  ┌─────────────────────────────────────────────────────┐        │
│  │   PostgreSQL Database                               │        │
│  │                                                     │        │
│  │  SELECT sp.*, u.*, s.*                              │        │
│  │  FROM ServiceProvider sp                            │        │
│  │  JOIN User u ON sp.userId = u.id                    │        │
│  │  LEFT JOIN Service s ON sp.id = s.providerId        │        │
│  │  WHERE sp.verificationStatus = 'APPROVED'           │        │
│  │    AND sp.isAvailable = true                        │        │
│  │    AND s.isActive = true                            │        │
│  │  ORDER BY sp.averageRating DESC,                    │        │
│  │           sp.totalReviews DESC                      │        │
│  │  LIMIT 6                                            │        │
│  │                                                     │        │
│  │  Returns: Provider data + User data + Service data   │        │
│  └────────────────┬────────────────────────────────────┘        │
│                   │                                              │
└───────────────────┼──────────────────────────────────────────────┘
                    │
                    │ Query Results
                    │ (Raw data)
                    │
┌───────────────────┼──────────────────────────────────────────────┐
│                   │         Server Continues                     │
│                   ▼                                              │
│  ┌─────────────────────────────────────────────────────┐        │
│  │  formatProviderForDisplay(provider)                 │        │
│  │                                                     │        │
│  │  Input: Raw provider object from DB                │        │
│  │  ├─ firstName, lastName → Full name                │        │
│  │  ├─ profileImage → avatar URL                      │        │
│  │  ├─ averageRating → rating (parseFloat)            │        │
│  │  ├─ totalReviews → review count                    │        │
│  │  ├─ services[0].name → role (service title)        │        │
│  │  ├─ services[0].description → description          │        │
│  │  │                                                  │        │
│  │  Output: Formatted provider object                 │        │
│  │  {                                                  │        │
│  │    id, userId, name, role, rating,                │        │
│  │    reviews, description, avatar,                  │        │
│  │    mainService, allServices                        │        │
│  │  }                                                  │        │
│  └────────────────┬────────────────────────────────────┘        │
│                   │                                              │
│                   │ Array of formatted providers                │
│                   ▼                                              │
│  ┌─────────────────────────────────────────────────────┐        │
│  │  Return JSON Response (200 OK)                      │        │
│  │  {                                                  │        │
│  │    "success": true,                                 │        │
│  │    "data": [provider1, provider2, ...],             │        │
│  │    "count": 6                                       │        │
│  │  }                                                  │        │
│  └────────────────┬────────────────────────────────────┘        │
│                   │                                              │
└───────────────────┼──────────────────────────────────────────────┘
                    │
                    │ HTTP Response (JSON)
                    │
┌───────────────────┼──────────────────────────────────────────────┐
│                   ▼                  Browser (Client)             │
│                                                                   │
│  ┌───────────────────────────────────────────────────┐           │
│  │  Response received in React                       │           │
│  │  - JSON.parse() → data object                     │           │
│  │  - setProviders(data.data)                        │           │
│  │  - setLoading(false)                              │           │
│  │  - setError(null)                                 │           │
│  └───────────────────┬───────────────────────────────┘           │
│                     │                                             │
│                     │ State updated                               │
│                     ▼                                             │
│  ┌───────────────────────────────────────────────────┐           │
│  │  Component re-renders                             │           │
│  │  - Loading spinner removed                        │           │
│  │  - useProviderFilter() filters data                │           │
│  │  - ProvidersGrid renders                          │           │
│  └───────────────────┬───────────────────────────────┘           │
│                     │                                             │
│                     │ Grid renders                                │
│                     ▼                                             │
│  ┌───────────────────────────────────────────────────┐           │
│  │  ProvidersGrid Component                          │           │
│  │  └─ map(providers) → ProviderCard x 6             │           │
│  └───────────────────┬───────────────────────────────┘           │
│                     │                                             │
│                     │ Cards render                                │
│                     ▼                                             │
│  ┌───────────────────────────────────────────────────┐           │
│  │  ProviderCard (x6)                                │           │
│  │                                                   │           │
│  │  ┌─────────────────────────────────────────┐    │           │
│  │  │ Card 1: Ahmed - Expert Plumber          │    │           │
│  │  │ Rating: 4.9 ⭐ (138 reviews)             │    │           │
│  │  │ Description: Specializing in...          │    │           │
│  │  │ [View Profile]                           │    │           │
│  │  └─────────────────────────────────────────┘    │           │
│  │                                                   │           │
│  │  ┌─────────────────────────────────────────┐    │           │
│  │  │ Card 2: Ahsan - Professional Plumber    │    │           │
│  │  │ Rating: 5.0 ⭐ (95 reviews)              │    │           │
│  │  │ Description: Expert in sink repairs...  │    │           │
│  │  │ [View Profile]                           │    │           │
│  │  └─────────────────────────────────────────┘    │           │
│  │                                                   │           │
│  │  ... (more cards)                                │           │
│  │                                                   │           │
│  └───────────────────┬───────────────────────────────┘           │
│                     │                                             │
│                     ▼                                             │
│              [User sees cards!]                                   │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

## Component Hierarchy Tree

```
App/Layout
└── (site)
    └── home
        └── HomePage
            ├── SearchSection
            ├── Categories
            ├── FeaturedProviders ⭐ (Our implementation)
            │   ├── ProvidersHeader
            │   │   └── "Featured Providers" title + filter info
            │   ├── ProvidersAIBadge (conditional)
            │   │   └── Provider count badge
            │   ├── ProvidersGrid
            │   │   └── map() over providers
            │   │       ├── ProviderCard
            │   │       │   ├── Avatar Image
            │   │       │   ├── Name + Rating Badge
            │   │       │   ├── Service Title
            │   │       │   ├── Description
            │   │       │   ├── Review Count
            │   │       │   └── View Profile Link
            │   │       ├── ProviderCard
            │   │       ├── ProviderCard
            │   │       └── ... (up to 6)
            │   └── ProvidersEmptyState (conditional)
            │       └── Empty message + search icon
            └── Footer

Hook: useProviderFilter
└── Manages filter state
    └── Listens for filterProviders events
    └── Returns filtered & active state
```

## State Management Diagram

```
FeaturedProviders Component State:

┌───────────────────────────────────────────────────────────┐
│ useState(providers)                                       │
│                                                           │
│ Initial: []                                              │
│                                                           │
│ After Fetch:                                             │
│ [                                                         │
│   {                                                       │
│     id: "prov_1",                                        │
│     userId: "user_1",                                    │
│     name: "Ahmed Ali",                                   │
│     role: "Expert Plumber",                              │
│     rating: 4.9,                                         │
│     reviews: 138,                                        │
│     description: "Specializing in...",                   │
│     avatar: "/images/avatar1.png",                       │
│     mainService: { id, name, description },             │
│     allServices: [...]                                   │
│   },                                                      │
│   ... (up to 6 providers)                                │
│ ]                                                         │
└───────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────┐
│ useState(loading)                                         │
│                                                           │
│ Initial: true                                            │
│ During fetch: true                                       │
│ After fetch: false                                       │
│                                                           │
│ Usage: Show/hide loading spinner                         │
└───────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────┐
│ useState(error)                                           │
│                                                           │
│ Initial: null                                            │
│ On error: "Failed to load providers..."                  │
│ On success: null                                         │
│                                                           │
│ Usage: Show/hide error message                           │
└───────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────┐
│ useProviderFilter(providers)                              │
│                                                           │
│ Returns:                                                  │
│ {                                                         │
│   filtered: Provider[],  // Filtered by category         │
│   active: {                                              │
│     category: string | null,                             │
│     subcategory: string | null                           │
│   },                                                      │
│   clear: () => void      // Clear filter function        │
│ }                                                         │
│                                                           │
│ Usage: ProvidersGrid renders `filtered` not `providers`  │
└───────────────────────────────────────────────────────────┘
```

## Data Transformation Pipeline

```
Step 1: Raw Database Data
┌─────────────────────────────────────────────┐
│ ServiceProvider {                           │
│   id: "prov_123",                          │
│   userId: "user_456",                      │
│   businessName: "Ali Plumbing",            │
│   yearsOfExperience: 5,                    │
│   averageRating: 4.9 (Decimal),            │
│   totalReviews: 138,                       │
│   totalJobsCompleted: 142,                 │
│   isAvailable: true,                       │
│   verificationStatus: "APPROVED",          │
│   user: {                                   │
│     firstName: "Ahmed",                    │
│     lastName: "Ali",                       │
│     profileImage: "/img/avatar1.png",      │
│     bio: "Expert plumber with..."          │
│   },                                        │
│   services: [                               │
│     {                                       │
│       id: "svc_789",                       │
│       name: "Expert Plumber",              │
│       description: "Fix pipes, leak...",   │
│       isActive: true,                      │
│       minPrice: 500,                       │
│       maxPrice: 2000,                      │
│       ...more fields                       │
│     },                                      │
│     ...more services                       │
│   ]                                         │
│ }                                           │
└─────────────────────────────────────────────┘
        │
        │ formatProviderForDisplay()
        ▼

Step 2: Transform to Frontend Format
┌─────────────────────────────────────────────┐
│ Provider {                                  │
│   id: "prov_123",                          │
│   userId: "user_456",                      │
│   name: "Ahmed Ali",          ← Combined   │
│   role: "Expert Plumber",     ← From svc   │
│   rating: 4.9,               ← Parsed     │
│   reviews: 138,              ← Unchanged  │
│   description: "Fix pipes...",← From svc  │
│   avatar: "/img/avatar1.png", ← From user │
│   mainService: {                           │
│     id: "svc_789",                        │
│     name: "Expert Plumber",               │
│     description: "Fix pipes..."           │
│   },                                       │
│   allServices: [...]         ← Full list  │
│ }                                           │
└─────────────────────────────────────────────┘
        │
        │ Pack into response
        ▼

Step 3: JSON Response
┌─────────────────────────────────────────────┐
│ {                                           │
│   "success": true,                         │
│   "data": [                                │
│     {                                       │
│       id: "prov_123",                      │
│       userId: "user_456",                  │
│       name: "Ahmed Ali",                   │
│       role: "Expert Plumber",              │
│       rating: 4.9,                         │
│       reviews: 138,                        │
│       description: "Fix pipes...",         │
│       avatar: "/img/avatar1.png",          │
│       mainService: {...},                  │
│       allServices: [...]                   │
│     },                                      │
│     ... (up to 6 providers)                │
│   ],                                        │
│   "count": 6                               │
│ }                                           │
└─────────────────────────────────────────────┘
        │
        │ HTTP transmission
        ▼

Step 4: Browser receives JSON
┌─────────────────────────────────────────────┐
│ JSON.parse() → JavaScript object           │
│ setProviders(data.data)                    │
│ → React state updated                      │
└─────────────────────────────────────────────┘
        │
        │ Component re-renders
        ▼

Step 5: Rendered UI
┌─────────────────────────────────────────────┐
│ ┌─────────────────────────────────────┐    │
│ │ Ahmed                         ⭐ 4.9│    │
│ │ Expert Plumber                       │    │
│ │                                      │    │
│ │ Fix pipes, leak fixes, bathroom...  │    │
│ │                                      │    │
│ │ (138 reviews) [View Profile]        │    │
│ └─────────────────────────────────────┘    │
│                                             │
│ ┌─────────────────────────────────────┐    │
│ │ (More provider cards)               │    │
│ └─────────────────────────────────────┘    │
└─────────────────────────────────────────────┘
```

## Error Handling Flow

```
Fetch Request
    │
    ├─ Network Error
    │  └─ setError("Failed to load providers")
    │
    ├─ Invalid Response
    │  └─ setError("Failed to load providers")
    │
    ├─ API Returns Error (non-200 status)
    │  ├─ 400: "Invalid limit parameter"
    │  ├─ 500: "Failed to fetch top-rated providers"
    │
    └─ Success (200)
       ├─ JSON.parse() success
       ├─ setProviders(data.data)
       ├─ setLoading(false)
       └─ setError(null)
       
Display Logic:
    │
    ├─ loading === true
    │  └─ Show: <Spinner />
    │
    ├─ error !== null
    │  └─ Show: <ErrorAlert error={error} />
    │
    ├─ filtered.length > 0
    │  └─ Show: <ProvidersGrid providers={filtered} />
    │
    └─ filtered.length === 0
       └─ Show: <ProvidersEmptyState />
```

## Browser Rendering Timeline

```
Time    Event                              UI State
────────────────────────────────────────────────────────

t0      Component mounts                   ✓ Header renders
        ✓ ProvidersHeader renders          ✓ Heading "Featured Providers"
        ✓ Loading state = true             ✓ Spinner showing
        ✓ useEffect runs                   ✓ "Loading featured providers..."
        ✓ fetch() called

t1      Waiting for API response           Same as above
        (Network latency)

t2      API responds (200 OK)              Same as above
        ✓ setProviders(data)               (spinner still showing)
        ✓ setLoading(false)
        ✓ setError(null)

t3      Re-render triggered                ✓ Spinner removed
        ✓ ProvidersGrid renders            ✓ Grid appearing
        ✓ map(providers) runs              

t4      ProviderCard components render     ✓ First cards visible
        (per provider)                     

t5      Images start loading               ✓ Cards show text
                                           ✓ Avatar images loading

t6      Images finish loading              ✓ Full cards visible
        Final render complete              ✓ All 6 cards displayed
                                           ✓ User can interact
        
        ✓ Hover effects active
        ✓ Click handlers ready
        ✓ Links functional
```

## Database Query Execution

```
Query:
┌─────────────────────────────────────────────────────────┐
│ SELECT sp.*, u.firstName, u.lastName, u.profileImage,  │
│        u.bio, s.id, s.name, s.description              │
│ FROM ServiceProvider sp                                 │
│ INNER JOIN User u ON sp.userId = u.id                  │
│ LEFT JOIN Service s ON sp.id = s.providerId             │
│ WHERE sp.verificationStatus = 'APPROVED'                │
│   AND sp.isAvailable = true                             │
│   AND s.isActive = true                                 │
│ ORDER BY sp.averageRating DESC                          │
│          sp.totalReviews DESC                           │
│ LIMIT 6                                                 │
└─────────────────────────────────────────────────────────┘

Result Set Example:
┌─ Row 1 ─────────────────────────────────┐
│ Provider: Ahmed (APPROVED, available)    │
│ Rating: 4.9, Reviews: 138                │
│ Service: Expert Plumber                  │
└──────────────────────────────────────────┘

┌─ Row 2 ─────────────────────────────────┐
│ Provider: Ahsan                          │
│ Rating: 5.0, Reviews: 95                 │
│ Service: Professional Plumber            │
└──────────────────────────────────────────┘

... (more rows - max 6)

Performance Notes:
✓ Indexes on verificationStatus, isAvailable: Speeds WHERE
✓ Indexes on averageRating, totalReviews: Speeds ORDER BY
✓ Foreign keys optimized: Speeds JOINs
✓ LIMIT 6: Restricts result size
✓ Single query: No N+1 problem
✓ Typical query time: 5-50ms
```

---

This visual documentation helps understand the complete flow from user interaction to final rendered UI!
