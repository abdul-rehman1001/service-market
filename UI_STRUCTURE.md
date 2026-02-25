# 🎨 UI Component Structure & Design

## Provider Card Layout

```
┌──────────────────────────────────────────────┐
│  ┌────┐         Ahmed              ⭐ 4.9   │
│  │    │  Expert Plumber                      │
│  │    │  [64x64px avatar]                   │
│  │    │                                      │
│  └────┘                                      │
│                                             │
│  Specializing in pipe repairs, leak         │
│  fixes, and bathroom installations.         │
│                                             │
│  (138 reviews)       [View Profile →]       │
│                                             │
└──────────────────────────────────────────────┘
```

## Responsive Grid

```
Desktop (lg):      Tablet (md):        Mobile (sm):
┌─┐ ┌─┐ ┌─┐       ┌─┐ ┌─┐            ┌───┐
│ │ │ │ │ │       │ │ │ │            │   │
└─┘ └─┘ └─┘       └─┘ └─┘            └───┘
  3 columns         2 columns         1 column
```

## Component Hierarchy

```
FeaturedProviders (Client Component)
├── ProvidersHeader
│   └── Shows "Featured Providers" title
│       Shows active filters (if any)
│       Shows "Clear Filter" button
├── ProvidersAIBadge (conditional)
│   └── Shows count of filtered providers
├── Loading State (spinner + text)
├── Error State (red alert box)
├── ProvidersGrid
│   └── Map over providers
│       └── ProviderCard (repeated 6 times)
│           ├── Avatar Image
│           ├── Name + Rating Badge
│           ├── Role/Service Title
│           ├── Description (3-line clamp)
│           ├── Review Count
│           └── View Profile Link
└── ProvidersEmptyState (if no providers)
    └── Search icon + message
```

## Color Scheme

```css
/* Card Background */
background: white (#ffffff)
border-radius: 16px (rounded-2xl)
shadow: 0 1px 2px rgba(0,0,0,0.05)
hover-shadow: 0 20px 25px rgba(0,0,0,0.1)

/* Avatar Ring */
ring-color: #e5e7eb (gray-200)
ring-width: 1px

/* Star Badge */
background: #fef3c7 (yellow-50)
color: #a16207 (yellow-700)
icon-color: #facc15 (yellow-400)

/* Button */
background: #059669 (emerald-600)
color: #ffffff (white)
hover: #047857 (emerald-700)
border-radius: 8px (rounded-lg)
```

## Typography

```css
Provider Name: text-lg font-semibold text-slate-800
Role/Service: text-sm text-gray-500
Description: text-sm text-gray-600 (line-clamp-3)
Review Count: text-xs text-gray-400
Button Text: text-sm font-medium
```

## Spacing

```css
Card Padding: 24px (p-6)
Avatar Size: 64x64px (w-16 h-16)
Gap Between Avatar & Info: 16px (gap-4)
Top to Description: 16px (mt-4)
Bottom Section Gap: 16px (mt-4)

Card Gap in Grid: 24px (gap-6)
```

## Interactive States

```css
/* Card Hover */
transform: translateY(-4px) (hover:-translate-y-1)
shadow: enhanced
transition: all duration-300

/* Button Hover */
background: darker green
shadow: enhanced
transition: all duration-200

/* Star Icon */
fill-color: #facc15 (yellow-400)
stroke: none
```

## Component Files Breakdown

### 1. FeaturedProviders.tsx
**Purpose:** Main container component
**Features:**
- Data fetching from `/api/providers/top-rated`
- Loading state management
- Error handling
- Filter integration
- State management with useState/useEffect

**State:**
- `providers`: Provider[]
- `loading`: boolean
- `error`: string | null

### 2. ProviderCard.tsx
**Purpose:** Individual provider display
**Features:**
- Optimized Image component with Next.js
- Responsive avatar display
- Rating badge with star icon
- Description with text clamping
- Link navigation to provider profile
- Hover animations

**Props:**
- `provider`: Provider interface

### 3. ProvidersGrid.tsx
**Purpose:** Responsive grid container
**Features:**
- Tailwind CSS grid layout
- Responsive breakpoints (sm, md, lg)
- Gap spacing

**Props:**
- `providers`: Provider[]

**Classes:**
```css
grid gap-6                    /* Grid with 24px gap */
sm:grid-cols-1               /* Mobile: 1 column */
md:grid-cols-2               /* Tablet: 2 columns */
lg:grid-cols-3               /* Desktop: 3 columns */
```

### 4. ProvidersHeader.tsx
**Purpose:** Section header with filters
**Features:**
- Title display
- Active filter display
- Clear filter button
- Responsive layout

**Props:**
- `category`: string | null
- `subcategory`: string | null
- `onClear`: () => void

### 5. ProvidersEmptyState.tsx
**Purpose:** Fallback UI when no providers found
**Features:**
- Icon display
- Helpful message
- Centered layout

### 6. ProvidersAIBadge.tsx
**Purpose:** Filter count indicator
**Features:**
- Shows number of matching providers
- Only displays when filter active

### 7. useProviderFilter.ts
**Purpose:** Filter logic hook
**Features:**
- Category/subcategory filtering
- Window event listener for filter events
- State management

## Data Flow Through Components

```
API Response (JSON)
    ↓
useState(providers)
    ↓
useProviderFilter(providers)
    ↓
filtered providers list
    ↓
ProvidersGrid
    ↓
map() over filtered providers
    ↓
ProviderCard (for each provider)
    ↓
Display formatted data
```

## Accessibility Features

```html
<!-- Images have alt text -->
<Image alt={provider.name} />

<!-- Star icon meaningful -->
<Star className="..." />
⭐ {rating}

<!-- Buttons have text labels -->
<button>View Profile</button>

<!-- Semantic headings -->
<h2>Featured Providers</h2>
<h3>Provider Name</h3>

<!-- Text contrast -->
Colors meet WCAG AA standards
```

## Performance Optimizations

1. **Image Optimization:**
   - Using Next.js `Image` component
   - 64x64px sized images
   - Lazy loading

2. **Code Splitting:**
   - Client component with 'use client'
   - Separate component files
   - Dynamic imports possible

3. **Database Query:**
   - Single query to get providers
   - Includes relationships (user, services)
   - Filtered at database level
   - Limit 6 records

4. **CSS:**
   - Tailwind CSS (built-in optimizations)
   - Class pruning
   - No unused CSS

## Browser Support

- ✅ Chrome/Edge (latest 2 versions)
- ✅ Firefox (latest 2 versions)
- ✅ Safari (latest 2 versions)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Customization Points

### 1. Change grid columns:
```tsx
{/* Modify in ProvidersGrid.tsx */}
sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-4
```

### 2. Change card styling:
```tsx
{/* Modify in ProviderCard.tsx */}
rounded-2xl → rounded-lg (less rounded)
hover:-translate-y-1 → hover:-translate-y-2 (more lift)
```

### 3. Change colors:
```tsx
bg-emerald-600 → bg-blue-600 (button)
text-yellow-700 → text-orange-700 (rating badge)
```

### 4. Change limit:
```tsx
{/* In FeaturedProviders.tsx */}
await fetch("/api/providers/top-rated?limit=12")
```

### 5. Add more fields:
```tsx
{/* Update Provider interface in types.ts */}
export interface Provider {
  ...existing fields...
  certification?: string;
  yearsExperience?: number;
}
```

## Animation Details

```css
/* Card Hover Animation */
transition: transform 300ms cubic-bezier(0.4, 0, 0.2, 1), 
            box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1);

/* Button Hover Animation */
transition: background-color 200ms, box-shadow 200ms;

/* Loading Spinner */
animation: spin 1s linear infinite;
border: 4px solid
border-color: transparent #059669 transparent transparent;
```

## Responsive Behavior

```
Mobile (< 640px):
- 1 column layout
- Full width cards
- Padding: 1.5rem (24px)
- Avatar: 64x64px

Tablet (640px - 1024px):
- 2 column layout
- Cards fit with gap
- Padding: 1.5rem (24px)
- Avatar: 64x64px

Desktop (> 1024px):
- 3 column layout
- Max width: 80rem (1280px)
- Padding: 1.5rem (24px)
- Avatar: 64x64px
```

## Component Props Summary

```typescript
// FeaturedProviders
// No props (self-contained)

// ProviderCard
interface Props {
  provider: Provider;
}

// ProvidersGrid
interface Props {
  providers: Provider[];
}

// ProvidersHeader
interface Props {
  category: string | null;
  subcategory: string | null;
  onClear: () => void;
}

// ProvidersAIBadge
interface Props {
  count: number;
}

// ProvidersEmptyState
// No props needed

// useProviderFilter
function useProviderFilter(allProviders: Provider[]) {
  return {
    filtered: Provider[];
    active: { category: string | null; subcategory: string | null };
    clear: () => void;
  };
}
```

## Export Structure

```typescript
// Each component exports as default
export default function ProviderCard() { ... }
export default function FeaturedProviders() { ... }

// Hook exports as named export
export function useProviderFilter() { ... }

// Types export as named exports
export interface Provider { ... }
export interface Service { ... }
```
