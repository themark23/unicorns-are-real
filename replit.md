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

### Unicorn Magic (`artifacts/unicorn-magic`)
- **Kind**: Mobile (Expo ~54, React Native 0.81.5, TypeScript)
- **Preview**: Expo dev domain via `$REPLIT_EXPO_DEV_DOMAIN`
- **Port**: 21488
- **Description**: A magical iOS app for children ages 4–8 with 5 tabs:
  1. **Dress** (`app/(tabs)/index.tsx`) — Colorforms-style unicorn dress-up with zone coloring and accessories
  2. **Facts** (`app/(tabs)/facts.tsx`) — 15 unicorn facts with TTS play button
  3. **Color** (`app/(tabs)/color.tsx`) — Paint-mode coloring with 5 magical locations and alicorn toggle
  4. **Stories** (`app/(tabs)/stories.tsx`) — 15 pre-generated stories in 5 categories with TTS
  5. **Potions** (`app/(tabs)/potions.tsx`) — 10 magic potion recipes with images
- **Key files**:
  - `constants/colors.ts` — design tokens (bg `#EEEDFE`, primary `#534AB7`)
  - `constants/facts.ts` — 15 unicorn facts
  - `constants/stories.ts` — 15 stories, 5 categories
  - `constants/potions.ts` — 10 potions with 5 image assets
  - `components/UnicornSVG.tsx` — SVG unicorn with 4 colorable zones + alicorn mode
  - `context/UnicornContext.tsx` — global state + AsyncStorage persistence
- **Key deps**: expo-speech ~14.0.8, react-native-svg 15.12.1, expo-linear-gradient, expo-haptics, @expo/vector-icons
