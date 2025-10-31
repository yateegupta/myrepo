# Migration Notes - Avoiding Merge Conflicts

This document explains the approach taken to bootstrap the Next.js application while avoiding merge conflicts with existing code.

## Strategy Used

Instead of replacing or heavily modifying existing files, we took an **additive approach**:

### 1. Preserved Existing Functionality

- **Kept original providers**: Created `app/providers.tsx` as the original SessionProvider wrapper
- **Restored routing logic**: Root page redirects based on user role (FULFILLMENT → dashboard, others → orders/new)
- **Kept login flow**: Login redirects to `/` which then routes users appropriately
- **Preserved database flexibility**: .env.example supports both SQLite (default) and PostgreSQL

### 2. Added New Features Alongside Existing Ones

#### Material UI Theme

- **Location**: `lib/theme.ts`
- **Purpose**: Medical-themed design system with professional colors
- **Usage**: Optional - can be imported and used in new components
- **Impact**: Zero - doesn't affect existing components

#### React Query Setup

- **Location**: `lib/react-query.ts` and `lib/hooks/use-orders.ts`
- **Purpose**: Data fetching and caching layer
- **Usage**: Optional - can be used in new components
- **Impact**: Zero - doesn't affect existing data fetching patterns

#### New Provider Wrapper

- **Location**: `components/theme-providers.tsx`
- **Component**: `ThemeAndQueryProviders`
- **Purpose**: Wraps children with MUI Theme and React Query providers
- **Integration**: Nested inside the original SessionProvider
- **Impact**: Minimal - adds providers that only affect components that use them

#### Developer Tooling

- **Prettier**: Added configuration files (`.prettierrc`, `.prettierignore`)
- **ESLint**: Extended existing config to include Prettier integration
- **Husky**: Added pre-commit hooks that run lint-staged
- **Impact**: Only affects new commits - existing code is auto-formatted on save

### 3. Dual Provider System

The layout now uses a nested provider structure:

```tsx
<AppProviders>
  {' '}
  {/* Original - SessionProvider */}
  <ThemeAndQueryProviders>
    {' '}
    {/* New - MUI + React Query */}
    {children}
    <Toaster />
  </ThemeAndQueryProviders>
</AppProviders>
```

This allows:

- Existing code to continue working with SessionProvider
- New code to use Material UI and React Query
- No breaking changes to existing components

### 4. Path Aliases

Enhanced TypeScript paths in `tsconfig.json`:

- `@/*` - Root directory (already existed)
- `@/app/*` - App directory
- `@/components/*` - Components directory
- `@/lib/*` - Lib utilities
- `@/server/*` - Server utilities (new)
- `@/types/*` - Type definitions

These are additive and don't break existing imports.

### 5. Created Placeholder Components

- **order-wizard.tsx**: Simple placeholder to maintain routing compatibility
- **sample-mui-card.tsx**: Example of Material UI usage
- Can be replaced with actual implementations without affecting structure

## What Was NOT Changed

- ❌ Database schema - kept as-is
- ❌ Existing API routes (/api/orders) - preserved
- ❌ Dashboard page logic - kept intact
- ❌ Order detail sheet - preserved
- ❌ Authentication flow - no changes
- ❌ Middleware - kept unchanged

## What Was Added (Non-Breaking)

- ✅ Material UI theme configuration
- ✅ React Query client setup
- ✅ Example hooks for React Query
- ✅ Prettier configuration
- ✅ Husky pre-commit hooks
- ✅ Enhanced ESLint config
- ✅ Documentation (README, SETUP.md, docs/)
- ✅ Server utilities directory
- ✅ Enhanced path aliases

## Migration Path for Existing Features

If you want to migrate existing components to use the new tools:

### Using Material UI in Existing Components

```tsx
'use client';
import { Button } from '@mui/material';

// MUI is available via ThemeAndQueryProviders
<Button variant="contained">Click Me</Button>;
```

### Using React Query in Existing Components

```tsx
'use client';
import { useOrders } from '@/lib/hooks/use-orders';

// React Query is available via ThemeAndQueryProviders
const { data, isLoading } = useOrders();
```

## Testing the Changes

```bash
# All existing commands still work
npm run dev          # Development server
npm run build        # Production build
npm run lint         # ESLint check
npm run type-check   # TypeScript check

# New commands added
npm run format       # Format all code
npm run format:check # Check formatting
```

## Rollback Strategy

If you need to roll back any changes:

1. **Remove Material UI**: Delete `lib/theme.ts` and remove from `components/theme-providers.tsx`
2. **Remove React Query**: Delete `lib/react-query.ts` and `lib/hooks/`
3. **Simplify providers**: Use only `app/providers.tsx` in layout
4. **Remove tooling**: Delete `.prettierrc`, `.prettierignore`, `.husky/`

The application will continue to work as it did before.

## Summary

This approach ensures:

- ✅ Zero breaking changes to existing functionality
- ✅ All new features are opt-in
- ✅ Existing code continues to work unchanged
- ✅ New features can be adopted gradually
- ✅ Easy to roll back if needed
- ✅ No merge conflicts with existing branches
