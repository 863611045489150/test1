# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## Artifacts

### Serenity Check (`artifacts/serenity-check`)
- **Kind**: React + Vite web app (frontend only, no backend)
- **Preview path**: `/`
- **Description**: High-end Mental Wellness Evaluator — dark minimalist, cyber-premium aesthetic
- **Features**:
  - 6-step evaluation flow with slide/fade animations
  - Haptic feedback (navigator.vibrate) and synthetic audio click sounds
  - Deep charcoal background (#0B0B0E) with purple/indigo radial gradients
  - Bento box card layout (#16161D, border-radius: 24px)
  - Plus Jakarta Sans typography
  - Purple-to-Magenta gradient buttons with outer glow
  - "DEVELOPED BY AARUSH" watermark at top
  - Analyzing animation (2s pulsing purple light)
  - Glassmorphic results page with 3 sections: Catalysts, Strategies, Symptom Alignment
  - Condition detail overlay modal
  - Fixed disclaimer footer
  - Mobile responsive
- **Key files**:
  - `src/components/SerenityApp.tsx` — main evaluation flow (Landing → Questions → Analyzing → Results)
  - `src/components/ResultsPage.tsx` — results display
  - `src/components/ConditionModal.tsx` — condition detail modal
  - `src/lib/evaluation.ts` — scoring logic and result computation
  - `src/lib/audio.ts` — Web Audio API click sounds and haptic triggers
  - `src/index.css` — full design system (colors, animations, utilities)
