"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import type { WorkoutWithExercises } from "@/data/workouts";

type Props = {
  workouts: WorkoutWithExercises[];
  selectedDate: Date;
};

export default function WorkoutDashboard({ workouts, selectedDate }: Props) {
  const router = useRouter();
  const [date, setDate] = useState<Date>(selectedDate);

  function handleDateSelect(d: Date | undefined) {
    if (!d) return;
    setDate(d);
    const iso = format(d, "yyyy-MM-dd");
    router.push(`/dashboard?date=${iso}`);
  }

  return (
    <div className="flex flex-col gap-6 p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-semibold tracking-tight">Workout Dashboard</h1>

      <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
        <Card className="shrink-0">
          <CardContent className="p-3">
            <p className="text-sm font-medium text-muted-foreground mb-2">Select Date</p>
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleDateSelect}
            />
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4 flex-1 min-w-0">
          <h2 className="text-lg font-medium">
            {format(date, "do MMM yyyy")}
          </h2>

          {workouts.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No workouts logged for this date.
            </p>
          ) : (
            workouts.map((workout) => (
              <Card key={workout.id} className="w-full">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col gap-1">
                      <CardTitle className="text-base">
                        {workout.name ?? "Untitled Workout"}
                      </CardTitle>
                      {workout.completedAt ? (
                        <p className="text-xs text-muted-foreground">Completed</p>
                      ) : (
                        <p className="text-xs text-amber-500">In progress</p>
                      )}
                    </div>
                    {workout.startedAt && (
                      <div className="text-right text-xs text-muted-foreground shrink-0 ml-4">
                        <p>{format(workout.startedAt, "h:mm a")}</p>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-3">
                    {workout.exercises.map((ex) => (
                      <div key={ex.id}>
                        <p className="text-sm font-medium mb-1">{ex.name}</p>
                        {ex.sets.length > 0 && (
                          <div className="flex flex-col gap-0.5">
                            {ex.sets.map((s) => (
                              <p key={s.id} className="text-xs text-muted-foreground">
                                Set {s.setNumber}
                                {s.reps != null && ` · ${s.reps} reps`}
                                {s.weight != null && ` · ${s.weight}${s.weightUnit ?? "kg"}`}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
