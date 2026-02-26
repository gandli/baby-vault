import { Outlet, NavLink } from 'react-router-dom'
import { t } from '../lib/i18n'

const navItems = [
  { to: '/', icon: '📸', key: 'navTimeline' as const },
  { to: '/milestones', icon: '🏆', key: 'navMilestones' as const },
  { to: '/settings', icon: '⚙️', key: 'navSettings' as const },
]

export default function Layout() {
  return (
    <div className="flex flex-col min-h-dvh">
      <main className="flex-1 pb-20">
        <Outlet />
      </main>
      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-[#1A1B2E]/90 backdrop-blur border-t border-gray-200 dark:border-gray-700 flex justify-around py-2 px-4 safe-bottom">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 text-xs transition-colors ${
                isActive ? 'text-[#6CB4EE]' : 'text-gray-400'
              }`
            }
          >
            <span className="text-xl">{item.icon}</span>
            <span>{t(item.key)}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
