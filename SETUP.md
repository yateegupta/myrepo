# Project Setup Summary

This document provides a quick overview of what was set up in this project.

## What Was Bootstrapped

### 1. Next.js 14 with TypeScript

- ✅ Next.js 14 with App Router
- ✅ TypeScript with strict mode
- ✅ Path aliases configured (`@/app`, `@/components`, `@/lib`, `@/server`, `@/types`)

### 2. UI Framework - Material UI

- ✅ Material UI (MUI) v7 installed
- ✅ Custom medical-themed design system configured
- ✅ Professional blue and medical green color palette
- ✅ Typography optimized for healthcare applications
- ✅ Component customizations (Buttons, Cards, Paper)
- ✅ CssBaseline for consistent styling
- ✅ Emotion for CSS-in-JS

### 3. Data Fetching - React Query

- ✅ TanStack React Query v5 installed
- ✅ QueryClient configured with sensible defaults
- ✅ Example hooks created (`useOrders`, `useOrder`, `useUpdateOrderStatus`)
- ✅ Integrated with app-wide Providers

### 4. Project Structure

```
app/                  # Next.js App Router
  ├── api/           # API routes
  ├── dashboard/     # Dashboard page
  ├── login/         # Login page
  └── layout.tsx     # Root layout with providers

components/          # React components
  ├── ui/           # Reusable UI components
  ├── providers.tsx # App providers (Session, Query, Theme)
  └── *.tsx         # Feature components

lib/                 # Utilities and configurations
  ├── hooks/        # React Query hooks
  ├── theme.ts      # Material UI theme
  ├── react-query.ts # React Query config
  ├── auth.ts       # NextAuth config
  └── utils.ts      # Helper functions

server/             # Server-side utilities
  └── api-utils.ts  # API helper functions

types/              # TypeScript types

docs/               # Documentation
  ├── mui-theme-guide.md
  └── react-query-usage.md
```

### 5. Developer Tooling

#### ESLint

- ✅ Next.js recommended config
- ✅ Prettier integration
- ✅ Configured to auto-fix on save

#### Prettier

- ✅ Configured with project standards
- ✅ Single quotes, 2-space indent, 100 char width
- ✅ Format scripts added

#### Husky + lint-staged

- ✅ Pre-commit hooks configured
- ✅ Auto-lint and format on commit
- ✅ Ensures code quality before commits

### 6. Providers Setup

The app is wrapped with the following providers (in order):

1. **SessionProvider** - NextAuth session management
2. **QueryClientProvider** - React Query client
3. **ThemeProvider** - Material UI theme
4. **Toaster** - Toast notifications

All providers are configured in `components/providers.tsx`.

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials

# Set up database
npm run db:generate
npm run db:push
npm run db:seed

# Start development server
npm run dev
```

## Available Scripts

| Command                | Description                  |
| ---------------------- | ---------------------------- |
| `npm run dev`          | Start development server     |
| `npm run build`        | Build for production         |
| `npm run start`        | Start production server      |
| `npm run lint`         | Lint code with ESLint        |
| `npm run format`       | Format code with Prettier    |
| `npm run format:check` | Check code formatting        |
| `npm run type-check`   | Run TypeScript type checking |

## Material UI Theme

The theme is configured for medical professionals with:

- **Primary**: Professional Blue (#2563eb)
- **Secondary**: Medical Green (#059669)
- **Semantic colors**: Error, Warning, Info, Success
- **Typography**: System fonts with medical app readability
- **Components**: Rounded corners, soft shadows

Edit `lib/theme.ts` to customize.

## React Query Configuration

Default settings:

- **staleTime**: 60s (data fresh for 1 minute)
- **gcTime**: 5 minutes (cache cleanup)
- **refetchOnWindowFocus**: false
- **retry**: 1 attempt

Edit `lib/react-query.ts` to customize.

## Path Aliases

Use these aliases for cleaner imports:

```typescript
import { Button } from '@/components/ui/button';
import { theme } from '@/lib/theme';
import { useOrders } from '@/lib/hooks/use-orders';
import { createSuccessResponse } from '@/server/api-utils';
```

## Documentation

- **README.md** - Complete project documentation
- **docs/mui-theme-guide.md** - Material UI theming guide
- **docs/react-query-usage.md** - React Query patterns and examples

## Next Steps

1. Customize the Material UI theme in `lib/theme.ts`
2. Add more React Query hooks in `lib/hooks/`
3. Build out API routes in `app/api/`
4. Create new pages in `app/`
5. Add server utilities in `server/`

## Notes

- All client components are marked with `'use client'`
- Pages with authentication use `export const dynamic = 'force-dynamic'`
- Pre-commit hooks will auto-format and lint your code
- TypeScript strict mode is enabled for better type safety
