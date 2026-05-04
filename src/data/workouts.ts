import { db } from "../db"
import { workouts, workoutExercises, exercises, sets } from "../db/schema"
import { eq, and } from "drizzle-orm"

export async function createWorkout(userId: string, name: string, date: string) {
  const [workout] = await db.insert(workouts).values({ userId, name, date }).returning()
  return workout
}

type Set = {
  id: string
  setNumber: number
  reps: number | null
  weight: number | null
  weightUnit: string | null
}

type Exercise = {
  id: string
  name: string
  sets: Set[]
}

export type WorkoutWithExercises = {
  id: string
  name: string | null
  startedAt: Date | null
  completedAt: Date | null
  exercises: Exercise[]
}

export async function getWorkoutById(workoutId: string, userId: string) {
  const [workout] = await db
    .select()
    .from(workouts)
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)))
  return workout ?? null
}

export async function updateWorkout(workoutId: string, userId: string, name: string, date: string) {
  const [workout] = await db
    .update(workouts)
    .set({ name, date })
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)))
    .returning()
  return workout
}

export async function getWorkoutsForUserByDate(userId: string, date: string): Promise<WorkoutWithExercises[]> {
  const rows = await db
    .select({
      id: workouts.id,
      name: workouts.name,
      startedAt: workouts.startedAt,
      completedAt: workouts.completedAt,
      workoutExerciseId: workoutExercises.id,
      workoutExerciseOrder: workoutExercises.order,
      exerciseName: exercises.name,
      setId: sets.id,
      setNumber: sets.setNumber,
      reps: sets.reps,
      weight: sets.weight,
      weightUnit: sets.weightUnit,
    })
    .from(workouts)
    .leftJoin(workoutExercises, eq(workoutExercises.workoutId, workouts.id))
    .leftJoin(exercises, eq(exercises.id, workoutExercises.exerciseId))
    .leftJoin(sets, eq(sets.workoutExerciseId, workoutExercises.id))
    .where(and(eq(workouts.userId, userId), eq(workouts.date, date)))
    .orderBy(workouts.startedAt, workoutExercises.order, sets.setNumber)

  const workoutMap = new Map<string, WorkoutWithExercises>()
  const exerciseMap = new Map<string, Exercise>()

  for (const row of rows) {
    if (!workoutMap.has(row.id)) {
      workoutMap.set(row.id, {
        id: row.id,
        name: row.name,
        startedAt: row.startedAt,
        completedAt: row.completedAt,
        exercises: [],
      })
    }

    if (!row.workoutExerciseId || !row.exerciseName) continue

    if (!exerciseMap.has(row.workoutExerciseId)) {
      const exercise: Exercise = { id: row.workoutExerciseId, name: row.exerciseName, sets: [] }
      exerciseMap.set(row.workoutExerciseId, exercise)
      workoutMap.get(row.id)!.exercises.push(exercise)
    }

    if (row.setId) {
      exerciseMap.get(row.workoutExerciseId)!.sets.push({
        id: row.setId,
        setNumber: row.setNumber!,
        reps: row.reps,
        weight: row.weight,
        weightUnit: row.weightUnit,
      })
    }
  }

  return Array.from(workoutMap.values())
}
