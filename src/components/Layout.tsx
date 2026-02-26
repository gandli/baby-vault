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
      <main className="flex-1 pb-24">
        <Outlet />
      </main>
      <nav className="fixed bottom-0 left-0 right-0 bg-[var(--color-bg-card)]/95 backdrop-blur-lg border-t border-[var(--color-border)] flex justify-around py-3 px-4 safe-bottom shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 text-xs transition-all duration-200 ${
                isActive 
                  ? 'text-[var(--color-primary)]' 
                  : 'text-[var(--color-text-muted)]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span className={`text-xl transition-transform duration-200 ${isActive ? 'scale-110' : ''}`}>
                  {item.icon}
                </span>
                <span className={`font-medium ${isActive ? 'opacity-100' : 'opacity-70'}`}>
                  {t(item.key)}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}