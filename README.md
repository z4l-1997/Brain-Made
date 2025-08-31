# 🧠 Brain Made - Developer Tools & Resources

A comprehensive **Next.js 15** application featuring a curated collection of developer tools, AI assistants, and resources. Built with modern architecture using App Router, TypeScript, and a powerful tech stack.

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-blue?style=flat-square&logo=postgresql)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat-square&logo=tailwind-css)

## ✨ Features

### 🔧 **Tool Management System**
- Comprehensive catalog of developer tools and AI resources
- Categorized tools: Developer Tools, Design Tools, Image/Media, SEO/Analytics, Productivity, Learning
- Vietnamese language support with localized descriptions
- Featured tools highlighting and status management (Active/Inactive/Pending)

### 🔐 **Authentication & Authorization**
- **NextAuth.js 5.0 beta** integration
- Role-based access control (Guest/Admin)
- Secure session management

### 🎛️ **Admin Dashboard**
- Tool creation and management interface
- User management capabilities
- Real-time status updates and analytics

### 🎨 **Modern UI/UX**
- **Radix UI** components for accessibility
- **Tailwind CSS 4** with responsive design
- **Framer Motion** animations
- **Dark/Light mode** support with next-themes
- **Lucide React** icons

### 📊 **Database Architecture**
- **Drizzle ORM** with PostgreSQL
- Optimized schema design for tools and users
- Type-safe database operations

## 🚀 Tech Stack

### **Frontend**
- **Next.js 15** - React framework with App Router
- **TypeScript 5** - Type safety and developer experience
- **Tailwind CSS 4** - Utility-first CSS framework
- **Radix UI** - Headless UI components
- **Framer Motion** - Animation library

### **Backend**
- **Next.js API Routes** - Server-side functionality
- **NextAuth.js 5** - Authentication solution
- **Drizzle ORM** - Type-safe database ORM
- **PostgreSQL** - Primary database

### **Development Tools**
- **ESLint** - Code linting
- **TypeScript** - Static type checking
- **Turbopack** - Fast bundler for development

### **Cloud Services**
- **Cloudinary** - Image and media management
- **Vercel** - Deployment platform (optional)

## 🏗️ Project Architecture

### **Complete Directory Structure**

```
Brain-Made/
├── .claude/                    # Claude Code configuration
│   ├── agents/                # Custom agents
│   ├── commands/              # Custom commands
│   └── output-style/          # Output styling
├── .next/                     # Next.js build artifacts
├── docs/                      # Project documentation
│   ├── api/                  # API documentation
│   ├── database/             # Database docs
│   └── lib/                  # Library documentation
├── scripts/                   # Utility scripts
│   ├── create-admin.ts       # Admin user creation
│   └── seed-tools.ts         # Database seeding
└── src/                      # Source code
    ├── app/                  # Next.js App Router
    │   ├── (admin)/         # Admin dashboard routes
    │   │   └── dashboard/   # Admin panel
    │   │       ├── page.tsx # Dashboard home
    │   │       └── toolkit/ # Tool management
    │   ├── (auth)/          # Authentication routes
    │   │   ├── api/auth/    # NextAuth API routes
    │   │   │   ├── [...nextauth]/ # NextAuth handlers
    │   │   │   └── guest/   # Guest authentication
    │   │   ├── login/       # Login page
    │   │   ├── register/    # Registration page
    │   │   ├── auth.config.ts # Auth configuration
    │   │   └── auth.ts      # NextAuth setup
    │   ├── (docs)/          # Documentation routes
    │   │   └── docs/        # Documentation viewer
    │   │       ├── components/ # Doc components
    │   │       ├── layout.tsx  # Doc layout
    │   │       └── page.tsx    # Doc home
    │   ├── (marketing)/     # Public marketing pages
    │   │   ├── api/marketing/ # Marketing API routes
    │   │   ├── ai-toolkit/  # AI tools showcase
    │   │   ├── toolkit/     # Main toolkit page
    │   │   ├── layout.tsx   # Marketing layout
    │   │   └── page.tsx     # Home redirect
    │   ├── api/             # Global API routes
    │   │   └── upload/      # File upload endpoint
    │   ├── layout.tsx       # Root layout
    │   ├── globals.css      # Global styles
    │   └── middleware.ts    # Route middleware
    ├── components/          # Reusable UI components
    │   ├── ui/              # Shadcn/ui components (47 components)
    │   │   ├── button.tsx   # Button component
    │   │   ├── input.tsx    # Input component
    │   │   ├── card.tsx     # Card component
    │   │   ├── dialog.tsx   # Dialog component
    │   │   ├── form.tsx     # Form component
    │   │   ├── table.tsx    # Table component
    │   │   ├── toast.tsx    # Toast component
    │   │   └── ...          # Additional UI components
    │   ├── menu_bar/        # Navigation components
    │   ├── icons.tsx        # Custom icon components
    │   ├── submit-button.tsx # Form submit button
    │   └── toast.tsx        # Toast notifications
    ├── features/            # Feature-based modules
    │   ├── admin/           # Admin functionality
    │   │   └── toolkit/     # Admin tool management
    │   │       ├── _components/ # Tool management UI
    │   │       │   ├── create-tool-form.tsx
    │   │       │   ├── image-upload.tsx
    │   │       │   ├── image-preview-modal.tsx
    │   │       │   └── tools-list.tsx
    │   │       ├── _db/     # Database queries
    │   │       ├── _view/   # Page views
    │   │       └── actions.ts # Server actions
    │   ├── auth/            # Authentication features
    │   │   ├── _component/  # Auth UI components
    │   │   ├── _db/         # Auth database queries
    │   │   ├── _lib/        # Auth utilities
    │   │   ├── _views/      # Auth page views
    │   │   └── actions.ts   # Auth server actions
    │   └── marketing/       # Marketing features
    │       └── toolkit/     # Public toolkit display
    │           └── _views/  # Marketing views
    ├── hooks/               # Custom React hooks
    │   └── use-*.ts        # Custom hooks
    ├── lib/                 # Utility functions & configurations
    │   ├── db/              # Database configuration
    │   │   ├── schema/      # Drizzle schema definitions
    │   │   │   ├── index.ts # Schema exports
    │   │   │   ├── user.ts  # User schema
    │   │   │   └── tools.ts # Tools schema
    │   │   ├── migrations/  # Database migrations
    │   │   ├── migrate.ts   # Migration runner
    │   │   └── index.ts     # Database connection
    │   ├── cloudinary.ts    # Cloudinary configuration
    │   ├── constants.ts     # App constants
    │   ├── errors.ts        # Error handling
    │   └── utils.ts         # Utility functions
    └── middleware.ts        # Next.js middleware
```

### **Architecture Highlights**

#### 🎯 **Feature-Based Organization**
- **`/features`** - Domain-driven feature modules with co-located components, logic, and data
- **Clean separation** between admin, auth, and marketing features
- **Internal structure** with `_components`, `_db`, `_lib`, `_views` for organization

#### 🛡️ **Route Groups & Protection**
- **`(admin)`** - Protected admin routes with dashboard functionality
- **`(auth)`** - Authentication flows and API endpoints  
- **`(marketing)`** - Public-facing pages and API routes
- **`(docs)`** - Documentation system with viewer components

#### 📊 **Database Architecture**
- **Drizzle ORM** with PostgreSQL for type-safe database operations
- **Schema-first** approach with separate files for each entity
- **Migration system** for database version control

#### 🎨 **UI Component System**
- **47 Shadcn/ui components** for consistent design system
- **Custom components** for specific functionality
- **Icon system** with custom and Lucide icons

#### ⚡ **Performance & Developer Experience**
- **102 TypeScript files** with strict type safety
- **Server Components** by default with Client Components when needed
- **Feature co-location** for maintainable code structure
- **Turbopack** for fast development and builds

## 🛠️ Getting Started

### **Prerequisites**

- Node.js 18+ 
- PostgreSQL database
- Cloudinary account (optional, for image uploads)

### **Installation**

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/brain-made.git
   cd brain-made
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env.local
   ```
   
   Configure the following variables in `.env.local`:
   ```env
   # Authentication
   AUTH_SECRET=your-secret-key
   # NEXTAUTH_URL=http://localhost:3000
   
   # Database
   POSTGRES_URL=postgresql://username:password@localhost:5432/brain_made
   
   # Admin Demo (Optional)
   ADMIN_EMAIL_DEMO=admin@example.com
   ADMIN_PASSWORD_DEMO=your-admin-password
   
   # Cloudinary (Optional)
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   ```

4. **Database Setup**
   ```bash
   # Generate and run migrations
   npm run db:generate
   npm run db:migrate
   
   # Optional: Create admin user
   npm run create-admin
   
   # Optional: Seed tools data
   npm run seed:tools
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📜 Available Scripts

### **Development**
- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build production app with Turbopack
- `npm start` - Start production server
- `npm run lint` - Run ESLint

### **Database Management**
- `npm run db:generate` - Generate Drizzle schema migrations
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Drizzle Studio for database management
- `npm run db:push` - Push schema changes directly to database
- `npm run db:pull` - Pull schema from database

### **Utility Scripts**
- `npm run create-admin` - Create admin user
- `npm run seed:tools` - Seed tools database

## 🗄️ Database Schema

### **Tools Table**
```typescript
interface Tool {
  id: string;                 // UUID primary key
  title: string;              // Tool name
  description: string;        // English description
  descriptionVi?: string;     // Vietnamese description
  url: string;                // Tool URL
  category: ToolCategory;     // Tool category
  featured: boolean;          // Featured status
  image?: string;             // Tool image URL
  status: ToolStatus;         // Active/Inactive/Pending
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;         // User ID reference
}
```

### **Tool Categories**
- `developer-tools` - Programming and development tools
- `design-tools` - Design and creative tools
- `image-media-tools` - Image and media processing
- `seo-analytics-tools` - SEO and analytics tools
- `productivity-utilities` - Productivity and utility tools
- `learning-reference` - Learning and reference materials

## 🎯 Key Features Detail

### **Tool Management**
- **Category-based Organization**: Tools organized into logical categories
- **Status Management**: Tools can be Active, Inactive, or Pending
- **Featured Tools**: Highlight important or popular tools
- **Multilingual Support**: English and Vietnamese descriptions
- **Admin Controls**: Full CRUD operations for administrators

### **User Authentication**
- **NextAuth.js Integration**: Secure authentication system
- **Role-based Access**: Different permissions for guests and admins
- **Session Management**: Persistent login sessions
- **Admin Dashboard**: Protected admin-only routes

### **Modern Architecture**
- **App Router**: Latest Next.js routing system
- **Server Components**: Improved performance with React Server Components
- **Type Safety**: Full TypeScript integration
- **Database ORM**: Type-safe database operations with Drizzle
- **Responsive Design**: Mobile-first design approach

## 🚀 Deployment

### **Vercel (Recommended)**

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically with git pushes

### **Manual Deployment**

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start production server**
   ```bash
   npm start
   ```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is private and proprietary. All rights reserved.

## 📞 Support

For support and questions:
- Create an issue in the repository
- Contact the development team

---

**Built with ❤️ using Next.js 15 and modern web technologies**