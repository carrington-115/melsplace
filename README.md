# Mel's Place

A full-stack e-commerce storefront built with Next.js 16, featuring a customer-facing shop, an admin dashboard, and a public landing page.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Auth**: Clerk
- **Database**: PostgreSQL via Drizzle ORM
- **Storage/Backend**: Supabase
- **Email**: Resend
- **Styling**: Tailwind CSS v4 + shadcn/ui (Radix UI)
- **State**: Zustand, TanStack Query
- **Forms**: React Hook Form + Zod

## Project Structure

```
src/
├── app/
│   ├── (admin)/         # Admin dashboard (products, orders, customers, promotions)
│   ├── (auth)/          # Clerk sign-in / sign-up pages
│   ├── (store)/         # Customer storefront (products, cart, orders, wishlist)
│   └── api/             # API routes (products, orders, addresses, webhooks, etc.)
├── components/
│   ├── admin/           # Admin-specific components
│   ├── landing/         # Public landing page sections
│   ├── store/           # Storefront components
│   └── ui/              # shadcn/ui primitives
├── db/                  # Drizzle schema, migrations, and seed
├── hooks/               # use-cart, use-wishlist
├── lib/                 # Supabase clients, Resend, validations, utils
└── types/
```

## Getting Started

### Prerequisites

- Node.js 18+
- A PostgreSQL database (Supabase recommended)
- Clerk account
- Supabase project (for storage)
- Resend account (for transactional email)

### Environment Variables

Copy `.env.example` to `.env.local` and fill in:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_WEBHOOK_SECRET=

DATABASE_URL=

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

RESEND_API_KEY=
```

### Install & Run

```bash
npm install

# Push schema to the database
npm run db:push

# (Optional) Seed with sample data
npm run db:seed

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the storefront.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run lint` | Run ESLint |
| `npm run db:generate` | Generate Drizzle migration files |
| `npm run db:migrate` | Run migrations |
| `npm run db:push` | Push schema changes directly |
| `npm run db:studio` | Open Drizzle Studio |
| `npm run db:seed` | Seed the database |

## Key Features

- **Storefront**: product listing, product detail, cart, checkout, order history, wishlist, search
- **Admin dashboard**: product/category management, order management, customer list, promotions, analytics chart
- **Auth**: Clerk-powered sign-in/sign-up with role-based access (admin vs. customer)
- **Email**: order confirmation and contact form emails via Resend
- **Webhooks**: Clerk user sync via Svix
