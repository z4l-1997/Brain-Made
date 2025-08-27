# Constants Documentation

## Tổng quan

File `constants.ts` chứa các hằng số toàn cục được sử dụng trong toàn bộ ứng dụng Brain-Made. Các constants này bao gồm environment detection, regex patterns, và các giá trị cấu hình quan trọng.

## Import Dependencies

```typescript
import { generateDummyPassword } from "./db/utils";
```

- Import function `generateDummyPassword` từ database utilities để tạo password dummy cho testing

## Environment Detection Constants

### 1. Production Environment Check

```typescript
export const isProductionEnvironment = process.env.NODE_ENV === "production";
```

**Mục đích**: Kiểm tra xem ứng dụng có đang chạy trong production environment không

**Sử dụng**:

- Điều kiện để enable/disable các tính năng chỉ dành cho production
- Bật/tắt logging levels khác nhau
- Cấu hình security settings
- Optimization settings

**Giá trị**: `true` khi `NODE_ENV=production`, ngược lại `false`

### 2. Development Environment Check

```typescript
export const isDevelopmentEnvironment = process.env.NODE_ENV === "development";
```

**Mục đích**: Kiểm tra xem ứng dụng có đang chạy trong development environment không

**Sử dụng**:

- Enable development tools và debugging features
- Hot reload và development optimizations
- Detailed error messages và stack traces
- Development-only middleware

**Giá trị**: `true` khi `NODE_ENV=development`, ngược lại `false`

### 3. Test Environment Check

```typescript
export const isTestEnvironment = Boolean(process.env.PLAYWRIGHT_TEST_BASE_URL || process.env.PLAYWRIGHT || process.env.CI_PLAYWRIGHT);
```

**Mục đích**: Kiểm tra xem ứng dụng có đang chạy trong test environment không

**Logic kiểm tra**: Sẽ trả về `true` nếu có bất kỳ environment variable nào sau:

- `PLAYWRIGHT_TEST_BASE_URL`: URL base cho Playwright testing
- `PLAYWRIGHT`: Flag general cho Playwright environment
- `CI_PLAYWRIGHT`: Flag cho Playwright testing trong CI/CD pipeline

**Sử dụng**:

- Disable certain features during testing
- Use test-specific configurations
- Mock external services
- Enable test utilities và helpers

## Validation Patterns

### Guest User Regex

```typescript
export const guestRegex = /^guest-\d+$/;
```

**Mục đích**: Regex pattern để xác định guest users thông qua email format

**Pattern Breakdown**:

- `^`: Bắt đầu string
- `guest-`: Literal string "guest-"
- `\d+`: Một hoặc nhiều digits (số)
- `$`: Kết thúc string

**Ví dụ valid matches**:

- `guest-1`
- `guest-123`
- `guest-999999`

**Ví dụ invalid matches**:

- `guest-` (thiếu số)
- `guest-abc` (có chữ cái)
- `user-123` (sai prefix)
- `guest-1-extra` (có text thêm)

**Sử dụng trong ứng dụng**:

- Authentication middleware để identify guest users
- Authorization logic để phân quyền
- UI conditional rendering cho guest vs authenticated users

## Security Constants

### Dummy Password

```typescript
export const DUMMY_PASSWORD = generateDummyPassword();
```

**Mục đích**: Tạo password dummy để sử dụng trong testing và development

**Chi tiết**:

- Được generate từ function `generateDummyPassword()` trong database utils
- Chỉ sử dụng cho testing purposes
- Không được sử dụng trong production cho real users
- Giúp tạo consistent test data

**Use Cases**:

- Seeding test database với dummy users
- E2E testing với predictable credentials
- Development environment setup
- Playwright testing scenarios

## Best Practices

### 1. Environment Usage

```typescript
// ✅ Correct usage
if (isDevelopmentEnvironment) {
  console.log("Debug information");
}

if (isProductionEnvironment) {
  enableAnalytics();
}

// ❌ Avoid direct env checks throughout codebase
if (process.env.NODE_ENV === "development") {
  // Prefer using the constants instead
}
```

### 2. Guest User Validation

```typescript
// ✅ Correct usage
const isGuest = guestRegex.test(userEmail);

if (isGuest) {
  // Apply guest user restrictions
  return restrictedFeatureSet;
}

// ❌ Avoid string matching
if (userEmail.startsWith("guest-")) {
  // Use regex for proper validation
}
```

### 3. Test Environment Handling

```typescript
// ✅ Good practice
if (isTestEnvironment) {
  // Use mock services
  return mockApiClient;
} else {
  return realApiClient;
}
```

## Integration Points

### 1. Middleware Integration

```typescript
// In middleware.ts
import { guestRegex, isProductionEnvironment } from "@/lib/constants";

const isGuest = guestRegex.test(token?.email ?? "");
const secureCookie = isProductionEnvironment;
```

### 2. Authentication System

```typescript
// In auth configuration
import { isDevelopmentEnvironment, DUMMY_PASSWORD } from "@/lib/constants";

const config = {
  debug: isDevelopmentEnvironment,
  testPassword: isDevelopmentEnvironment ? DUMMY_PASSWORD : undefined,
};
```

### 3. Database Operations

```typescript
// In database utilities
import { isTestEnvironment, DUMMY_PASSWORD } from "@/lib/constants";

export async function seedTestUsers() {
  if (isTestEnvironment) {
    return createUser({ password: DUMMY_PASSWORD });
  }
}
```

## Security Considerations

1. **Environment Variables**: Luôn validate environment variables trước khi sử dụng
2. **Dummy Password**: Chỉ sử dụng DUMMY_PASSWORD trong non-production environments
3. **Guest Regex**: Regex pattern này có thể được bypass nếu không validation proper
4. **Environment Detection**: Có thể có edge cases where multiple environments are detected

## Performance Notes

- Tất cả constants được evaluate một lần khi module load
- Regex compilation happens once và được cached
- Environment checks are O(1) operations
- No runtime overhead for repeated usage

## Future Enhancements

1. **Environment Validation**: Thêm validation cho required environment variables
2. **Type Safety**: Sử dụng TypeScript enums cho environment types
3. **Configuration Management**: Tách complex configuration ra separate config files
4. **Feature Flags**: Thêm feature flag constants cho A/B testing
