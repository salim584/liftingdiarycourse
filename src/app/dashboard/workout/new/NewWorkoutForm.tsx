"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { createWorkoutAction } from "./actions"

export default function NewWorkoutForm() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [date, setDate] = useState<Date>(new Date())
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setPending(true)
    try {
      await createWorkoutAction(name, format(date, "yyyy-MM-dd"))
      router.push(`/dashboard?date=${format(date, "yyyy-MM-dd")}`)
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      }
    } finally {
      setPending(false)
    }
  }

  return (
    <Card className="max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle>New Workout</CardTitle>
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

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-2">
            <Button type="submit" className="flex-1" disabled={pending}>
              {pending ? "Creating…" : "Create Workout"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => router.push("/dashboard")}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}