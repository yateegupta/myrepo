# Hospital Management System

A modern web application for managing hospital operations with comprehensive role-based access control, built with Next.js 14, TypeScript, and Prisma.

## Features

- **Authentication**: Secure NextAuth.js authentication with bcrypt password hashing
- **Role-Based Access Control**: Six distinct user roles with tailored permissions
  - Hospital Admin (full system access)
  - Surgeon (procedure management)
  - Nurse (patient care and supplies)
  - Fulfillment Agent (order fulfillment)
  - Submitter (create orders)
  - Admin (system administration)
- **Order Management**: View and manage orders with real-time updates
- **Order Details**: Comprehensive order information including items, notes, and timestamps
- **Status Management**: Update order status (Pending → In Progress → Completed) with optimistic UI updates
- **Hospital Order Workflow**: Multi-step wizard for hospitals to build, customize, and submit drape orders
- **Protected Routes**: Middleware-based route protection for role-specific pages
- **Session Management**: Persistent sessions with client and server-side utilities
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
- **Database**: SQLite (local) with optional PostgreSQL support

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- (Optional) PostgreSQL database if you plan to run against Postgres instead of the default SQLite database

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

Edit `.env` and configure your database connection and NextAuth settings. By default the project uses SQLite for local development:
```
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
```

If you prefer PostgreSQL, replace the `DATABASE_URL` value with your Postgres connection string:
```
DATABASE_URL="postgresql://user:password@localhost:5432/fulfillment_db?schema=public"
```
When switching providers, update the `provider` value in `prisma/schema.prisma` to `postgresql` before running migrations.

4. Set up the database:
```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

5. Start the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Demo Credentials

After seeding the database, you can log in with any of these accounts (all use password `password123`):

| Role | Email | Description |
|------|-------|-------------|
| Hospital Admin | admin@hospital.com | Full system access |
| Surgeon | surgeon@hospital.com | Procedure management |
| Nurse | nurse@hospital.com | Patient care and supplies |
| Fulfillment Agent | fulfillment@hospital.com | Order fulfillment |
| Admin | admin@example.com | System administration |
| Fulfillment | fulfillment@example.com | Legacy fulfillment role |
| Submitter | sarah.connor@generalhospital.org | Create orders |
| Submitter | jack.ryan@stmary.org | Create orders |

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

### Hospital
- Registered facilities submitting drape orders
- Linked to users and orders

### User
- Authentication and role management
- Optional association to a hospital
- Roles: ADMIN, FULFILLMENT, SUBMITTER

### DrapeType
- Catalog of available drape packs and kits
- Linked to surgery types and orders

### SurgeryType
- Defines procedure types
- Associates to default drape type and recommended constituents

### Item
- Catalog of inventory components used in drape kits
- Reused across surgery defaults and individual orders

### SurgeryTypeItem
- Mapping table defining default items and quantities for each surgery type
- Powers auto-suggestion of order contents

### Order
- References hospital, submitter, drape type, and surgery type selections
- Status tracking (PENDING, IN_PROGRESS, COMPLETED, CANCELLED)
- Customization notes and timestamps (created, updated, completed)

### OrderItem
- Item details (name, quantity, notes)
- Linked to catalog items when available while supporting custom entries

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking
- `npm run db:generate` - Generate Prisma client
- `npm run db:migrate` - Apply committed Prisma migrations
- `npm run db:push` - Push schema changes directly (useful for rapid prototyping)
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

### Catalog Endpoints

#### GET /api/drape-types
Get all available drape types
- Requires: Authenticated user
- Returns: Array of drape types with id, name, and description

#### GET /api/surgery-types
Get all available surgery types
- Requires: Authenticated user
- Returns: Array of surgery types with default drape type information

#### GET /api/surgery-types/[id]/defaults
Get default items for a specific surgery type (auto-suggestion)
- Requires: Authenticated user
- Returns: Surgery type details with default drape type and default constituent items

#### GET /api/items
Search and browse item catalog
- Query params: 
  - `?search=keyword` - Search by name or description
  - `?page=1` - Page number (default: 1)
  - `?limit=50` - Items per page (default: 50)
- Requires: Authenticated user
- Returns: Paginated list of catalog items

### Order Management Endpoints

#### GET /api/orders
Get all orders with filtering and pagination
- Query params: 
  - `?status=PENDING|IN_PROGRESS|COMPLETED|CANCELLED` - Filter by status
  - `?hospitalId=id` - Filter by hospital
  - `?page=1` - Page number (default: 1)
  - `?limit=50` - Orders per page (default: 50)
- Requires: FULFILLMENT role
- Returns: Paginated list of orders

#### POST /api/orders
Create a new order
- Body:
  ```json
  {
    "drapeTypeId": "optional-id",
    "drapeTypeName": "optional-custom-name",
    "surgeryTypeId": "optional-id",
    "surgeryTypeName": "optional-custom-name",
    "customizationNotes": "optional notes",
    "items": [
      {
        "itemId": "optional-catalog-item-id",
        "itemName": "Item Name (required)",
        "quantity": 1,
        "notes": "optional item notes"
      }
    ]
  }
  ```
- Requires: SUBMITTER role
- Validates: Item quantities, catalog item IDs, user hospital association
- Returns: Created order with 201 status

#### GET /api/orders/[id]
Get single order by ID
- Requires: FULFILLMENT role

#### PATCH /api/orders/[id]
Update order status
- Body: `{ status: "IN_PROGRESS" | "COMPLETED" | "CANCELLED" }`
- Requires: FULFILLMENT role

## License

MIT
