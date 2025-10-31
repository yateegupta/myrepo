# Role-Based Access Control (RBAC) Implementation

This document describes the authentication and role-based access control system implemented in the Hospital Management System.

## Overview

The application uses NextAuth.js for authentication with a credentials provider, combined with Prisma for database management and bcrypt for password hashing. The system supports six distinct user roles with tailored permissions and access controls.

## User Roles

### 1. HOSPITAL_ADMIN
- **Description**: Full administrative access to all hospital systems
- **Permissions**: 
  - Access to admin panel
  - View and manage all users
  - Access all role-specific dashboards (surgeon, nurse, fulfillment)
  - Full order management capabilities
  - System configuration
- **Routes**: `/admin`, `/dashboard`, `/surgeon`, `/nurse`, `/orders/*`, `/api/*`

### 2. SURGEON
- **Description**: Medical surgeons managing procedures
- **Permissions**:
  - Access to surgeon dashboard
  - Create procedure orders
  - View patient records
  - Manage surgical schedules
- **Routes**: `/surgeon`, `/orders/new`

### 3. NURSE
- **Description**: Nursing staff managing patient care
- **Permissions**:
  - Access to nurse dashboard
  - Create supply requests
  - View patient care records
  - Monitor medication administration
- **Routes**: `/nurse`, `/orders/new`

### 4. FULFILLMENT_AGENT
- **Description**: Staff responsible for order fulfillment
- **Permissions**:
  - Access to fulfillment dashboard
  - View all orders
  - Update order status
  - Process and complete orders
- **Routes**: `/dashboard`, `/api/orders/*` (with modification rights)

### 5. FULFILLMENT (Legacy)
- **Description**: Legacy fulfillment role (maintained for backward compatibility)
- **Permissions**: Same as FULFILLMENT_AGENT
- **Routes**: `/dashboard`, `/api/orders/*`

### 6. SUBMITTER
- **Description**: Hospital staff who can create orders
- **Permissions**:
  - Create new orders
  - View own orders
  - Submit order requests
- **Routes**: `/orders/new`

### 7. ADMIN
- **Description**: System administrators
- **Permissions**: Full system access (same as HOSPITAL_ADMIN)
- **Routes**: All routes

## Authentication Flow

### 1. Login Process
1. User submits credentials (email + password) via `/login` page
2. NextAuth validates credentials against database
3. Password is compared using bcrypt
4. JWT token is generated with user ID and role
5. User is redirected to appropriate dashboard based on role

### 2. Session Management
- **Strategy**: JWT (JSON Web Tokens)
- **Storage**: HTTP-only cookies
- **Expiration**: Configurable via NextAuth
- **Persistence**: Sessions persist across page refreshes

## Route Protection

### Middleware Implementation
The application uses Next.js middleware (`middleware.ts`) to protect routes:

```typescript
// Protected route patterns
matcher: [
  '/dashboard/:path*',
  '/orders/:path*',
  '/api/orders/:path*',
  '/admin/:path*',
  '/surgeon/:path*',
  '/nurse/:path*',
  '/fulfillment/:path*'
]
```

### Access Control Logic
1. Middleware intercepts requests to protected routes
2. Validates JWT token from session
3. Checks user role against route requirements
4. Redirects to `/unauthorized` if access denied
5. Proceeds to route if authorized

## Server-Side Utilities

### Location: `lib/session.ts`

#### `getCurrentUser()`
```typescript
// Get current user from session (returns null if not authenticated)
const user = await getCurrentUser()
```

#### `getCurrentRole()`
```typescript
// Get current user's role
const role = await getCurrentRole()
```

#### `requireAuth()`
```typescript
// Require authentication (throws error if not authenticated)
const user = await requireAuth()
```

#### `requireRole(role)`
```typescript
// Require specific role(s)
const user = await requireRole(UserRole.HOSPITAL_ADMIN)
const user = await requireRole([UserRole.SURGEON, UserRole.NURSE])
```

## Client-Side Hooks

### Location: `hooks/useSession.ts`

#### `useSession()`
```typescript
// Access full session object
const { data: session, status } = useSession()
```

#### `useRole()`
```typescript
// Get current user's role
const role = useRole()
```

#### `useUser()`
```typescript
// Get current user data
const user = useUser()
```

## Security Features

### 1. Password Security
- **Hashing Algorithm**: bcrypt
- **Salt Rounds**: 10
- **Storage**: Only hashed passwords stored in database
- **Validation**: Secure comparison using bcrypt.compare()

### 2. Session Security
- **Token Strategy**: JWT
- **HTTP-Only Cookies**: Prevents XSS attacks
- **Secret Key**: Configured via `NEXTAUTH_SECRET` environment variable
- **HTTPS Recommended**: For production deployments

### 3. Role Validation
- **Client-Side**: Initial UI rendering based on role
- **Server-Side**: Authoritative checks for all data access
- **Middleware**: Pre-emptive route protection
- **API Routes**: Role checks on every request

## Usage Examples

### Protecting a Server Component
```typescript
import { requireRole } from '@/lib/session'
import { UserRole } from '@/types/prisma'

export default async function AdminPage() {
  try {
    const user = await requireRole(UserRole.HOSPITAL_ADMIN)
    return <div>Admin content for {user.name}</div>
  } catch {
    redirect('/unauthorized')
  }
}
```

### Protecting a Client Component
```typescript
'use client'
import { useSession, useRole } from '@/hooks/useSession'

export default function MyComponent() {
  const { data: session, status } = useSession()
  const role = useRole()
  
  if (status === 'loading') return <div>Loading...</div>
  if (!session) return <div>Access denied</div>
  
  return <div>Welcome {session.user.name}! Role: {role}</div>
}
```

### Protecting an API Route
```typescript
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { UserRole } from '@/types/prisma'

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  
  if (!session || session.user.role !== UserRole.FULFILLMENT_AGENT) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }
  
  // Process request...
}
```

## Test Credentials

All test users use the password: `password123`

| Role | Email | Access Level |
|------|-------|-------------|
| HOSPITAL_ADMIN | admin@hospital.com | Full system access |
| SURGEON | surgeon@hospital.com | Surgeon features |
| NURSE | nurse@hospital.com | Nurse features |
| FULFILLMENT_AGENT | fulfillment@hospital.com | Order fulfillment |
| ADMIN | admin@example.com | Full system access |
| FULFILLMENT | fulfillment@example.com | Order fulfillment (legacy) |
| SUBMITTER | sarah.connor@generalhospital.org | Create orders |

## Database Schema

### User Model
```prisma
model User {
  id          String   @id @default(cuid())
  email       String   @unique
  name        String?
  role        String   @default("SUBMITTER")
  password    String
  hospitalId  String?
  hospital    Hospital? @relation(fields: [hospitalId], references: [id])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  orders      Order[]
}
```

## Extending the System

### Adding a New Role

1. **Add role to enum** (`types/prisma.ts`):
```typescript
export enum UserRole {
  // ... existing roles
  NEW_ROLE = 'NEW_ROLE',
}
```

2. **Update middleware** (`middleware.ts`):
```typescript
if (path.startsWith('/new-route') && token?.role !== 'NEW_ROLE') {
  return NextResponse.redirect(new URL('/unauthorized', req.url))
}
```

3. **Add route matcher**:
```typescript
matcher: [
  // ... existing matchers
  '/new-route/:path*',
]
```

4. **Create role-specific page** (`app/new-route/page.tsx`):
```typescript
export default async function NewRolePage() {
  const user = await requireRole(UserRole.NEW_ROLE)
  return <div>New role content</div>
}
```

5. **Update seed data** (`prisma/seed.ts`):
```typescript
await prisma.user.create({
  data: {
    email: 'newrole@example.com',
    name: 'New Role User',
    role: UserRole.NEW_ROLE,
    password: hashedPassword,
  },
})
```

## Best Practices

1. **Always validate on server-side**: Client-side checks are for UX only
2. **Use bcrypt for passwords**: Never store plain text passwords
3. **Check roles in API routes**: Don't trust client-side requests
4. **Use TypeScript**: Leverage type safety for role checks
5. **Test all roles**: Ensure each role has appropriate access
6. **Log access attempts**: Monitor for security issues
7. **Use HTTPS in production**: Protect session cookies
8. **Rotate secrets**: Change NEXTAUTH_SECRET regularly
9. **Implement rate limiting**: Prevent brute force attacks
10. **Add audit logging**: Track sensitive operations

## Troubleshooting

### Issue: "Unauthorized" error on valid route
- Check middleware matcher patterns
- Verify role in JWT token
- Ensure role enum matches database value

### Issue: Password comparison fails
- Verify bcrypt is installed
- Check password was hashed during seed
- Ensure bcrypt.compare() is used correctly

### Issue: Session not persisting
- Check NEXTAUTH_SECRET is set
- Verify cookies are enabled
- Check for HTTPS in production

### Issue: Role not in JWT token
- Verify JWT callback in authOptions
- Check session callback adds role
- Ensure user object includes role

## Future Enhancements

- [ ] Permission-based access (more granular than roles)
- [ ] Multi-factor authentication (MFA)
- [ ] OAuth providers (Google, Microsoft, etc.)
- [ ] Session activity logging
- [ ] Password reset functionality
- [ ] Email verification
- [ ] Account lockout after failed attempts
- [ ] Role hierarchy system
- [ ] Dynamic permission assignment
- [ ] Audit trail for all actions
