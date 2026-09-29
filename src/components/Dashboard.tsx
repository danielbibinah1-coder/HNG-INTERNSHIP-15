import { useApp } from '../store'
import SimpleView from './SimpleView'
import GreetingCard from './dashboard/GreetingCard'
import ProfileCard from './dashboard/ProfileCard'
import TodayTasks from './dashboard/TodayTasks'

export default function Dashboard() {
  const { view } = useApp()

  if (view !== 'todo') {
    return (
      <main className="min-w-0 min-h-0">
        <SimpleView />
      </main>
    )
  }

  return (
    <main className="flex min-h-0 min-w-0 flex-col gap-4">
      <GreetingCard />
      <ProfileCard />
      <TodayTasks />
    </main>
  )
}
