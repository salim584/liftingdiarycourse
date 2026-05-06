import { db } from "../db"
import { exercises, workoutExercises, workouts } from "../db/schema"
import { eq, and } from "drizzle-orm"

export async function addExerciseToWorkout(workoutId: string, exerciseName: string) {
  // find or create exercise by name (case-insensitive match not required — exact match)
  let [exercise] = await db
    .select()
    .from(exercises)
    .where(eq(exercises.name, exerciseName))
    .limit(1)

  if (!exercise) {
    ;[exercise] = await db.insert(exercises).values({ name: exerciseName }).returning()
  }

  const existingRows = await db
    .select({ order: workoutExercises.order })
    .from(workoutExercises)
    .where(eq(workoutExercises.workoutId, workoutId))
    .orderBy(workoutExercises.order)

  const nextOrder = existingRows.length > 0
    ? existingRows[existingRows.length - 1].order + 1
    : 0

  const [workoutExercise] = await db
    .insert(workoutExercises)
    .values({ workoutId, exerciseId: exercise.id, order: nextOrder })
    .returning()

  return workoutExercise
}

export async function removeExerciseFromWorkout(workoutExerciseId: string, workoutId: string, userId: string) {
  // verify ownership via workout
  const [workout] = await db
    .select()
    .from(workouts)
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)))

  if (!workout) throw new Error("Not found")

  await db
    .delete(workoutExercises)
    .where(and(eq(workoutExercises.id, workoutExerciseId), eq(workoutExercises.workoutId, workoutId)))
}
