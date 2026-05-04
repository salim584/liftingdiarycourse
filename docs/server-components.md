# Server Components

## Rule: `params` and `searchParams` Must Be Awaited

**`params` and `searchParams` are Promises in Next.js 15. Always `await` them before accessing any property.**

Do not destructure or access them synchronously:

```tsx
// WRONG — params is a Promise, this will not work
export default async function Page({ params }: PageProps) {
  const { id } = params
}
```

Always await first:

```tsx
// CORRECT
export default async function Page({ params }: PageProps) {
  const { id } = await params
}
```

The same applies to `searchParams`:

```tsx
// CORRECT
export default async function Page({ searchParams }: PageProps) {
  const { date } = await searchParams
}
```

## Rule: Define `PageProps` as a Local Type

Do not import `PageProps` from generated Next.js types — define it inline in each page file:

```tsx
type PageProps = {
  params: Promise<{ workoutId: string }>
}

export default async function EditWorkoutPage({ params }: PageProps) {
  const { workoutId } = await params
  // ...
}
```

For pages with both `params` and `searchParams`:

```tsx
type PageProps = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ date?: string }>
}
```

## Rule: Server Components Are Async Functions

All Server Components that fetch data or read request APIs must be declared `async`:

```tsx
// CORRECT
export default async function WorkoutPage(props: PageProps) {
  const { workoutId } = await props.params
  const { userId } = await auth()
  const workout = await getWorkoutById(workoutId, userId)
  // ...
}
```

## Rule: All Data Fetching Happens in Server Components

Fetch data at the Server Component level and pass it down as props to Client Components. Never fetch data inside Client Components.

```tsx
// Server Component — fetches data
export default async function WorkoutPage(props: PageProps) {
  const { workoutId } = await props.params
  const { userId } = await auth()
  const workout = await getWorkoutById(workoutId, userId)

  return <WorkoutForm workout={workout} />
}

// Client Component — receives data as props, never fetches
"use client"
export default function WorkoutForm({ workout }: { workout: Workout }) {
  // ...
}
```

## Rule: Use `notFound()` for Missing or Unauthorized Resources

If a resource does not exist or does not belong to the authenticated user, call `notFound()` to render the 404 page. Never expose whether a resource exists to an unauthorized user.

```tsx
import { notFound } from "next/navigation"

export default async function WorkoutPage(props: PageProps) {
  const { workoutId } = await props.params
  const { userId } = await auth()
  if (!userId) return notFound()

  const workout = await getWorkoutById(workoutId, userId)
  if (!workout) return notFound()

  return <WorkoutForm workout={workout} />
}
```
