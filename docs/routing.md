# Routing Standards

## Rule: All App Routes Live Under `/dashboard`

Every page in this app is nested under the `/dashboard` path. There are no top-level feature pages.

```
/dashboard          → main dashboard
/dashboard/workout  → workout pages
/dashboard/...      → all other features
```

Do not create routes outside of `/dashboard` for app features.

## Rule: `/dashboard` and All Sub-routes Are Protected

Every route under `/dashboard` requires an authenticated user. Unauthenticated users must not be able to access any of these pages.

## Rule: Route Protection via Next.js Middleware

Route protection is handled in `src/proxy.ts` (Next.js 16 middleware file) using Clerk's `clerkMiddleware` and `createRouteMatcher`. Do not implement protection inside individual page components.

```ts
// src/proxy.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isProtectedRoute = createRouteMatcher(['/dashboard(.*)'])

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) await auth.protect()
})
```

- `'/dashboard(.*)'` matches `/dashboard` and every sub-route.
- `auth.protect()` redirects unauthenticated users to the Clerk sign-in page automatically — do not write manual redirect logic.

See `docs/auth.md` for the full Clerk middleware setup and auth conventions.
