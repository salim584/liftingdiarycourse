"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { format, parseISO } from "date-fns"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { updateWorkoutAction, addExerciseAction, removeExerciseAction } from "./actions"
import type { WorkoutExerciseItem } from "@/data/workouts"

type Props = {
  workoutId: string
  initialName: string
  initialDate: string
  initialExercises: WorkoutExerciseItem[]
}

export default function EditWorkoutForm({ workoutId, initialName, initialDate, initialExercises }: Props) {
  const router = useRouter()
  const [name, setName] = useState(initialName)
  const [date, setDate] = useState<Date>(parseISO(initialDate))
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  const [exercises, setExercises] = useState<WorkoutExerciseItem[]>(initialExercises)
  const [exerciseName, setExerciseName] = useState("")
  const [addingExercise, setAddingExercise] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setPending(true)
    try {
      await updateWorkoutAction(workoutId, name, format(date, "yyyy-MM-dd"))
      router.push(`/dashboard?date=${format(date, "yyyy-MM-dd")}`)
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      }
    } finally {
      setPending(false)
    }
  }

  async function handleAddExercise() {
    const trimmed = exerciseName.trim()
    if (!trimmed) return
    setAddingExercise(true)
    try {
      const workoutExercise = await addExerciseAction(workoutId, trimmed)
      setExercises((prev) => [
        ...prev,
        { workoutExerciseId: workoutExercise.id, name: trimmed, order: workoutExercise.order },
      ])
      setExerciseName("")
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message)
    } finally {
      setAddingExercise(false)
    }
  }

  async function handleRemoveExercise(workoutExerciseId: string) {
    try {
      await removeExerciseAction(workoutExerciseId, workoutId)
      setExercises((prev) => prev.filter((e) => e.workoutExerciseId !== workoutExerciseId))
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message)
    }
  }

  return (
    <Card className="max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle>Edit Workout</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Workout Name</Label>
            <Input
              id="name"
              placeholder="e.g. Push Day"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Date</Label>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  {format(date, "do MMM yyyy")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(d) => {
                    if (d) {
                      setDate(d)
                      setOpen(false)
                    }
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>Exercises</Label>
            {exercises.length > 0 && (
              <ul className="space-y-1 mb-2">
                {exercises.map((ex) => (
                  <li key={ex.workoutExerciseId} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                    <span>{ex.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveExercise(ex.workoutExerciseId)}
                    >
                      Remove
                    </Button>
                  </li>
                ))}
              </ul>
            )}
            <div className="flex gap-2">
              <Input
                placeholder="Exercise name"
                value={exerciseName}
                onChange={(e) => setExerciseName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleAddExercise()
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAddExercise}
                disabled={addingExercise || !exerciseName.trim()}
              >
                {addingExercise ? "Adding…" : "Add"}
              </Button>
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-2">
            <Button type="submit" className="flex-1" disabled={pending}>
              {pending ? "Saving…" : "Save Changes"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
