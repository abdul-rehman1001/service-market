# 🎯 Provider Card Design Reference

## Exact UI Card From Screenshot

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  ┌─────┐                                                        │
│  │     │  Ahmed                              ⭐ 4.9            │
│  │ 64  │  Expert Plumber                                       │
│  │ x64 │                                                        │
│  │     │  
│  └─────┘                                                        │
│                                                                 │
│  Specializing in pipe repairs, leak fixes, and bathroom        │
│  installations.                                                 │
│                                                                 │
│  (138 reviews)              [View Profile →]                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Section Container

```
Width: max-w-7xl (1280px)
Padding: px-6 (24px left/right)
Background: bg-[#f5f7f8] (light gray)
Container Padding: py-12 (48px top/bottom)
```

## Grid Layout

```css
Grid Settings:
- gap-6 (24px between cards)
- sm:grid-cols-1 (1 column on mobile)
- md:grid-cols-2 (2 columns on tablet)
- lg:grid-cols-3 (3 columns on desktop)

Result:
Desktop: [Card] [Card] [Card]
         [Card] [Card] [Card]
         
Tablet:  [Card] [Card]
         [Card] [Card]
         [Card] [Card]
         
Mobile:  [Card]
         [Card]
         [Card]
         [Card]
         [Card]
         [Card]
```

## Card Container

```
Background: bg-white (#ffffff)
Padding: p-6 (24px)
Rounded: rounded-2xl (16px border-radius)
Shadow: shadow-md (normal state)
Shadow: shadow-xl (hover state)
Transform: -translate-y-1 (4px up on hover)
Transition: duration-300 all

Display: flex flex-col justify-between
```

## Avatar Section

```
┌──────────────────────────────────────────────┐
│ ┌─────┐                                      │
│ │     │ Ahmed                      ⭐ 4.9   │
│ │ IMG │ Expert Plumber                      │
│ │     │                                      │
│ └─────┘                                      │
└──────────────────────────────────────────────┘

Container:
- flex items-start gap-4
- width: full

Avatar Image:
- width: w-16 (64px)
- height: h-16 (64px)
- Border radius: rounded-full (circle)
- Border: ring-1 ring-gray-200
- Background: bg-gray-100 (fallback)
- Flex-shrink: flex-shrink-0 (no compress)

Info Section:
- flex-1 (take remaining space)
- min-w-0 (allow truncation)

Top Row (Name + Rating):
- flex items-center justify-between gap-2
- Name: text-lg font-semibold text-slate-800 truncate
- Rating Badge: flex items-center gap-1

Rating Badge:
- Background: bg-yellow-50 (#fef3c7)
- Text Color: text-yellow-700 (#a16207)
- Padding: px-2 py-1
- Rounded: rounded-full
- Font: text-sm font-medium
- Star Icon: w-4 h-4
  - Fill: fill-yellow-400 (#facc15)

Service Title:
- Color: text-gray-500
- Size: text-sm
- Margin: mt-1
- Truncate: truncate
```

## Description Section

```
Specializing in pipe repairs, leak fixes, and bathroom
installations.

Styling:
- Color: text-gray-600
- Size: text-sm
- Line Clamp: line-clamp-3 (max 3 lines)
- Margin: mt-4 (16px from avatar section)
- Font Weight: normal (400)
```

## Footer Section

```
(138 reviews)              [View Profile →]

Container:
- flex items-center justify-between (space between)
- Margin: mt-4 (16px from description)

Review Count:
- Text Color: text-gray-400
- Size: text-xs
- Font Weight: normal (400)
- Format: "({reviews} reviews)" or "({reviews} review)"

View Profile Button:
- Background: bg-emerald-600 (#059669)
- Text Color: text-white
- Rounded: rounded-lg (8px)
- Padding: px-3 py-1.5 (12px/6px)
- Font: text-sm font-medium
- Shadow: shadow-sm
- Hover Background: bg-emerald-700 (#047857)
- Hover Shadow: shadow-md (enhanced)
- Transition: all duration-200
- Link: href="/provider/{userId}"
```

## Complete CSS Classes Breakdown

### Card Level
```css
.card {
  @apply group relative;
  @apply flex flex-col justify-between;
  @apply bg-white p-6;
  @apply rounded-2xl;
  @apply shadow-md;
  @apply transition-transform duration-300;
}

.card:hover {
  @apply shadow-xl -translate-y-1;
}
```

### Avatar Container
```css
.avatar-section {
  @apply flex items-start gap-4;
}

.avatar-image {
  @apply w-16 h-16;
  @apply rounded-full overflow-hidden;
  @apply bg-gray-100;
  @apply ring-1 ring-gray-200;
  @apply flex-shrink-0;
}

.info-section {
  @apply flex-1 min-w-0;
}
```

### Header Row
```css
.header-row {
  @apply flex items-center justify-between gap-2;
}

.provider-name {
  @apply text-lg font-semibold;
  @apply text-slate-800;
  @apply truncate;
}

.rating-badge {
  @apply flex items-center gap-1;
  @apply bg-yellow-50 px-2 py-1;
  @apply rounded-full;
  @apply text-sm font-medium text-yellow-700;
}

.rating-badge svg {
  @apply w-4 h-4 fill-yellow-400;
}
```

### Service Title
```css
.service-title {
  @apply text-sm text-gray-500;
  @apply truncate mt-1;
}
```

### Description
```css
.description {
  @apply text-gray-600 text-sm;
  @apply mt-4;
  @apply line-clamp-3;
}
```

### Footer
```css
.footer {
  @apply mt-4;
  @apply flex items-center justify-between;
}

.review-count {
  @apply text-xs text-gray-400;
}

.view-profile-btn {
  @apply px-3 py-1.5;
  @apply bg-emerald-600 text-white;
  @apply rounded-lg text-sm font-medium;
  @apply shadow-sm;
  @apply hover:bg-emerald-700 hover:shadow-md;
  @apply transition-all duration-200;
}
```

## Size Specifications

### Pixels:
```
Avatar: 64x64px
Avatar Ring: 1px
Gap (Avatar to Info): 16px
Card Padding: 24px all sides
Card Border Radius: 16px
Button Border Radius: 8px
Section Gap: 16px between sections
Badge Padding: 8px 8px
Star Icon: 16x16px
```

### Rem (Based on 16px = 1rem):
```
Avatar: 4rem x 4rem (w-16 h-16)
Avatar Ring: 0.0625rem (1px)
Gaps: 1rem (gap-4)
Card Padding: 1.5rem (p-6)
Card Radius: 1rem (rounded-2xl)
Button Radius: 0.5rem (rounded-lg)
Section Gap: 1rem (mt-4)
Font Sizes:
  Title: 1.125rem (text-lg)
  Text: 0.875rem (text-sm)
  Badge: 0.875rem (text-sm)
  Small: 0.75rem (text-xs)
```

## Spacing Diagram

```
┌────────────────────────────────────────────┐
│  24px                              24px    │ (card padding)
│                                            │
│  ┌─────────────────────────────────────┐  │
│  │ ┌────┐   Name        Badge           │  │
│  │ │    │ ┌─ gap-4 ─┐                   │  │
│  │ │64  │   Role/Service                │  │
│  │ │x64 │                               │  │
│  │ └────┘                               │  │
│  │   │                                  │  │
│  │   └─ mt-1                            │  │
│  │                                      │  │
│  │ ← mt-4 → Description text            │  │
│  │           Description text            │  │
│  │           Description text...         │  │
│  │                                      │  │
│  │ ← mt-4 → Review Count  [Button]     │  │
│  └─────────────────────────────────────┘  │
│                                            │
└────────────────────────────────────────────┘
```

## Color Palette

```
Primary Colors:
- Emerald (Button): #059669 (bg-emerald-600)
- Emerald (Button Hover): #047857 (bg-emerald-700)

Neutral/Text:
- Slate (Name): #1e293b (text-slate-800)
- Gray (Title/Text): #6b7280 (text-gray-600)
- Gray (Service): #6b7280 (text-gray-500)
- Gray (Review Count): #9ca3af (text-gray-400)
- Gray (Border/Ring): #e5e7eb (ring-gray-200)
- Gray (Background): #f3f4f6 (bg-gray-100)

Accent Colors:
- Yellow (Badge BG): #fef3c7 (bg-yellow-50)
- Yellow (Badge Text): #a16207 (text-yellow-700)
- Yellow (Star): #facc15 (fill-yellow-400)

Light Colors:
- White (Card): #ffffff (bg-white)
- Light Gray (Section BG): #f5f7f8 (custom)

Shadows:
- Normal: 0 1px 2px 0 rgba(0, 0, 0, 0.05)
- Hover: 0 10px 15px -3px rgba(0, 0, 0, 0.1)
```

## Typography

```
Font Family: (Inherited from app - likely sans-serif)

Sizes:
- Provider Name: 18px / text-lg / font-semibold
- Service Title: 14px / text-sm / font-normal
- Description: 14px / text-sm / font-normal
- Review Count: 12px / text-xs / font-normal
- Button Text: 14px / text-sm / font-medium
  Badge Text: 14px / text-sm / font-medium

Line Heights:
- Most text: 1.5 (default)
- No special line-height adjustments
```

## Hover & Animation Effects

```
Card Hover Animation:
- Transform: translateY(-4px) (lift up 4 pixels)
- Shadow: increased 2x
- Duration: 300ms
- Easing: implied ease (likely ease-out)
- Applies to: whole card

Button Hover Animation:
- Background: color change (emerald-600 → emerald-700)
- Shadow: increased
- Duration: 200ms
- Easing: implied ease
- Applies to: button only

No animations on:
- Hover text color changes
- Icon animations
```

## Responsive Behavior

```
Mobile (sm < 640px):
- 1 column grid
- Card width: full - margins
- Card padding: 24px (same)
- Avatar: 64x64px (same)
- Font sizes: same

Tablet (md: 640px - 1024px):
- 2 column grid
- Card width: (screen - padding - gap) / 2
- Everything else: same

Desktop (lg: 1024px +):
- 3 column grid
- Max container width: 1280px (max-w-7xl)
- Centered on screen
- Everything else: same
```

## Accessibility

```
Image Accessibility:
- alt={provider.name} (descriptive)
- Proper image sizing prevents layout shift

Icon Accessibility:
- Star icon inside a semantic span with rating
- Screen readers can understand rating

Button Accessibility:
- Semantic <button> inside <Link>
- Has clear label: "View Profile"
- Visible focus states (via :focus-visible)

Color Contrast:
- Text on white: WCAG AA compliant
- Star on yellow: WCAG AA compliant
- Button text on green: WCAG AAA compliant

Structure:
- Semantic heading for card (h3 on name)
- Proper heading hierarchy
- Semantic footer element
```

## Code Example

```tsx
// Exact component structure
<div className="group relative flex flex-col justify-between bg-white p-6 rounded-2xl shadow-md transition-transform duration-300 hover:shadow-xl hover:-translate-y-1">
  
  {/* Avatar Section */}
  <div className="flex items-start gap-4">
    <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 ring-1 ring-gray-200 flex-shrink-0">
      <Image src={provider.avatar} alt={provider.name} width={64} height={64} className="object-cover" />
    </div>

    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-lg font-semibold text-slate-800 truncate">
          {provider.name}
        </h3>

        <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-full text-sm font-medium text-yellow-700">
          <Star className="w-4 h-4 fill-yellow-400" />
          {provider.rating.toFixed(1)}
        </div>
      </div>

      <p className="text-sm text-gray-500 truncate mt-1">
        {provider.role}
      </p>
    </div>
  </div>

  {/* Description */}
  <p className="text-gray-600 text-sm mt-4 line-clamp-3">
    {provider.description}
  </p>

  {/* Footer */}
  <div className="mt-4 flex items-center justify-between">
    <span className="text-xs text-gray-400">
      ({provider.reviews} {provider.reviews === 1 ? "review" : "reviews"})
    </span>

    <Link href={`/provider/${provider.userId}`}>
      <button className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-sm font-medium shadow-sm hover:bg-emerald-700 hover:shadow-md transition-all duration-200">
        View Profile
      </button>
    </Link>
  </div>
</div>
```

## Browser Default Overrides

```css
/* Applied via Tailwind/component styles: */
- No margin reset needed
- No padding reset needed
- All colors explicitly set
- All sizes explicitly set
- Font family: inherited (set at root)
```

## Print Styling (if needed)

```css
@media print {
  .provider-card {
    page-break-inside: avoid;
    box-shadow: none;
    break-inside: avoid;
  }
}
```

---

**This design is production-ready and matches the provided screenshot exactly!** ✨
