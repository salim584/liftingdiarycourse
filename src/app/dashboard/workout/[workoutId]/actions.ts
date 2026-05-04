"use server"

import { z } from "zod"
import { auth } from "@clerk/nextjs/server"
import { updateWorkout } from "@/data/workouts"

const updateWorkoutSchema = z.object({
  workoutId: z.string().uuid(),
  name: z.string().min(1).max(100),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
})

export async function updateWorkoutAction(workoutId: string, name: string, date: string) {
  const { workoutId: validId, name: validName, date: validDate } = updateWorkoutSchema.parse({ workoutId, name, date })

  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  await updateWorkout(validId, userId, validName, validDate)
}
