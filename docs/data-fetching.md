# Data Fetching

## Rule: Server Components Only

**All data fetching must happen exclusively in Server Components.**

Do not fetch data in:
- Route handlers (`app/api/`)
- Client components (`"use client"`)
- Any other mechanism

Server Components are the only approved data fetching layer. If you need data in a Client Component, fetch it in a parent Server Component and pass it down as props.

## Rule: Drizzle ORM via `/data` Helpers Only

**All database queries must go through helper functions in the `/data` directory.**

- Never write raw SQL
- Never query the database directly from a component
- Always use Drizzle ORM inside the `/data` helper functions

Example structure:

```
/data
  workouts.ts    ← query helpers for workouts
  exercises.ts   ← query helpers for exercises
```

Example helper:

```ts
// data/workouts.ts
import { db } from "@/db"
import { workouts } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function getWorkoutsForUser(userId: string) {
  return db.select().from(workouts).where(eq(workouts.userId, userId))
}
```

Example usage in a Server Component:

```tsx
// app/dashboard/page.tsx
import { getWorkoutsForUser } from "@/data/workouts"
import { auth } from "@/auth"

export default async function DashboardPage() {
  const session = await auth()
  const workouts = await getWorkoutsForUser(session.user.id)

  return <WorkoutList workouts={workouts} />
}
```

## Rule: Users Can Only Access Their Own Data

**Every query helper must scope results to the authenticated user's ID.**

This is a hard security requirement. A logged-in user must never be able to read, modify, or delete another user's data.

- Every helper that returns user-owned data **must** accept a `userId` parameter
- Every query **must** include a `where` clause filtering by `userId`
- The `userId` must always come from the **server-side session** (e.g. `auth()`), never from user input, URL params, or the request body

Never do this:

```ts
// WRONG — no user scoping
export async function getWorkout(workoutId: string) {
  return db.select().from(workouts).where(eq(workouts.id, workoutId))
}
```

Always do this:

```ts
// CORRECT — scoped to the authenticated user
export async function getWorkout(workoutId: string, userId: string) {
  return db
    .select()
    .from(workouts)
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)))
}
```

The Server Component is responsible for reading the session and passing the verified `userId` into every data helper call.
