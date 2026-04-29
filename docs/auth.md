# Auth Coding Standards

## Auth Provider: Clerk

**This app uses Clerk for all authentication. Do not implement custom auth or use any other auth library.**

Clerk is installed via `@clerk/nextjs`. All auth primitives come from this package.

## Rule: ClerkProvider Wraps the App

`ClerkProvider` must wrap the entire app in `src/app/layout.tsx`. It is already in place — do not remove or duplicate it.

## Rule: Route Protection via `clerkMiddleware`

All route protection is handled in `src/proxy.ts` using `clerkMiddleware` from `@clerk/nextjs/server`:

```ts
// src/proxy.ts
import { clerkMiddleware } from '@clerk/nextjs/server'

export default clerkMiddleware()
```

To protect specific routes, use `createRouteMatcher` inside `clerkMiddleware`:

```ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isProtectedRoute = createRouteMatcher(['/dashboard(.*)'])

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) await auth.protect()
})
```

Do not implement manual redirect logic for auth — use `auth.protect()`.

## Rule: Get the User ID Server-Side with `auth()`

**Always read the authenticated user's ID from the server using `auth()` from `@clerk/nextjs/server`.**

Never read user identity from URL params, request bodies, cookies you manage yourself, or client-side state.

```ts
// Server Component or data helper
import { auth } from '@clerk/nextjs/server'

export default async function DashboardPage() {
  const { userId } = await auth()

  if (!userId) {
    // should not happen on a protected route, but guard anyway
    redirect('/sign-in')
  }

  const workouts = await getWorkoutsForUser(userId)
  return <WorkoutList workouts={workouts} />
}
```

## Rule: UI Auth Components

Use Clerk's pre-built components for all auth UI. Do not build custom sign-in/sign-up forms.

| Need | Component |
|---|---|
| Sign-in trigger | `<SignInButton mode="modal">` |
| Sign-up trigger | `<SignUpButton mode="modal">` |
| Signed-in user menu | `<UserButton />` |
| Conditional render | `<SignedIn>` / `<SignedOut>` |

```tsx
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs'

<SignedOut>
  <SignInButton mode="modal">
    <button>Sign in</button>
  </SignInButton>
</SignedOut>
<SignedIn>
  <UserButton />
</SignedIn>
```

## Rule: Never Trust Client-Supplied Identity

The `userId` passed to any data helper must always originate from `auth()` on the server — never from the client. See `docs/data-fetching.md` for the full rule on user-scoped queries.
