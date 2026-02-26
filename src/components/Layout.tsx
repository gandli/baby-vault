import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { t } from '../lib/i18n'
import { useRef } from 'react'

const navItems = [
  { to: '/', icon: '📸', key: 'navTimeline' as const },
  { to: '/milestones', icon: '🏆', key: 'navMilestones' as const },
]

export default function Layout() {
  const location = useLocation()
  const fileRef = useRef<HTMLInputElement>(null)

  return (
    <div className="flex flex-col min-h-dvh">
      <main className="flex-1 pb-28">
        <Outlet />
      </main>
      
      {/* Gradient mask — fades content behind the floating dock */}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 h-20 bg-gradient-to-t from-[var(--color-bg)] via-[var(--color-bg)]/80 to-transparent" />

      {/* Floating dock tab bar + action button */}
      <nav className="fixed inset-x-0 bottom-4 z-50 flex items-center justify-between gap-3 px-4 safe-bottom">
        {/* Main nav container */}
        <div className="flex flex-1 items-center gap-2 rounded-[28px] border border-white/50 dark:border-white/10 bg-white/75 dark:bg-black/40 backdrop-blur-2xl px-1.5 py-1.5 shadow-lg shadow-black/5"
          style={{
            boxShadow: '0 4px 24px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.6)'
          }}
        >
          {navItems.map(item => {
            const isActive = location.pathname === item.to
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`flex flex-1 flex-col items-center justify-center gap-1 rounded-full py-2.5 ${
                  isActive 
                    ? 'bg-[var(--color-primary)]/15 text-[var(--color-primary)]' 
                    : 'text-[var(--color-text-muted)]'
                }`}
                style={{ transition: 'background-color 150ms ease, color 150ms ease' }}
              >
                <span className="text-[22px]">
                  {item.icon}
                </span>
                <span className="text-[10px] font-bold leading-none">
                  {t(item.key)}
                </span>
              </NavLink>
            )
          })}
          
          {/* Settings */}
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center justify-center gap-1 rounded-full py-2.5 ${
                isActive 
                  ? 'bg-[var(--color-primary)]/15 text-[var(--color-primary)]' 
                  : 'text-[var(--color-text-muted)]'
              }`
            }
            style={{ transition: 'background-color 150ms ease, color 150ms ease' }}
          >
            <span className="text-[22px]">
              ⚙️
            </span>
            <span className="text-[10px] font-bold leading-none">
              {t('navSettings')}
            </span>
          </NavLink>
        </div>
        
        {/* Action button - floating on the right */}
        <button
          onClick={() => fileRef.current?.click()}
          className="flex size-16 items-center justify-center rounded-full border border-white/50 dark:border-white/10 bg-[var(--color-primary)] text-white backdrop-blur-2xl active:scale-95 shadow-lg"
          style={{
            boxShadow: '0 4px 24px rgba(196, 112, 75, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
            transition: 'transform 150ms ease'
          }}
        >
          <span className="text-2xl">➕</span>
        </button>
        
        {/* Hidden file input */}
        <input
          ref={fileRef}
          type="file"
          accept="image/*,video/*"
          capture="environment"
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.[0]) {
              window.dispatchEvent(new CustomEvent('addPhoto', { detail: e.target.files[0] }))
            }
            e.target.value = ''
          }}
        />
      </nav>
    </div>
  )
}