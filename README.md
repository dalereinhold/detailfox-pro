# DetailFox Pro

[![Open in Bolt](https://bolt.new/static/open-in-bolt.svg)](https://bolt.new/~/github-voes1cv8)

A collection of lightweight, precision tools for the hobby detailer. DetailFox combines time tracking, intake management, and guided workflow routines into a single fast, focused application.

## Tools

### Pace Pro (DetailPace Pro)

Time-tracking and intake for the detailing bay. Log vehicles, run live timers, and watch your stats update in real time.

- **Intake form** — Add vehicles with license plate, type (New / Used / Demo), condition (Excellent / Good / Fair / Poor), service type, and optional notes
- **Live timers** — Start, pause, resume, and complete timers with automatic net-work-time calculation
- **Status filtering** — Filter records by All, Pending, In Progress, On Break, or Completed
- **Statistics sidebar** — Total processed count and average completion time broken down by vehicle type, with localStorage caching for instant loads
- **Demo data seeding** — Generate 20 randomized vehicle records with a single click for testing

### Flow Pro (DetailFlow Pro)

Guided, timed routine workflows. Pick a service, run a step-by-step checklist with a high-precision timer, and review your performance.

- **Routine selection** — Choose from service-type-aligned routines (see below)
- **Step engine** — Step-by-step checklist with start, pause/resume, skip, and complete actions
- **High-precision timer** — Millisecond-accuracy live timer with requestAnimationFrame
- **Progress tracking** — Visual progress bar and step-count summary (Total, Pending, In Progress, On Break, Done)
- **Performance panel** — Sidebar showing routine name, step completion stats, and timing breakdown

## Unified Service Types

Both Pace and Flow share a single source of truth for service types, defined in `src/lib/serviceTypes.ts`. Each service type has a unique color that is used consistently across both tools:

| Service Type      | Color    | Pace Tag | Flow Routine Border |
| ----------------- | -------- | -------- | ------------------- |
| Full Detail       | Sky      | Yes      | Yes                 |
| Ceramic Coating   | Emerald  | Yes      | Yes                 |
| Quick Detail      | Amber    | Yes      | Yes                 |
| Delivery Prep     | Rose     | Yes      | Yes                 |

- **Pace** — The intake dropdown and vehicle card service-type tags pull from the shared module
- **Flow** — Routines are derived directly from the shared service types, so every routine matches a Pace service type by name, ID, color, and step definition

Adding, renaming, or recoloring a service type in `src/lib/serviceTypes.ts` automatically updates the Pace dropdown, the vehicle card tag, the Flow routine card, and the Flow performance panel badge.

## Tech Stack

- **React 18** + **TypeScript** — UI framework with strict typing
- **Vite** — Build tool and dev server
- **Tailwind CSS** — Utility-first styling with a custom design system (8px spacing, 6+ color ramps, no purple/indigo hues)
- **Zustand** — Lightweight state management for the Flow session engine
- **Supabase** — PostgreSQL database with Row Level Security for vehicle record persistence
- **lucide-react** — Icon library

## Database

Vehicle records are stored in a Supabase `vehicles` table with the following schema:

| Column              | Type      | Description                                      |
| ------------------- | --------- | ------------------------------------------------ |
| `id`                | uuid      | Primary key                                      |
| `license_plate`     | text      | Vehicle license plate                            |
| `type`              | text      | New, Used, or Demo                               |
| `condition`         | text      | Excellent, Good, Fair, or Poor                   |
| `service_type`      | text      | Full Detail, Ceramic Coating, Quick Detail, or Delivery Prep |
| `status`            | text      | In Progress, On Break, or Completed             |
| `notes`             | text      | Optional notes (nullable)                        |
| `started_at`        | timestamptz | When the timer was started (nullable)          |
| `break_started_at`  | timestamptz | When a break was started (nullable)            |
| `net_work_seconds`  | integer   | Accumulated work time in seconds                 |
| `created_at`        | timestamptz | Record creation timestamp                      |
| `updated_at`        | timestamptz | Record update timestamp                        |

Row Level Security is enabled with per-user CRUD policies scoped via `auth.uid()`.

## Project Structure

```
src/
  lib/
    serviceTypes.ts      # Shared service types, colors, and routine steps
    supabase.ts          # Supabase client and Vehicle type definitions
    useStats.ts          # Statistics hook with localStorage caching
  components/
    IntakeForm.tsx       # Vehicle intake form (Pace)
    Dashboard.tsx        # Vehicle records grid with filtering (Pace)
    VehicleCard.tsx      # Individual vehicle card with live timer (Pace)
    StatsDashboard.tsx   # Statistics sidebar with seed-data (Pace)
    ui/                  # Shared UI primitives (Button, Card, ProgressBar)
  detailflow/
    store.ts             # Zustand store for Flow session state
    DetailFlow.tsx       # Flow layout (sidebar + main)
    RoutineSelection.tsx # Routine picker screen (Flow)
    StepEngine.tsx       # Active session step-by-step timer (Flow)
    PerformancePanel.tsx # Performance sidebar (Flow)
    format.ts            # Time formatting utilities
  pages/
    Landing.tsx          # Landing page with tool cards
  App.tsx                # Root app with navigation
```

## Development

```bash
npm install      # Install dependencies
npm run dev     # Start the dev server
npm run build   # Production build
npm run typecheck  # TypeScript type checking
npm run lint    # ESLint
```

Supabase credentials are pre-configured in `.env`. No additional setup is required to connect to the database.
