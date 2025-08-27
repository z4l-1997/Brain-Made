---
title: "Authentication API Documentation"
description: "Complete guide to authentication endpoints and flows"
date: "2025-08-28"
author: "Brain-Made Team"
category: "API"
---

# Authentication API Documentation

## Tổng quan

Brain-Made sử dụng NextAuth.js v5 để xử lý authentication với support cho multiple providers và custom flows. API authentication bao gồm login, register, guest access, và session management.

## Authentication Endpoints

### Base URL

```
/api/auth/*
```

### Available Endpoints

#### 1. NextAuth.js Core Endpoints

```
GET  /api/auth/signin      # Sign in page
POST /api/auth/signin      # Sign in action
GET  /api/auth/signout     # Sign out page
POST /api/auth/signout     # Sign out action
GET  /api/auth/session     # Get current session
GET  /api/auth/csrf        # Get CSRF token
GET  /api/auth/providers   # Get available providers
```

#### 2. Custom Guest Endpoint

```
GET /api/auth/guest        # Create guest session
```

## Authentication Flows

### 1. Regular Login Flow

```typescript
// POST /api/auth/signin
{
  "email": "user@example.com",
  "password": "password123",
  "csrfToken": "csrf_token_here"
}
```

**Response Success (200)**:

```typescript
{
  "url": "/dashboard", // Redirect URL
  "ok": true
}
```

**Response Error (401)**:

```typescript
{
  "error": "Invalid credentials",
  "url": "/login?error=CredentialsSignin"
}
```

### 2. Guest Access Flow

```typescript
// GET /api/auth/guest?redirectUrl=https://example.com/chat
```

**Response Success (302)**:

```
Location: /api/auth/signin?email=guest-1234567890&password=auto_generated
```

**Process**:

1. Generate unique guest ID: `guest-{timestamp}`
2. Create guest user in database (if not exists)
3. Auto-login guest user
4. Redirect to original URL

### 3. Registration Flow

```typescript
// POST /api/auth/signin (with registration data)
{
  "email": "newuser@example.com",
  "password": "newpassword123",
  "name": "New User",
  "action": "register"
}
```

## Session Management

### Session Structure

```typescript
interface Session {
  user: {
    id: string;
    email: string;
    type: "user" | "admin";
    name?: string;
  };
  expires: string; // ISO date string
}
```

### Get Current Session

```typescript
// GET /api/auth/session
```

**Response (Authenticated)**:

```typescript
{
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "type": "user"
  },
  "expires": "2025-09-28T12:00:00.000Z"
}
```

**Response (Guest)**:

```typescript
{
  "user": {
    "id": "guest_456",
    "email": "guest-1234567890",
    "type": "user"
  },
  "expires": "2025-09-28T12:00:00.000Z"
}
```

**Response (Unauthenticated)**:

```typescript
null;
```

## Authentication Configuration

### NextAuth.js Config

```typescript
// auth.config.ts
export const authConfig = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const user = await findUserByEmail(credentials.email);

        if (user && (await compare(credentials.password, user.password))) {
          return {
            id: user.id,
            email: user.email,
            type: user.type,
          };
        }

        return null;
      },
    }),
  ],
  pages: {
    signIn: "/login",
    signOut: "/login",
    error: "/login",
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.type = user.type;
      }
      return token;
    },
    session({ session, token }) {
      session.user.type = token.type;
      return session;
    },
  },
};
```

### Middleware Integration

```typescript
// middleware.ts
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
  });

  // Handle unauthenticated users
  if (!token) {
    const redirectUrl = encodeURIComponent(request.url);
    return NextResponse.redirect(new URL(`/api/auth/guest?redirectUrl=${redirectUrl}`, request.url));
  }

  // Check admin access
  if (request.nextUrl.pathname.startsWith("/dashboard")) {
    if (token.type !== "admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}
```

## Error Handling

### Common Errors

#### Invalid Credentials

```typescript
{
  "error": "CredentialsSignin",
  "message": "Invalid email or password"
}
```

#### Session Expired

```typescript
{
  "error": "SessionRequired",
  "message": "Please sign in to continue"
}
```

#### Access Denied

```typescript
{
  "error": "AccessDenied",
  "message": "You don't have permission to access this resource"
}
```

#### CSRF Error

```typescript
{
  "error": "CSRFError",
  "message": "Invalid CSRF token"
}
```

## Security Features

### CSRF Protection

```typescript
// Automatic CSRF token validation
const csrfToken = await getCsrfToken();

// Include in forms
<input type="hidden" name="csrfToken" value={csrfToken} />;
```

### Secure Cookies

```typescript
// Production configuration
cookies: {
  sessionToken: {
    name: 'next-auth.session-token',
    options: {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure: true, // HTTPS only in production
    }
  }
}
```

### Password Hashing

```typescript
import { hash, compare } from "bcrypt-ts";

// Register new user
const hashedPassword = await hash(password, 10);
await createUser({ email, password: hashedPassword });

// Verify login
const isValid = await compare(inputPassword, user.password);
```

## Client-Side Usage

### React Hooks

```typescript
import { useSession, signIn, signOut } from "next-auth/react";

export function AuthComponent() {
  const { data: session, status } = useSession();

  if (status === "loading") return <div>Loading...</div>;

  if (session) {
    return (
      <div>
        <p>Signed in as {session.user.email}</p>
        <button onClick={() => signOut()}>Sign out</button>
      </div>
    );
  }

  return (
    <div>
      <p>Not signed in</p>
      <button onClick={() => signIn()}>Sign in</button>
    </div>
  );
}
```

### Manual Session Check

```typescript
// Client-side
const response = await fetch("/api/auth/session");
const session = await response.json();

if (session?.user) {
  console.log("User is authenticated:", session.user);
} else {
  console.log("User is not authenticated");
}
```

## Testing

### Test Authentication

```typescript
// Mock session for testing
const mockSession = {
  user: {
    id: "test-user",
    email: "test@example.com",
    type: "user",
  },
  expires: "2025-12-31",
};

// Mock useSession hook
jest.mock("next-auth/react", () => ({
  useSession: () => ({ data: mockSession, status: "authenticated" }),
}));
```

### API Testing

```typescript
// Test login endpoint
const response = await fetch("/api/auth/signin", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    email: "test@example.com",
    password: "password123",
  }),
});

expect(response.status).toBe(200);
```

## Rate Limiting

### Login Attempts

```typescript
// Implement rate limiting for login attempts
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

// Track failed attempts by IP
const failedAttempts = new Map();

export function checkRateLimit(ip: string): boolean {
  const attempts = failedAttempts.get(ip) || { count: 0, resetTime: Date.now() + WINDOW_MS };

  if (Date.now() > attempts.resetTime) {
    attempts.count = 0;
    attempts.resetTime = Date.now() + WINDOW_MS;
  }

  if (attempts.count >= MAX_ATTEMPTS) {
    throw new Error("Too many login attempts. Please try again later.");
  }

  attempts.count++;
  failedAttempts.set(ip, attempts);

  return true;
}
```

## Environment Variables

```env
# Required
AUTH_SECRET=your-auth-secret-here
DATABASE_URL=postgresql://...

# Optional
NEXTAUTH_URL=https://yourdomain.com
AUTH_TRUST_HOST=true
```

## Best Practices

### 1. Secure Session Management

```typescript
// ✅ Good - Check session server-side
export async function getServerSideProps(context) {
  const session = await getServerSession(context.req, context.res, authOptions);

  if (!session) {
    return { redirect: { destination: "/login", permanent: false } };
  }

  return { props: { session } };
}
```

### 2. Protected API Routes

```typescript
// ✅ Good - Validate session in API routes
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Process authenticated request
}
```

### 3. Role-Based Access

```typescript
// ✅ Good - Check user roles
function requireAdmin(session: Session) {
  if (session?.user?.type !== "admin") {
    throw new Error("Admin access required");
  }
}
```
