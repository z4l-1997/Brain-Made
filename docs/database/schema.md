---
title: "Database Schema Documentation"
description: "Complete documentation of the Brain-Made database schema and relationships"
date: "2025-08-28"
author: "Brain-Made Team"
category: "Database"
---

# Database Schema Documentation

## Tổng quan

Brain-Made sử dụng PostgreSQL làm database chính với Drizzle ORM để quản lý schema và queries. Database được thiết kế để hỗ trợ authentication, user management, và các tính năng core của ứng dụng.

## Database Technologies

- **Database**: PostgreSQL
- **ORM**: Drizzle ORM
- **Migration Tool**: Drizzle Kit
- **Connection**: postgres package

## Schema Structure

### User Table

```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT,
  type TEXT DEFAULT 'user',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Columns**:

- `id`: Unique identifier (TEXT primary key)
- `email`: User email address (unique, required)
- `password`: Hashed password (optional for guest users)
- `type`: User type ('user' | 'admin' | 'guest')
- `created_at`: Record creation timestamp
- `updated_at`: Last update timestamp

### User Types

#### Regular User

```typescript
{
  id: "user_123",
  email: "user@example.com",
  password: "$2a$10$...", // bcrypt hash
  type: "user",
  created_at: "2025-08-28T...",
  updated_at: "2025-08-28T..."
}
```

#### Admin User

```typescript
{
  id: "admin_456",
  email: "admin@brainmade.com",
  password: "$2a$10$...",
  type: "admin",
  created_at: "2025-08-28T...",
  updated_at: "2025-08-28T..."
}
```

#### Guest User

```typescript
{
  id: "guest_789",
  email: "guest-12345",
  password: null, // No password for guests
  type: "user",
  created_at: "2025-08-28T...",
  updated_at: "2025-08-28T..."
}
```

## Drizzle Schema Definition

```typescript
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password"),
  type: text("type").default("user"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
```

## Database Operations

### User Queries

#### Create User

```typescript
export async function createUser(userData: NewUser): Promise<User> {
  const [user] = await db.insert(users).values(userData).returning();
  return user;
}
```

#### Find User by Email

```typescript
export async function findUserByEmail(email: string): Promise<User | null> {
  const user = await db.select().from(users).where(eq(users.email, email)).limit(1);

  return user[0] || null;
}
```

#### Find User by ID

```typescript
export async function findUserById(id: string): Promise<User | null> {
  const user = await db.select().from(users).where(eq(users.id, id)).limit(1);

  return user[0] || null;
}
```

#### Update User

```typescript
export async function updateUser(id: string, updates: Partial<NewUser>): Promise<User> {
  const [user] = await db
    .update(users)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(users.id, id))
    .returning();

  return user;
}
```

#### Delete User

```typescript
export async function deleteUser(id: string): Promise<void> {
  await db.delete(users).where(eq(users.id, id));
}
```

## Migration Management

### Generate Migration

```bash
pnpm db:generate
```

### Run Migration

```bash
pnpm db:migrate
```

### Database Studio

```bash
pnpm db:studio
```

### Push Schema Changes

```bash
pnpm db:push
```

## Connection Configuration

### Database URL

```typescript
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is required");
}
```

### Connection Pool

```typescript
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const client = postgres(connectionString, {
  max: 10, // Maximum connections
  idle_timeout: 20,
  connect_timeout: 10,
});

export const db = drizzle(client);
```

## Security Considerations

### Password Hashing

```typescript
import { hash, compare } from "bcrypt-ts";

// Hash password before storing
const hashedPassword = await hash(plainPassword, 10);

// Verify password
const isValid = await compare(plainPassword, hashedPassword);
```

### Guest User Creation

```typescript
export async function createGuestUser(): Promise<User> {
  const guestId = `guest-${Date.now()}`;

  return createUser({
    id: generateId(),
    email: guestId,
    password: null, // No password for guests
    type: "user",
  });
}
```

### Admin User Creation

```typescript
export async function createAdminUser(email: string, password: string): Promise<User> {
  const hashedPassword = await hash(password, 10);

  return createUser({
    id: generateId(),
    email,
    password: hashedPassword,
    type: "admin",
  });
}
```

## Query Performance

### Indexing

```sql
-- Email index for authentication
CREATE INDEX idx_users_email ON users(email);

-- Type index for admin queries
CREATE INDEX idx_users_type ON users(type);

-- Created at index for sorting
CREATE INDEX idx_users_created_at ON users(created_at);
```

### Query Optimization

```typescript
// ✅ Good - Use specific columns
const users = await db
  .select({
    id: users.id,
    email: users.email,
    type: users.type,
  })
  .from(users);

// ❌ Avoid - Select all columns
const users = await db.select().from(users);
```

## Error Handling

### Database Constraints

```typescript
try {
  await createUser(userData);
} catch (error) {
  if (error.code === "23505") {
    // Unique violation
    throw new ValidationError("Email already exists");
  }
  throw error;
}
```

### Connection Errors

```typescript
try {
  await db.select().from(users).limit(1);
} catch (error) {
  if (error.code === "ECONNREFUSED") {
    throw new AppError("Database connection failed", 503);
  }
  throw error;
}
```

## Testing

### Test Database Setup

```typescript
// Use separate test database
const testDb = drizzle(postgres(process.env.TEST_DATABASE_URL));

// Seed test data
export async function seedTestData() {
  await testDb.insert(users).values([
    {
      id: "test-user-1",
      email: "test@example.com",
      password: await hash("password123", 10),
      type: "user",
    },
    {
      id: "test-admin-1",
      email: "admin@example.com",
      password: await hash("admin123", 10),
      type: "admin",
    },
  ]);
}
```

### Cleanup

```typescript
export async function cleanupTestData() {
  await testDb.delete(users);
}
```

## Backup and Recovery

### Database Backup

```bash
pg_dump $DATABASE_URL > backup.sql
```

### Restore Database

```bash
psql $DATABASE_URL < backup.sql
```

## Future Enhancements

1. **Audit Logging**: Track all database changes
2. **Soft Deletes**: Add deleted_at column
3. **User Profiles**: Extend user data with profiles table
4. **Roles & Permissions**: More granular access control
5. **Database Sharding**: For scalability
6. **Read Replicas**: For performance optimization
