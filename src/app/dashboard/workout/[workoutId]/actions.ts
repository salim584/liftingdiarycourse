"use server"

import { z } from "zod"
import { auth } from "@clerk/nextjs/server"
import { updateWorkout } from "@/data/workouts"
import { addExerciseToWorkout, removeExerciseFromWorkout } from "@/data/exercises"

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

const addExerciseSchema = z.object({
  workoutId: z.string().uuid(),
  name: z.string().min(1).max(100),
})

export async function addExerciseAction(workoutId: string, name: string) {
  const { workoutId: validWorkoutId, name: validName } = addExerciseSchema.parse({ workoutId, name })

  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  return addExerciseToWorkout(validWorkoutId, validName)
}

const removeExerciseSchema = z.object({
  workoutExerciseId: z.string().uuid(),
  workoutId: z.string().uuid(),
})

export async function removeExerciseAction(workoutExerciseId: string, workoutId: string) {
  const { workoutExerciseId: validWeId, workoutId: validWorkoutId } = removeExerciseSchema.parse({ workoutExerciseId, workoutId })

  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  await removeExerciseFromWorkout(validWeId, validWorkoutId, userId)
}
