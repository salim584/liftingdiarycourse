"use client";

import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

type WorkoutExercise = {
  name: string;
  sets: number;
};

type Workout = {
  id: string;
  name: string | null;
  startedAt: Date | null;
  completedAt: Date | null;
  durationMinutes: number;
  exercises: WorkoutExercise[];
};

const MOCK_WORKOUTS: Workout[] = [
  {
    id: "1",
    name: "Morning Push",
    startedAt: new Date(),
    completedAt: new Date(),
    durationMinutes: 45,
    exercises: [
      { name: "Bench Press", sets: 4 },
      { name: "Overhead Press", sets: 3 },
      { name: "Tricep Dips", sets: 3 },
    ],
  },
  {
    id: "2",
    name: null,
    startedAt: new Date(),
    completedAt: null,
    durationMinutes: 30,
    exercises: [
      { name: "Pull Ups", sets: 4 },
      { name: "Barbell Row", sets: 3 },
    ],
  },
];

export default function WorkoutDashboard() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const workouts = MOCK_WORKOUTS;

  return (
    <div className="flex flex-col gap-6 p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold tracking-tight">Workout Dashboard</h1>

      <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
        <Card className="shrink-0">
          <CardContent className="p-3">
            <p className="text-sm font-medium text-muted-foreground mb-2">Select Date</p>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
            />
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4 flex-1">
          <h2 className="text-lg font-medium">
            {format(selectedDate, "do MMM yyyy")}
          </h2>

          {workouts.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No workouts logged for this date.
            </p>
          ) : (
            workouts.map((workout) => (
              <Card key={workout.id}>
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
                        <p>{workout.durationMinutes} min</p>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="flex flex-col gap-1">
                    {workout.exercises.map((ex) => (
                      <li
                        key={ex.name}
                        className="flex justify-between text-sm"
                      >
                        <span>{ex.name}</span>
                        <span className="text-muted-foreground">
                          {ex.sets} sets
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
