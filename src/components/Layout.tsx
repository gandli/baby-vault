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
      <main className="flex-1 pb-32">
        <Outlet />
      </main>
      
      {/* Liquid Glass Dock Bar */}
      <nav className="fixed bottom-0 left-0 right-0 px-4 pb-6 pt-2 safe-bottom" style={{ zIndex: 30 }}>
        {/* Glass background layer */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent pointer-events-none" />
        
        {/* Dock container */}
        <div className="relative flex items-center justify-center gap-2 p-2 rounded-3xl bg-white/70 dark:bg-black/40 backdrop-blur-2xl border border-white/50 dark:border-white/10 shadow-2xl shadow-black/10"
          style={{
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.5), inset 0 -1px 0 rgba(0, 0, 0, 0.05)'
          }}
        >
          {/* Navigation items */}
          {navItems.map(item => {
            const isActive = location.pathname === item.to
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`flex flex-col items-center justify-center py-3 px-5 rounded-2xl transition-all duration-300 ${
                  isActive 
                    ? 'bg-[var(--color-primary)]/15 scale-[0.95]' 
                    : 'hover:bg-black/5 active:scale-95'
                }`}
              >
                <span className={`text-2xl transition-transform duration-300 ${isActive ? 'scale-110' : ''}`}>
                  {item.icon}
                </span>
                <span className={`text-[10px] font-semibold tracking-wide mt-0.5 transition-colors duration-300 ${
                  isActive ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'
                }`}>
                  {t(item.key)}
                </span>
              </NavLink>
            )
          })}
          
          {/* Divider */}
          <div className="w-px h-10 bg-black/10 dark:bg-white/10 mx-1" />
          
          {/* Add photo button - prominent */}
          <button
            onClick={() => fileRef.current?.click()}
            className="flex flex-col items-center justify-center py-3 px-5 rounded-2xl transition-all duration-300 hover:bg-[var(--color-primary)]/10 active:scale-95 group"
          >
            <span className="text-2xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-90">
              ➕
            </span>
            <span className="text-[10px] font-semibold tracking-wide mt-0.5 text-[var(--color-primary)]">
              {t('navTimeline').split('')[0] || '添加'}
            </span>
          </button>
          
          {/* Settings */}
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-3 px-5 rounded-2xl transition-all duration-300 ${
                isActive 
                  ? 'bg-[var(--color-primary)]/15 scale-[0.95]' 
                  : 'hover:bg-black/5 active:scale-95'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span className={`text-2xl transition-transform duration-300 ${isActive ? 'scale-110' : ''}`}>
                  ⚙️
                </span>
                <span className={`text-[10px] font-semibold tracking-wide mt-0.5 transition-colors duration-300 ${
                  isActive ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'
                }`}>
                  {t('navSettings')}
                </span>
              </>
            )}
          </NavLink>
          
          {/* Hidden file input */}
          <input
            ref={fileRef}
            type="file"
            accept="image/*,video/*"
            capture="environment"
            className="hidden"
            onChange={(e) => {
              // Dispatch custom event that Timeline can listen to
              if (e.target.files?.[0]) {
                window.dispatchEvent(new CustomEvent('addPhoto', { detail: e.target.files[0] }))
              }
              e.target.value = ''
            }}
          />
        </div>
      </nav>
    </div>
  )
}