import { NavLink, useLocation } from 'react-router-dom'
import { t } from '../lib/i18n'
import { useRef, useState } from 'react'

const navItems = [
  { to: '/', icon: '📸' },
  { to: '/milestones', icon: '🏆' },
]

export default function BottomNav() {
  const location = useLocation()
  const [showMilestoneModal, setShowMilestoneModal] = useState(false)
  const [showBabyModal, setShowBabyModal] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const nameRef = useRef<HTMLInputElement>(null)

  const isTimeline = location.pathname === '/'
  const isMilestones = location.pathname === '/milestones'
  const isSettings = location.pathname === '/settings'

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      window.dispatchEvent(new CustomEvent('addPhoto', { detail: e.target.files[0] }))
    }
    e.target.value = ''
  }

  const handleAddBaby = () => {
    const name = nameRef.current?.value?.trim()
    if (name) {
      // TODO: Add baby functionality
      console.log('Add baby:', name)
      setShowBabyModal(false)
      if (nameRef.current) nameRef.current.value = ''
    }
  }

  const handleAddMilestone = () => {
    // TODO: Add milestone functionality
    console.log('Add milestone')
    setShowMilestoneModal(false)
  }

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
        
        {/* Dynamic action button */}
        {isTimeline && (
          <>
            <button
              onClick={() => fileRef.current?.click()}
              className="ml-3 flex size-16 items-center justify-center rounded-full border border-white/50 dark:border-white/10 bg-[var(--color-primary)] text-white backdrop-blur-2xl shadow-lg transition-transform duration-150 hover:scale-105 active:scale-95"
              style={{
                boxShadow: '0 4px 24px rgba(196, 112, 75, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
              }}
            >
              <span className="text-2xl">📸</span>
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*,video/*"
              capture="environment"
              className="hidden"
              onChange={handleFileChange}
            />
          </>
        )}
        
        {isMilestones && (
          <button
            onClick={() => setShowMilestoneModal(true)}
            className="ml-3 flex size-16 items-center justify-center rounded-full border border-white/50 dark:border-white/10 bg-[var(--color-accent)] text-white backdrop-blur-2xl shadow-lg transition-transform duration-150 hover:scale-105 active:scale-95"
            style={{
              boxShadow: '0 4px 24px rgba(212, 131, 143, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
            }}
          >
            <span className="text-2xl">🏆</span>
          </button>
        )}
        
        {isSettings && (
          <button
            onClick={() => setShowBabyModal(true)}
            className="ml-3 flex size-16 items-center justify-center rounded-full border border-white/50 dark:border-white/10 bg-[var(--color-success)] text-white backdrop-blur-2xl shadow-lg transition-transform duration-150 hover:scale-105 active:scale-95"
            style={{
              boxShadow: '0 4px 24px rgba(122, 158, 126, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
            }}
          >
            <span className="text-2xl">👶</span>
          </button>
        )}
      </nav>
      
      {/* Milestone modal */}
      {showMilestoneModal && (
        <div className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4" onClick={() => setShowMilestoneModal(false)}>
          <div className="bg-[var(--color-bg-card)] rounded-3xl p-6 mx-4 space-y-6 max-w-md w-full animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="text-center">
              <span className="text-5xl mb-4">🎉</span>
              <h2 className="text-[var(--color-text)] font-display text-2xl">{t('addCustom')}</h2>
            </div>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="里程碑名称"
                className="w-full px-5 py-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] text-lg"
              />
              <div className="flex gap-3">
                <button onClick={() => setShowMilestoneModal(false)} className="flex-1 py-4 rounded-xl border border-[var(--color-border)] text-[var(--color-text-light)] font-semibold">
                  {t('cancel')}
                </button>
                <button onClick={handleAddMilestone} className="flex-1 py-4 rounded-xl bg-[var(--color-accent)] text-white font-semibold">
                  {t('add')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Baby modal */}
      {showBabyModal && (
        <div className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4" onClick={() => setShowBabyModal(false)}>
          <div className="bg-[var(--color-bg-card)] rounded-3xl p-6 mx-4 space-y-6 max-w-md w-full animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="text-center">
              <span className="text-5xl mb-4">👶</span>
              <h2 className="text-[var(--color-text)] font-display text-2xl">添加宝宝</h2>
            </div>
            <div className="space-y-4">
              <input
                ref={nameRef}
                type="text"
                placeholder="宝宝姓名"
                className="w-full px-5 py-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] text-lg"
              />
              <div className="flex gap-3">
                <button onClick={() => setShowBabyModal(false)} className="flex-1 py-4 rounded-xl border border-[var(--color-border)] text-[var(--color-text-light)] font-semibold">
                  {t('cancel')}
                </button>
                <button onClick={handleAddBaby} className="flex-1 py-4 rounded-xl bg-[var(--color-success)] text-white font-semibold">
                  {t('add')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}