import { NavLink, useLocation } from 'react-router-dom'
import { t } from '../lib/i18n'
import { useRef } from 'react'

const navItems = [
  { to: '/', icon: '📸' },
  { to: '/milestones', icon: '🏆' },
]

export default function BottomNav() {
  const location = useLocation()
  const fileRef = useRef<HTMLInputElement>(null)

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 pb-safe">
      {/* Gradient mask */}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 h-20 bg-gradient-to-t from-[var(--color-bg)] via-[var(--color-bg)]/80 to-transparent" />
      
      {/* Navigation bar */}
      <nav className="flex items-center justify-between px-4 pt-3 pb-safe safe-bottom">
        {/* Nav container */}
        <div className="flex-1 flex items-center gap-2 rounded-[28px] border border-white/50 dark:border-white/10 bg-white/75 dark:bg-black/40 backdrop-blur-2xl px-1.5 py-1.5 shadow-lg shadow-black/5"
          style={{
            boxShadow: '0 4px 24px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
            minHeight: '56px'
          }}
        >
          {navItems.map(item => {
            const isActive = location.pathname === item.to
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`flex flex-1 flex-col items-center justify-center gap-1 rounded-full py-2.5 transition-colors duration-150 ${
                  isActive 
                    ? 'bg-[var(--color-primary)]/15 text-[var(--color-primary)]' 
                    : 'text-[var(--color-text-muted)]'
                }`}
              >
                <span className="text-[22px]">{item.icon}</span>
                <span className="text-[10px] font-bold leading-none">
                  {item.to === '/' ? t('navTimeline') : t('navMilestones')}
                </span>
              </NavLink>
            )
          })}
          
          {/* Settings */}
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center justify-center gap-1 rounded-full py-2.5 transition-colors duration-150 ${
                isActive 
                  ? 'bg-[var(--color-primary)]/15 text-[var(--color-primary)]' 
                  : 'text-[var(--color-text-muted)]'
              }`
            }
          >
            <span className="text-[22px]">⚙️</span>
            <span className="text-[10px] font-bold leading-none">{t('navSettings')}</span>
          </NavLink>
        </div>
        
        {/* Action button */}
        <button
          onClick={() => fileRef.current?.click()}
          className="ml-3 flex size-16 items-center justify-center rounded-full border border-white/50 dark:border-white/10 bg-[var(--color-primary)] text-white backdrop-blur-2xl shadow-lg transition-transform duration-150 hover:scale-105 active:scale-95"
          style={{
            boxShadow: '0 4px 24px rgba(196, 112, 75, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
          }}
        >
          <span className="text-2xl">➕</span>
        </button>
        
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