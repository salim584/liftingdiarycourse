import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { getWorkoutsForUserByDate } from "@/data/workouts";
import WorkoutDashboard from "./WorkoutDashboard";
type Props = {
  searchParams: Promise<{ date?: string }>
}

export default async function DashboardPage(props: Props) {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const searchParams = await props.searchParams;
  const dateString = searchParams?.date ?? format(new Date(), "yyyy-MM-dd");
  // Parse with a midday time so the Date object stays on the correct local date
  // regardless of timezone offset (avoids UTC-midnight rolling back a day)
  const selectedDate = new Date(`${dateString}T12:00:00`);

  const workouts = await getWorkoutsForUserByDate(user.id, dateString);

  return <WorkoutDashboard workouts={workouts} selectedDate={selectedDate} />;
}
