# Pro Suite

A workspace of precision tools for the hobby detailer. Pro Suite combines time tracking, guided workflow routines, and statistics into a single fast, focused application with a dark/light theme.

## Tools

### Dashboard (`/`)

Overview landing page showing statistics — total completed vehicles and average completion time broken down by vehicle type, with a one-click demo data seeder.

### Pace Pro (`/pace-pro`)

Time-tracking and intake for the detailing bay.

- **Intake form** — Add vehicles with license plate (Swedish format), type (New / Used / Demo), condition (Excellent / Good / Fair / Poor), service type, and optional notes
- **Live timers** — Start, pause, resume, and complete timers with automatic net-work-time calculation
- **Status filtering** — Filter records by All, Pending, In Progress, On Break, or Completed
- **Inline notes editing** — Click any card to edit notes inline
- **Clear all** — Bulk delete all records with confirmation

### Flow Pro (`/flow-pro`)

Guided, timed routine workflows. Pick a service, run a step-by-step checklist with a high-precision timer, and review your performance.

- **Routine selection** — Choose from service-type-aligned routines
- **Step engine** — Step-by-step checklist with start, pause/resume, skip, and complete actions
- **High-precision timer** — Millisecond-accuracy live timer with requestAnimationFrame
- **Progress tracking** — Visual progress bar and step-count summary (Total, Pending, In Progress, On Break, Done)
- **Performance panel** — Sidebar showing routine name, total time vs estimate, completion rate, efficiency, and per-step breakdown

### Store Pro (`/store-pro`)

Placeholder for upcoming detailer inventory functionality.

## Unified Service Types

Both Pace Pro and Flow Pro share a single source of truth for service types, defined in `src/lib/service-types.ts`. Each service type has a unique color tag and a set of routine steps:

| Service Type      | Steps | Used By              |
| ------------------ | ----- | -------------------- |
| Full Detail       | 9     | Pace dropdown, Flow  |
| Ceramic Coating   | 6     | Pace dropdown, Flow  |
| Quick Detail      | 3     | Pace dropdown, Flow  |
| Delivery Prep     | 5     | Pace dropdown, Flow  |

Adding, renaming, or recoloring a service type in `src/lib/service-types.ts` automatically updates the Pace Pro dropdown, the vehicle card tag, the Flow Pro routine card, and the performance panel badge.

## Tech Stack

- **React 19** + **TypeScript** — UI framework with strict typing
- **Vite** — Build tool and dev server
- **TanStack Router** — File-based routing with auto code splitting
- **Tailwind CSS v4** — Utility-first styling
- **Zustand** — Lightweight state management for the Flow Pro session engine
- **Supabase** — PostgreSQL database with Row Level Security for vehicle record persistence
- **lucide-react** — Icon library
- **radix-ui** — Primitives for UI components (Slot)

## Database

Vehicle records are stored in a Supabase `vehicles` table with the following schema:

| Column              | Type        | Description                                                |
| ------------------- | ----------- | ---------------------------------------------------------- |
| `id`                | uuid        | Primary key                                                |
| `license_plate`     | text        | Vehicle license plate (Swedish format)                     |
| `type`              | text        | New, Used, or Demo                                         |
| `condition`         | text        | Excellent, Good, Fair, or Poor                             |
| `service_type`      | text        | Full Detail, Ceramic Coating, Quick Detail, or Delivery Prep |
| `status`            | text        | In Progress, On Break, or Completed                       |
| `notes`             | text        | Optional notes (nullable)                                  |
| `started_at`        | timestamptz | When the timer was started (nullable)                     |
| `break_started_at`  | timestamptz | When a break was started (nullable)                        |
| `net_work_seconds`  | integer     | Accumulated work time in seconds                           |
| `created_at`        | timestamptz | Record creation timestamp                                  |
| `updated_at`        | timestamptz | Record update timestamp                                    |

Row Level Security is enabled with per-user CRUD policies scoped via `auth.uid()`.

## Project Structure

```
src/
  routes/
    __root.tsx            # Root layout (sidebar + header + outlet)
    index.tsx             # Dashboard route (/)
    pace-pro.tsx          # Pace Pro route (/pace-pro)
    flow-pro.tsx          # Flow Pro route (/flow-pro)
    store-pro.tsx         # Store Pro route (/store-pro)
  components/
    app-sidebar.tsx       # Collapsible sidebar navigation
    site-header.tsx       # Header with theme toggle
    empty-state.tsx       # Reusable empty state card
    progress-bar.tsx      # Progress bar component
    theme-provider.tsx    # Dark/light/system theme context
    ui/
      Button.tsx          # Button (shadcn-style, CVA variants)
      Card.tsx            # Card components (shadcn-style)
      progress.tsx        # Progress primitive
    pace-pro/
      intake-form.tsx     # Vehicle intake form
      intake-records.tsx  # Vehicle records grid with filtering
      pace-stats.tsx      # Statistics sidebar with seed-data button
      vehicle-card.tsx    # Vehicle card with live timer and inline notes
    flow-pro/
      routine-selection.tsx  # Routine picker screen
      step-engine.tsx        # Active session step-by-step timer
      performance-panel.tsx  # Performance sidebar
  lib/
    supabase.ts           # Supabase client and Vehicle type definitions
    service-types.ts      # Shared service types, colors, and routine steps
    store.ts              # Zustand store for Flow Pro session state
    use-stats.ts          # Statistics hook with localStorage caching
    seed-generator.ts     # Demo data generator and seeder
    format.ts             # Time formatting utilities (duration, timer)
    navigation.ts         # Navigation items config
    utils.ts              # cn() class merge utility
  hooks/
    use-mobile.ts         # Mobile breakpoint hook
```

## Development

```bash
npm install         # Install dependencies
npm run dev         # Start the dev server
npm run build       # Production build
npm run typecheck   # TypeScript type checking
```

Supabase credentials are pre-configured in `.env`. No additional setup is required to connect to the database.
