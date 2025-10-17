# Medical Fulfillment Dashboard

A modern, full-stack web application for managing medical fulfillment operations, built with Next.js 14 and designed specifically for healthcare professionals.

## 🏥 Features

- **Authentication & Authorization**: Secure role-based access control with NextAuth.js
- **Order Management**: View, filter, and manage orders with real-time updates
- **Status Tracking**: Update order status (Pending → In Progress → Completed) with optimistic UI
- **Responsive Design**: Mobile-first design optimized for all screen sizes
- **Medical Professional UI**: Clean, professional interface with healthcare-focused color palette
- **Real-time Data**: React Query for efficient data fetching and caching

## 🚀 Tech Stack

### Frontend

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **UI Library**: [Material UI](https://mui.com/) (MUI)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Data Fetching**: [React Query](https://tanstack.com/query/latest) (TanStack Query)
- **Icons**: Material Icons, Lucide React

### Backend

- **API Routes**: Next.js API Routes (App Router)
- **Database ORM**: [Prisma](https://www.prisma.io/)
- **Database**: PostgreSQL
- **Authentication**: [NextAuth.js](https://next-auth.js.org/)

### Developer Tools

- **Linting**: ESLint with Next.js config
- **Formatting**: Prettier
- **Pre-commit Hooks**: Husky + lint-staged
- **Type Checking**: TypeScript strict mode

## 📁 Project Structure

```
├── app/                    # Next.js app directory (App Router)
│   ├── api/               # API routes
│   │   ├── auth/         # NextAuth configuration
│   │   └── orders/       # Order management endpoints
│   ├── dashboard/        # Dashboard page
│   ├── login/            # Login page
│   ├── layout.tsx        # Root layout with providers
│   └── globals.css       # Global styles
├── components/            # React components
│   ├── ui/               # Reusable UI components (shadcn/ui)
│   ├── providers.tsx     # App providers (MUI, React Query)
│   └── *.tsx             # Feature components
├── lib/                   # Utility functions and configurations
│   ├── hooks/            # Custom React hooks
│   │   └── use-orders.ts # React Query hooks for orders
│   ├── auth.ts           # NextAuth configuration
│   ├── prisma.ts         # Prisma client singleton
│   ├── theme.ts          # Material UI theme configuration
│   ├── react-query.ts    # React Query client configuration
│   └── utils.ts          # Helper functions
├── server/               # Server-side utilities
│   └── api-utils.ts      # API helper functions
├── prisma/               # Database schema and migrations
│   ├── schema.prisma     # Prisma schema
│   └── seed.ts           # Database seeding script
└── types/                # TypeScript type definitions
```

## 🎨 Theme & Design

The application features a carefully crafted theme designed for medical professionals:

- **Primary Color**: Professional blue (#2563eb) - Trust and reliability
- **Secondary Color**: Medical green (#059669) - Health and growth
- **Typography**: System fonts with optimized readability
- **Components**: Rounded corners, soft shadows, clean layouts
- **Accessibility**: WCAG 2.1 compliant color contrasts

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+ installed
- PostgreSQL database
- npm, yarn, or pnpm package manager

### Installation

1. **Clone the repository**:

   ```bash
   git clone <repository-url>
   cd fulfillment-dashboard
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Set up environment variables**:

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and configure your database connection and authentication:

   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/fulfillment_db?schema=public"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here"
   ```

4. **Set up the database**:

   ```bash
   npm run db:generate
   npm run db:push
   npm run db:seed
   ```

5. **Start the development server**:

   ```bash
   npm run dev
   ```

6. **Open the application**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## 👥 Demo Credentials

After seeding the database, you can log in with:

- **Email**: fulfillment@example.com
- **Password**: password123
- **Role**: FULFILLMENT

Additional test accounts:

- submitter@example.com (SUBMITTER role)
- admin@example.com (ADMIN role)

## 📜 Available Scripts

| Script                 | Description                     |
| ---------------------- | ------------------------------- |
| `npm run dev`          | Start development server        |
| `npm run build`        | Build for production            |
| `npm start`            | Start production server         |
| `npm run lint`         | Run ESLint                      |
| `npm run format`       | Format code with Prettier       |
| `npm run format:check` | Check code formatting           |
| `npm run type-check`   | Run TypeScript type checking    |
| `npm run db:generate`  | Generate Prisma client          |
| `npm run db:push`      | Push schema changes to database |
| `npm run db:seed`      | Seed database with sample data  |

## 🔒 Authentication & Authorization

The application uses NextAuth.js with role-based access control:

- **ADMIN**: Full access to all features
- **FULFILLMENT**: Access to order management and fulfillment features
- **SUBMITTER**: Limited access for order submission

## 🗄️ Database Schema

### User

- Authentication and role management
- Roles: ADMIN, FULFILLMENT, SUBMITTER

### Order

- Hospital information
- Surgery and drape types
- Status tracking (PENDING, IN_PROGRESS, COMPLETED, CANCELLED)
- Customization notes
- Timestamps (created, updated, completed)

### OrderItem

- Item details (name, quantity, notes)
- Associated with orders

## 🌐 API Endpoints

### `GET /api/orders`

Get all orders with optional status filter

- Query params: `?status=PENDING|IN_PROGRESS|COMPLETED|CANCELLED`
- Requires: FULFILLMENT role

### `GET /api/orders/[id]`

Get single order by ID

- Requires: FULFILLMENT role

### `PATCH /api/orders/[id]`

Update order status

- Body: `{ status: "IN_PROGRESS" | "COMPLETED" | "CANCELLED" }`
- Requires: FULFILLMENT role

## 🎯 Path Aliases

The project uses TypeScript path aliases for cleaner imports:

```typescript
import { Button } from '@/components/ui/button';
import { theme } from '@/lib/theme';
import { useOrders } from '@/lib/hooks/use-orders';
import { createSuccessResponse } from '@/server/api-utils';
```

## 🔧 Development Workflow

### Pre-commit Hooks

The project uses Husky to run pre-commit hooks that automatically:

- Lint and fix JavaScript/TypeScript files
- Format code with Prettier
- Ensure code quality before commits

### Code Style

- **ESLint**: Next.js recommended config + Prettier integration
- **Prettier**: Consistent code formatting
- **TypeScript**: Strict mode enabled

## 🚀 Deployment

### Build for Production

```bash
npm run build
npm start
```

### Environment Variables

Ensure all required environment variables are set:

- `DATABASE_URL`: PostgreSQL connection string
- `NEXTAUTH_URL`: Application URL
- `NEXTAUTH_SECRET`: Secret key for session encryption

## 📚 Key Libraries

- **@tanstack/react-query**: Data fetching and caching
- **@mui/material**: UI component library
- **@prisma/client**: Type-safe database access
- **next-auth**: Authentication
- **zod**: Schema validation
- **date-fns**: Date manipulation

## 🤝 Contributing

1. Create a new branch for your feature
2. Make your changes
3. Run tests and linting: `npm run lint && npm run type-check`
4. Format your code: `npm run format`
5. Commit your changes (pre-commit hooks will run automatically)
6. Create a pull request

## 📄 License

MIT

---

Built with ❤️ for healthcare professionals
