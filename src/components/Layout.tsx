import { Outlet } from 'react-router-dom'
import BottomNav from './BottomNav'

export default function Layout() {
  return (
    <>
      <main className="flex flex-col min-h-dvh">
        <div className="flex-1 pb-[9rem]">
          <Outlet />
        </div>
      </main>
      <BottomNav />
    </>
  )
}