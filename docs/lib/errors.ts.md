---
title: "Error Handling Documentation"
description: "Comprehensive guide to error handling in Brain-Made application"
date: "2025-08-28"
author: "Brain-Made Team"
---

# Error Handling Documentation

## Tổng quan

File `errors.ts` chứa các custom error classes và utilities để xử lý lỗi một cách nhất quán trong toàn bộ ứng dụng Brain-Made.

## Custom Error Classes

### AppError

```typescript
export class AppError extends Error {
  constructor(message: string, public statusCode: number = 500, public code?: string) {
    super(message);
    this.name = "AppError";
  }
}
```

**Mục đích**: Base class cho tất cả application errors

**Properties**:

- `message`: Error message
- `statusCode`: HTTP status code (default: 500)
- `code`: Optional error code for categorization

### ValidationError

```typescript
export class ValidationError extends AppError {
  constructor(message: string, field?: string) {
    super(message, 400, "VALIDATION_ERROR");
    this.field = field;
  }
}
```

**Mục đích**: Xử lý validation errors với HTTP 400 status

### AuthenticationError

```typescript
export class AuthenticationError extends AppError {
  constructor(message: string = "Authentication required") {
    super(message, 401, "AUTH_ERROR");
  }
}
```

**Mục đích**: Xử lý authentication errors với HTTP 401 status

## Error Handling Best Practices

### 1. Consistent Error Structure

```typescript
// ✅ Good
throw new ValidationError("Email is required", "email");

// ❌ Avoid
throw new Error("Email is required");
```

### 2. Proper Error Catching

```typescript
// ✅ Good
try {
  await userService.createUser(userData);
} catch (error) {
  if (error instanceof ValidationError) {
    return { error: error.message, field: error.field };
  }
  throw error;
}
```

### 3. API Error Response

```typescript
// ✅ Good
return NextResponse.json({ error: "User not found", code: "USER_NOT_FOUND" }, { status: 404 });
```

## Error Logging

### Development Environment

```typescript
if (isDevelopmentEnvironment) {
  console.error("Error details:", {
    message: error.message,
    stack: error.stack,
    statusCode: error.statusCode,
  });
}
```

### Production Environment

```typescript
if (isProductionEnvironment) {
  // Send to monitoring service
  logger.error("Application error", {
    message: error.message,
    statusCode: error.statusCode,
    userId: user?.id,
    timestamp: new Date().toISOString(),
  });
}
```

## Common Error Scenarios

### Database Errors

```typescript
try {
  const user = await db.user.findUnique({ where: { id } });
  if (!user) {
    throw new AppError("User not found", 404, "USER_NOT_FOUND");
  }
} catch (error) {
  if (error.code === "P2002") {
    throw new ValidationError("Email already exists", "email");
  }
  throw error;
}
```

### Authentication Errors

```typescript
const token = await getToken({ req: request });
if (!token) {
  throw new AuthenticationError("Valid session required");
}

if (token.type !== "admin") {
  throw new AppError("Insufficient permissions", 403, "FORBIDDEN");
}
```

### Validation Errors

```typescript
const { error, data } = userSchema.safeParse(requestBody);
if (error) {
  throw new ValidationError(`Validation failed: ${error.issues.map((i) => i.message).join(", ")}`);
}
```
