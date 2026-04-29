"use server"

import { z } from "zod"
import { auth } from "@clerk/nextjs/server"
import { createWorkout } from "@/data/workouts"
import { redirect } from "next/navigation"

const createWorkoutSchema = z.object({
  name: z.string().min(1).max(100),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
})

export async function createWorkoutAction(name: string, date: string) {
  const { name: validName, date: validDate } = createWorkoutSchema.parse({ name, date })

  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  const workout = await createWorkout(userId, validName, validDate)
  redirect(`/dashboard?date=${validDate}`)
}
