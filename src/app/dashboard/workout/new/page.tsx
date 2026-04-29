import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import NewWorkoutForm from "./NewWorkoutForm"

export default async function NewWorkoutPage() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  return (
    <main className="container py-8">
      <NewWorkoutForm />
    </main>
  )
}
