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
      <main className="flex-1 pb-28">
        <Outlet />
      </main>
      <nav className="fixed bottom-0 left-0 right-0 bg-[var(--color-bg-card)]/90 backdrop-blur-xl border-t border-[var(--color-border)] safe-bottom" style={{ zIndex: 30 }}>
        <div className="flex justify-around items-center py-2 px-6">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 py-2 px-5 rounded-2xl transition-all duration-300 ${
                  isActive 
                    ? 'bg-[var(--color-primary-wash)] text-[var(--color-primary)]' 
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-light)]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className={`text-xl transition-all duration-300 ${isActive ? 'scale-110 -translate-y-0.5' : ''}`}>
                    {item.icon}
                  </span>
                  <span className={`text-[10px] font-semibold tracking-wide uppercase transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-50'}`}>
                    {t(item.key)}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}