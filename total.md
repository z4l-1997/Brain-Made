# Brain Made - Project Overview

## Project Overview

**Brain Made** is a **developer resources platform** built with Next.js 15 and modern web technologies. It's designed to help developers discover and access various development tools, resources, and services.

### Key Features

🛠️ **Developer Tools Directory**
- Curated collection of development tools and resources
- Tools categorized by type (AI assistants, CSS frameworks, code snippets, etc.)
- Rating system and tagging for easy discovery
- Pagination and search functionality

🔐 **Authentication System**
- NextAuth.js v5 integration for secure authentication
- User management with admin capabilities
- Protected routes and role-based access

📊 **Database & Content Management**
- PostgreSQL database with Drizzle ORM
- Tools schema with comprehensive metadata (title, description, URL, category, tags, ratings)
- Database migrations and seeding capabilities
- Admin tools for content management

### Technology Stack

**Frontend:**
- **Next.js 15** with App Router and Turbopack
- **React 19** with TypeScript
- **TailwindCSS 4** for styling
- **Framer Motion** for animations
- **Radix UI** components for accessibility

**Backend & Database:**
- **PostgreSQL** database
- **Drizzle ORM** for database operations
- **NextAuth.js** for authentication
- **Server Actions** for API operations

**Development Tools:**
- **TypeScript** for type safety
- **ESLint** for code quality
- **pnpm** as package manager

### Project Structure

```
Brain-Made/
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── (admin)/         # Admin dashboard routes
│   │   ├── (auth)/          # Authentication logic
│   │   └── (marketing)/     # Public marketing pages
│   ├── components/          # Reusable UI components
│   ├── lib/                 # Utilities and database
│   │   └── db/              # Database schema and migrations
│   └── views/               # Page-specific components
├── docs/                    # Documentation
└── scripts/                 # Database seeding scripts
```

### Current State

The project appears to be in **early development** with:
- ✅ Basic Next.js setup with modern tooling
- ✅ Database schema for tools management
- ✅ Authentication infrastructure
- ✅ Tools listing component with pagination
- 🚧 Marketing page showing placeholder content ("Hiêu")

### Available Scripts

- `pnpm dev` - Start development server with Turbopack
- `pnpm build` - Build for production
- `db:*` commands - Database operations (migrate, studio, push, etc.)
- `create-admin` - Create admin users
- `seed:tools` - Seed database with tools data

### Environment Setup

The project requires several environment variables:
- **AUTH_SECRET** - Authentication secret key
- **POSTGRES_URL** - Database connection
- **XAI_API_KEY** - AI API integration
- **BLOB_READ_WRITE_TOKEN** - File storage
- **REDIS_URL** - Caching layer

### Database Schema

#### Tools Table
The main entity for storing developer tools with the following structure:
- `id` - UUID primary key
- `title` - Tool name (max 255 chars)
- `description` - Tool description
- `descriptionVi` - Vietnamese description (optional)
- `url` - Tool URL (max 500 chars)
- `category` - Tool category (max 100 chars)
- `tags` - JSON array of tags
- `featured` - Boolean flag for featured tools
- `rating` - Numeric rating (default 0)
- `image` - Tool image URL (optional)
- `createdAt/updatedAt` - Timestamps
- `createdBy` - Foreign key to user
- `status` - Tool status (active/inactive/pending)

### Package Dependencies

**Key Production Dependencies:**
- `next@15.5.2` - React framework
- `react@19.1.0` & `react-dom@19.1.0` - React library
- `drizzle-orm@^0.44.5` - Database ORM
- `next-auth@5.0.0-beta.29` - Authentication
- `framer-motion@^12.23.12` - Animation library
- `@radix-ui/*` - UI component primitives
- `tailwind-merge@^3.3.1` - CSS utility merger
- `zod@^4.1.3` - Schema validation

**Development Dependencies:**
- `typescript@^5` - Type checking
- `tailwindcss@^4` - CSS framework
- `drizzle-kit@^0.31.4` - Database toolkit
- `eslint@^9` - Code linting

### Getting Started

1. **Clone the repository**
2. **Install dependencies:** `pnpm install`
3. **Set up environment variables** (copy from `.env.example`)
4. **Run database migrations:** `pnpm run db:migrate`
5. **Start development server:** `pnpm dev`
6. **Access at:** http://localhost:3000

### Next Steps for Development

- Complete marketing page implementation
- Add API routes for tools management
- Implement admin dashboard
- Add search and filtering capabilities
- Create tool submission workflow
- Add user profiles and favorites
- Implement tool reviews and comments

This project shows excellent potential as a comprehensive developer tools directory with modern architecture and good development practices!
