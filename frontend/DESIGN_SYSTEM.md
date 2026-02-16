# ServicePulse Design System

## Typography

- **Font family**: DM Sans (primary), Inter (fallback)
- **Display**: 2.5rem, line-height 1.15, letter-spacing -0.02em
- **H1**: 1.875rem, font-bold, tracking-tight
- **H2**: 1.5rem, font-semibold
- **H3**: 1.25rem, font-semibold
- **Body**: 1rem, line-height 1.6
- **Body small**: 0.875rem, line-height 1.5
- **Caption**: 0.75rem, line-height 1.4

## Color Palette

### Primary (Rwanda-inspired blue)
- 50: `#f0f6fc` (lightest)
- 600: `#3a71b8` (main CTA)
- 950: `#1b2942` (darkest)

### Neutral (grays)
- 50–950 scale for text, backgrounds, borders

### Semantic
- **Success**: Green (resolved, completed)
- **Warning**: Amber (pending, in progress)
- **Error**: Red (errors, validation)
- **Info**: Primary blue (in progress, informational)

## Spacing
- Base: 4px (Tailwind default)
- Card padding: 1.5rem (p-6)
- Section padding: 3rem–5rem (py-12 to py-20)
- Container: max 90–100rem with responsive side margins

## Components

### Buttons
- `btn`, `btn-primary`, `btn-secondary`, `btn-outline`, `btn-ghost`
- Rounded corners: `rounded-xl`
- Transitions: 200ms duration
- Hover: subtle shadow on primary

### Inputs
- `input` – rounded-xl, focus ring with primary
- `input-error` – error state with red border

### Cards
- `card` – with shadow and hover effect
- `card-flat` – no hover shadow (for stat cards)
- `auth-card` – for login/register

### Badges
- `badge-success` – green (resolved)
- `badge-warning` – amber (pending)
- `badge-info` – blue (in progress)

### Alerts
- `alert-error` – red background, border
- `alert-success` – green background, border

## UI Improvements Made

1. **Typography**: Switched to DM Sans + Inter, clear hierarchy (H1–H3, body, caption)
2. **Colors**: Neutral grays, semantic success/warning/error, consistent primary
3. **Layout**: Responsive container, improved padding and margins
4. **Buttons**: Rounded-xl, hover shadows, disabled states, transitions
5. **Inputs**: Focus ring, error states, consistent padding
6. **Cards**: Subtle shadow, hover effect, card-flat for stat cards
7. **Badges**: Unified status badges (success, warning, info)
8. **Responsiveness**: Mobile sidebar drawer, collapsible nav, responsive grids
9. **Loading states**: Spinner with label on dashboards
10. **Micro-interactions**: Hover transitions (200–350ms), fade-in for dropdowns
