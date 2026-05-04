import { notFound } from "next/navigation"
import { auth } from "@clerk/nextjs/server"
import { getWorkoutById } from "@/data/workouts"
import EditWorkoutForm from "./EditWorkoutForm"

type PageProps = {
  params: Promise<{ workoutId: string }>
}

export default async function EditWorkoutPage(props: PageProps) {
  const { workoutId } = await props.params

  const { userId } = await auth()
  if (!userId) return notFound()

  const workout = await getWorkoutById(workoutId, userId)
  if (!workout) return notFound()

  return (
    <EditWorkoutForm
      workoutId={workout.id}
      initialName={workout.name ?? ""}
      initialDate={workout.date ?? ""}
    />
  )
}
