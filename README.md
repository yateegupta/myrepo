# Fulfillment Dashboard

A modern web application for managing fulfillment operations, built with Next.js 14, TypeScript, and Prisma.

## Features

- **Authentication**: Secure role-based access control with NextAuth.js
- **Order Management**: View and manage orders with real-time updates
- **Order Details**: Comprehensive order information including items, notes, and timestamps
- **Status Management**: Update order status (Pending → In Progress → Completed) with optimistic UI updates
- **Responsive Design**: Mobile-first design that works on all screen sizes
- **Loading & Empty States**: Professional loading indicators and empty state designs
- **Filter Orders**: Filter orders by status (Pending, In Progress, Completed, Cancelled)

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI (via shadcn/ui)
- **Database ORM**: Prisma
- **Authentication**: NextAuth.js
- **Database**: PostgreSQL

## Getting Started

### Prerequisites

- Node.js 18+ installed
- PostgreSQL database
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd fulfillment-dashboard
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and configure your database connection and NextAuth settings:
```
DATABASE_URL="postgresql://user:password@localhost:5432/fulfillment_db?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
```

4. Set up the database:
```bash
npm run db:generate
npm run db:push
npm run db:seed
```

5. Start the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Demo Credentials

After seeding the database, you can log in with:

- **Email**: fulfillment@example.com
- **Password**: password123
- **Role**: FULFILLMENT

Other test accounts:
- submitter@example.com (SUBMITTER role)
- admin@example.com (ADMIN role)

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── auth/         # NextAuth configuration
│   │   └── orders/       # Order management endpoints
│   ├── dashboard/        # Dashboard page
│   ├── login/            # Login page
│   └── layout.tsx        # Root layout
├── components/            # React components
│   └── ui/               # Reusable UI components
├── lib/                   # Utility functions
│   ├── auth.ts           # NextAuth configuration
│   ├── prisma.ts         # Prisma client
│   └── utils.ts          # Helper functions
├── prisma/               # Database schema and migrations
│   ├── schema.prisma     # Prisma schema
│   └── seed.ts           # Database seeding script
└── types/                # TypeScript type definitions

```

## Database Schema

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

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema changes to database
- `npm run db:seed` - Seed database with sample data

## Features in Detail

### Authentication & Authorization
- Role-based access control
- Only users with FULFILLMENT role can access the dashboard
- Secure session management with NextAuth.js

### Order Management
- View all orders in a responsive table
- Filter by status
- Click any row to view detailed information
- Real-time status updates

### Order Details
- Comprehensive order information panel
- View constituent items with quantities
- Customization notes
- Timeline with creation, update, and completion timestamps
- Quick action buttons for status changes

### Optimistic UI Updates
- Instant feedback when updating order status
- Automatic rollback on error
- Toast notifications for success/error states

### Responsive Design
- Mobile-first approach
- Adaptive table with hidden columns on smaller screens
- Touch-friendly interface
- Responsive drawer/sheet for order details

## API Endpoints

### GET /api/orders
Get all orders (with optional status filter)
- Query params: `?status=PENDING|IN_PROGRESS|COMPLETED|CANCELLED`
- Requires: FULFILLMENT role

### GET /api/orders/[id]
Get single order by ID
- Requires: FULFILLMENT role

### PATCH /api/orders/[id]
Update order status
- Body: `{ status: "IN_PROGRESS" | "COMPLETED" | "CANCELLED" }`
- Requires: FULFILLMENT role

## License

MIT
