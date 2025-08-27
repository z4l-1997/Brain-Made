# Middleware Documentation

## Tổng quan

File `middleware.ts` là một thành phần quan trọng trong Next.js application, chịu trách nhiệm xử lý authentication, authorization và routing logic trước khi request đến các route handlers.

## Chức năng chính

### 1. Health Check Endpoint

```typescript
if (pathname.startsWith("/ping")) {
  return new Response("pong", { status: 200 });
}
```

- Cung cấp endpoint `/ping` để kiểm tra trạng thái server
- Đặc biệt hữu ích cho Playwright testing và health monitoring
- Trả về response "pong" với status 200

### 2. Authentication API Bypass

```typescript
if (pathname.startsWith("/api/auth")) {
  return NextResponse.next();
}
```

- Cho phép tất cả requests đến `/api/auth/*` đi qua mà không cần kiểm tra authentication
- Đảm bảo NextAuth.js có thể hoạt động bình thường

### 3. Token Validation

```typescript
const token = await getToken({
  req: request,
  secret: process.env.AUTH_SECRET,
  secureCookie: !isDevelopmentEnvironment,
});
```

- Sử dụng NextAuth.js để lấy JWT token từ request
- `secureCookie` được set dựa trên environment (false cho development, true cho production)
- Token chứa thông tin user bao gồm email và type

### 4. Guest User Handling

```typescript
if (!token) {
  const redirectUrl = encodeURIComponent(request.url);
  return NextResponse.redirect(new URL(`/api/auth/guest?redirectUrl=${redirectUrl}`, request.url));
}
```

- Nếu không có token (user chưa đăng nhập), redirect đến guest authentication
- Lưu URL hiện tại để redirect về sau khi authentication thành công
- Sử dụng `encodeURIComponent` để encode URL an toàn

### 5. Guest User Identification

```typescript
const isGuest = guestRegex.test(token?.email ?? "");
```

- Kiểm tra xem user có phải là guest không thông qua email pattern
- `guestRegex = /^guest-\d+$/` - match email có format "guest-{số}"

### 6. Authenticated User Redirect

```typescript
if (token && !isGuest && ["/login", "/register"].includes(pathname)) {
  return NextResponse.redirect(new URL("/", request.url));
}
```

- Nếu user đã đăng nhập (không phải guest) và cố truy cập login/register page
- Redirect về trang chủ để tránh confusion

### 7. Admin Route Protection

```typescript
if (pathname.startsWith("/dashboard")) {
  if (token?.type !== "admin") {
    return NextResponse.redirect(new URL("/", request.url));
  }
}
```

- Bảo vệ tất cả routes bắt đầu với `/dashboard`
- Chỉ cho phép users có `type === "admin"` truy cập
- Redirect về trang chủ nếu không có quyền admin

## Route Matching Configuration

```typescript
export const config = {
  matcher: [
    "/",
    "/chat/:id",
    "/api/:path*",
    "/login",
    "/register",
    "/dashboard/:path*",
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
```

### Các routes được middleware xử lý:

- `/` - Trang chủ
- `/chat/:id` - Chat routes với dynamic ID
- `/api/:path*` - Tất cả API routes
- `/login`, `/register` - Authentication pages
- `/dashboard/:path*` - Tất cả admin dashboard routes

### Các routes được loại trừ:

- `_next/static` - Static files của Next.js
- `_next/image` - Image optimization files
- `favicon.ico`, `sitemap.xml`, `robots.txt` - Metadata files

## Flow Logic

1. **Health Check**: Kiểm tra `/ping` endpoint trước
2. **Auth API Bypass**: Cho phép NextAuth.js routes đi qua
3. **Token Extraction**: Lấy JWT token từ request
4. **Guest Handling**: Redirect đến guest auth nếu không có token
5. **User Type Check**: Xác định guest hay authenticated user
6. **Auth Page Redirect**: Redirect authenticated users khỏi login/register
7. **Admin Protection**: Kiểm tra quyền admin cho dashboard routes
8. **Default**: Cho phép request tiếp tục nếu pass tất cả checks

## Environment Dependencies

- `AUTH_SECRET`: Secret key cho JWT signing/verification
- `NODE_ENV`: Environment mode (development/production)
- `guestRegex`: Pattern để identify guest users

## Security Features

1. **JWT-based Authentication**: Sử dụng secure JWT tokens
2. **Role-based Authorization**: Phân quyền admin/user
3. **Guest User Support**: Cho phép anonymous access với restrictions
4. **Secure Cookie**: Sử dụng secure cookies trong production
5. **URL Encoding**: An toàn encode redirect URLs

## Best Practices

1. **Performance**: Middleware chỉ chạy cho routes cần thiết thông qua matcher config
2. **Security**: Kiểm tra authorization trước khi cho phép truy cập protected routes
3. **UX**: Smooth redirect flow cho authenticated/unauthenticated users
4. **Testing**: Support cho Playwright testing thông qua ping endpoint
