# Data Mutations

## Rule: Mutations via `/data` Helpers Only

**All database mutations must go through helper functions in the `src/data` directory.**

- Never write Drizzle ORM insert/update/delete calls directly in a component or action
- Never write raw SQL
- Always use Drizzle ORM inside the `/data` helper functions

Example structure:

```
src/data/
  workouts.ts    ← query and mutation helpers for workouts
  exercises.ts   ← query and mutation helpers for exercises
```

Example mutation helpers:

```ts
// src/data/workouts.ts
import { db } from '@/db';
import { workouts } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function createWorkout(userId: string, name: string, date: Date) {
  return db.insert(workouts).values({ userId, name, date }).returning();
}

export async function deleteWorkout(workoutId: string, userId: string) {
  return db
    .delete(workouts)
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)));
}
```

## Rule: Server Actions in Colocated `actions.ts` Files

**All data mutations must be triggered via Server Actions defined in colocated `actions.ts` files.**

Do not mutate data in:

- Route handlers (`app/api/`)
- Client components (`"use client"`)
- Server Components directly
- Any file not named `actions.ts`

Place `actions.ts` next to the page or feature it belongs to:

```
src/app/
  dashboard/
    page.tsx
    actions.ts   ← Server Actions for the dashboard feature
  workouts/
    [id]/
      page.tsx
      actions.ts ← Server Actions for a single workout
```

Every `actions.ts` file must start with the `"use server"` directive:

```ts
'use server';
```

## Rule: Typed Parameters — No `FormData`

**All Server Action parameters must be explicitly typed. `FormData` is not an acceptable parameter type.**

Do not do this:

```ts
// WRONG — FormData is not allowed
export async function createWorkout(formData: FormData) {
  const name = formData.get('name') as string;
}
```

Always do this:

```ts
// CORRECT — typed parameters
export async function createWorkout(name: string, date: Date) {
  ...
}
```

## Rule: Validate All Arguments with Zod

**Every Server Action must validate its arguments with Zod before doing anything else.**

Install and import from `zod`:

```ts
import { z } from 'zod';
```

Define a schema and parse at the top of every action. Throw or return early on validation failure.

Example:

```ts
'use server';

import { z } from 'zod';
import { auth } from '@/auth';
import { createWorkout } from '@/data/workouts';

const createWorkoutSchema = z.object({
  name: z.string().min(1).max(100),
  date: z.coerce.date(),
});

export async function createWorkoutAction(name: string, date: Date) {
  const { name: validName, date: validDate } = createWorkoutSchema.parse({
    name,
    date,
  });

  const session = await auth();
  await createWorkout(session.user.id, validName, validDate);
}
```

## Rule: Users Can Only Mutate Their Own Data

The same user-scoping requirement from data fetching applies to mutations. The `userId` must always come from the **server-side session** (`auth()`), never from action parameters, URL params, or any client-supplied value.

Never do this:

```ts
// WRONG — userId comes from the client
export async function deleteWorkoutAction(workoutId: string, userId: string) {
  await deleteWorkout(workoutId, userId);
}
```

Always do this:

```ts
// CORRECT — userId comes from the server session
export async function deleteWorkoutAction(workoutId: string) {
  const workoutIdSchema = z.string().uuid();
  const validWorkoutId = workoutIdSchema.parse(workoutId);

  const session = await auth();
  await deleteWorkout(validWorkoutId, session.user.id);
}
```

## Full Example

```ts
// src/app/workouts/actions.ts
'use server';

import { z } from 'zod';
import { auth } from '@/auth';
import { createWorkout, deleteWorkout, updateWorkout } from '@/data/workouts';

const createWorkoutSchema = z.object({
  name: z.string().min(1).max(100),
  date: z.coerce.date(),
});

export async function createWorkoutAction(name: string, date: Date) {
  const validated = createWorkoutSchema.parse({ name, date });
  const session = await auth();
  return createWorkout(session.user.id, validated.name, validated.date);
}

const updateWorkoutSchema = z.object({
  workoutId: z.string().uuid(),
  name: z.string().min(1).max(100),
});

export async function updateWorkoutAction(workoutId: string, name: string) {
  const { workoutId: validId, name: validName } = updateWorkoutSchema.parse({
    workoutId,
    name,
  });
  const session = await auth();
  return updateWorkout(validId, session.user.id, validName);
}

export async function deleteWorkoutAction(workoutId: string) {
  const validId = z.string().uuid().parse(workoutId);
  const session = await auth();
  return deleteWorkout(validId, session.user.id);
}
```

## Redirects After Mutations

Do not use `redirect()` from `next/navigation` inside server actions. Instead, handle redirects on the client side after the server action resolves.

**❌ Don't do this (in a server action):**

```ts
export async function createWorkoutAction(name: string, date: string) {
  await createWorkout(userId, name, date);
  redirect(`/dashboard?date=${date}`); // ❌ avoid this
}
```

**✅ Do this instead (in the client component):**

```ts
async function handleSubmit() {
  await createWorkoutAction(name, date);
  router.push(`/dashboard?date=${date}`); // ✅ redirect client-side
}
```

This avoids Next.js throwing a `NEXT_REDIRECT` error that needs to be caught and filtered out in client components.
