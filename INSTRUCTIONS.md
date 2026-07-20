# 🔧 AI Agent Instruction — Full Shadcn v5 Migration & Component Refactor
# Target preset: b1GLWewlM
# Goal: Update project to new shadcn workspace system AND refactor all components to match canonical preset versions.

## 1. Workspace Migration
Perform a full migration to the new shadcn workspace system.

- Ensure the project root contains:
  - components.json (new schema)
  - src/lib/utils.ts
  - src/index.css with preset layers
  - tailwind.config.js updated with preset theme tokens

- User will run manually:
  npx shadcn@latest apply --preset b1GLWewlM

- Validate components.json:
  - "style": "default"
  - "baseColor": "zinc"
  - "aliases" match Vite/TS config
  - "tsx": true
  - "typescript": true
  - "appDir": "src"

## 2. Folder Structure Enforcement
Ensure canonical structure:

src/
  components/
    ui/
      button.tsx
      card.tsx
      input.tsx
      textarea.tsx
      dialog.tsx
      ...
  lib/
    utils.ts
  index.css

Move components from other locations into src/components/ui.

## 3. Tailwind & CSS Layer Verification
Ensure src/index.css contains:
- @tailwind base;
- @tailwind components;
- @tailwind utilities;
- preset theme layers
- @import "@fontsource-variable/inter";

Ensure tailwind.config.js includes:
- preset theme tokens
- radix color tokens
- typography settings
- content paths: src/**/*.{ts,tsx}

## 4. Alias Verification
Ensure Vite + TS alias:

"@": "./src"

Ensure components.json uses:

"aliases": {
  "components": "@/components",
  "utils": "@/lib/utils"
}

## 5. Component Refactor Rules
For every component in src/components/ui:

### A. Replace local component code with canonical preset version
Fetch canonical versions from:
https://ui.shadcn.com/create?preset=b1GLWewlM&item=preview&base=radix&pointer=true&template=vite

Replace:
- outdated props
- outdated classNames
- outdated Radix bindings
- outdated variants
- outdated utility imports
- outdated DOM structure
- outdated accessibility attributes

### B. Enforce canonical imports
Example:
import { cn } from "@/lib/utils"

Radix imports:
import * as DialogPrimitive from "@radix-ui/react-dialog"

### C. Enforce canonical variant patterns
Ensure:
- cva usage matches preset
- variant + size props match preset
- default variants match preset
- disabled states match preset
- focus-visible states match preset

### D. Enforce canonical styling
Ensure:
- spacing
- border radius
- colors
- dark mode tokens
- transitions
- ring styles
- focus-visible styles
- radix state classes

All must match preset.

## 6. Remove Legacy Shadcn Code
Delete:
- old components.json schema
- old ui folder structure
- old utility files
- old variant definitions
- old Radix wrappers
- old Tailwind layers

## 7. Final Validation
After refactor:
- All components compile without warnings.
- All components match canonical preset versions.
- All imports resolve correctly.
- All Radix interactions work.
- All Tailwind classes match preset tokens.
- No legacy shadcn code remains.
- Vite build is clean.

# End of Instruction
