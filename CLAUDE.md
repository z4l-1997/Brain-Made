# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build production app with Turbopack
- `npm run lint` - Run ESLint
- `npm start` - Start production server

## Database Commands

- `npm run db:generate` - Generate Drizzle schema migrations
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Drizzle Studio for database management
- `npm run db:push` - Push schema changes directly to database
- `npm run db:pull` - Pull schema from database
- `npm run create-admin` - Create admin user (script)
- `npm run seed:tools` - Seed tools data (script)

## Architecture Overview

This is a **Next.js 15** application using the **App Router** with the following architecture:

### Route Groups
- `(auth)` - Authentication routes with NextAuth.js 5.0 beta
- `(admin)` - Admin dashboard protected routes
- `(marketing)` - Public marketing pages
- `(docs)` - Documentation viewer

### Database Layer
- **Drizzle ORM** with PostgreSQL
- Schema located in `src/lib/db/schema/`
- Two main entities:
  - `User` - Authentication and user management
  - `Tools` - AI toolkit management with categories and status
- Database credentials configured via `POSTGRES_URL` in `.env.local`

### Key Features
- **Tools Management System**: Categorized AI tools with status management (active/inactive/pending)
- **User Authentication**: NextAuth.js with role-based access (guest/admin)
- **Admin Dashboard**: Tool creation and management interface
- **Multi-language Support**: Vietnamese descriptions for tools

### UI Components
- **Radix UI** components for accessibility
- **Tailwind CSS 4** for styling
- **Framer Motion** for animations
- **Lucide React** for icons

### File Structure Conventions
- Route handlers in `route.ts` files
- Page components in `page.tsx` files
- Shared components typically in `_components/` folders
- Database schemas export both `Select` and `Insert` model types
- Authentication config in `(auth)/auth.config.ts` and `(auth)/auth.ts`

## Environment Setup
- Copy `.env.local.example` to `.env.local` if available
- Required environment variable: `POSTGRES_URL` for database connection
- Database migrations are tracked in `src/lib/db/migrations/`

## Tool Categories
The application supports these tool categories:
- `developer-tools`
- `design-tools` 
- `image-media-tools`
- `seo-analytics-tools`
- `productivity-utilities`
- `learning-reference`