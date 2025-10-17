# Hospital Management System

A Next.js application with authentication and role-based access control (RBAC) using NextAuth, Prisma, and SQLite.

## Features

- **Authentication**: NextAuth with credentials provider
- **Role-Based Access Control**: Four user roles with different permissions
  - Hospital Admin
  - Surgeon
  - Nurse
  - Fulfillment Agent
- **Protected Routes**: Middleware-based route protection
- **Session Management**: Persistent sessions across the app
- **Role-Tailored Navigation**: Dynamic navigation based on user role

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Authentication**: NextAuth v4
- **Database**: SQLite with Prisma ORM
- **Styling**: Tailwind CSS
- **TypeScript**: Full type safety

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up the database:
```bash
npx prisma generate
npx prisma db push
```

3. Seed the database with test users:
```bash
npm run db:seed
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Test Credentials

The application comes with pre-seeded test users:

| Role | Email | Password |
|------|-------|----------|
| Hospital Admin | admin@hospital.com | admin123 |
| Surgeon | surgeon@hospital.com | surgeon123 |
| Nurse | nurse@hospital.com | nurse123 |
| Fulfillment Agent | fulfillment@hospital.com | fulfillment123 |

## Project Structure

```
src/
├── app/
│   ├── api/auth/[...nextauth]/   # NextAuth API routes
│   ├── admin/                     # Admin-only pages
│   ├── surgeon/                   # Surgeon pages
│   ├── nurse/                     # Nurse pages
│   ├── fulfillment/              # Fulfillment agent pages
│   ├── dashboard/                # General dashboard
│   ├── login/                    # Login page
│   └── unauthorized/             # 403 page
├── components/
│   ├── Navigation.tsx            # Role-based navigation
│   └── SessionProvider.tsx       # NextAuth session provider
├── hooks/
│   └── useSession.ts             # Session & role hooks
├── lib/
│   ├── auth.ts                   # NextAuth configuration
│   ├── prisma.ts                 # Prisma client
│   └── session.ts                # Server-side session utilities
├── types/
│   └── next-auth.d.ts            # NextAuth type definitions
└── middleware.ts                  # Route protection middleware

prisma/
├── schema.prisma                 # Database schema
└── seed.ts                       # Database seeding script
```

## Role-Based Access Control

### Roles

1. **HOSPITAL_ADMIN**: Full access to all areas
2. **SURGEON**: Access to surgeon-specific features
3. **NURSE**: Access to nurse-specific features
4. **FULFILLMENT_AGENT**: Access to fulfillment features

### Protected Routes

Routes are protected using Next.js middleware. Users without the appropriate role will be redirected to the unauthorized page.

### Usage Examples

#### Client-side (React Components)

```tsx
'use client'
import { useSession, useRole, useUser } from '@/hooks/useSession'

export default function MyComponent() {
  const { data: session, status } = useSession()
  const role = useRole()
  const user = useUser()

  if (status === 'loading') return <div>Loading...</div>
  if (!session) return <div>Not authenticated</div>

  return <div>Welcome {user?.name}! Your role is {role}</div>
}
```

#### Server-side (Server Components)

```tsx
import { getCurrentUser, getCurrentRole, requireAuth, requireRole } from '@/lib/session'

export default async function MyPage() {
  // Get current user (returns null if not authenticated)
  const user = await getCurrentUser()
  
  // Get current role
  const role = await getCurrentRole()
  
  // Require authentication (throws if not authenticated)
  const authUser = await requireAuth()
  
  // Require specific role(s) (throws if wrong role)
  const adminUser = await requireRole('HOSPITAL_ADMIN')
  const surgeonOrAdmin = await requireRole(['SURGEON', 'HOSPITAL_ADMIN'])
  
  return <div>Protected content</div>
}
```

## Database Schema

The application uses Prisma with SQLite. Key models:

- **User**: User accounts with email, password, and role
- **Account**: OAuth provider accounts (for future expansion)
- **Session**: User sessions
- **VerificationToken**: Email verification tokens

## Environment Variables

Required environment variables (in `.env`):

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-change-in-production"
```

## Available Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm start`: Start production server
- `npm run lint`: Run ESLint
- `npm run db:seed`: Seed database with test users

## Security Notes

- Passwords are hashed using bcrypt
- Sessions use JWT strategy
- Protected routes use Next.js middleware
- Role checks on both client and server side
- Change `NEXTAUTH_SECRET` in production

## Future Enhancements

- OAuth providers (Google, GitHub, etc.)
- Email verification
- Password reset functionality
- Two-factor authentication
- Audit logging
- User management UI for admins
- PostgreSQL for production

## License

MIT
