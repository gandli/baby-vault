import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '../../lib/auth-context'
import { t } from '../../lib/i18n'

interface Milestone {
  id: string
  emoji: string
  name: string
  nameKey?: string
  doneAt?: string
}

const PRESETS: { emoji: string; nameKey: string }[] = [
  { emoji: '😊', nameKey: 'ms.smile' },
  { emoji: '🔄', nameKey: 'ms.rollover' },
  { emoji: '🪑', nameKey: 'ms.sit' },
  { emoji: '🐛', nameKey: 'ms.crawl' },
  { emoji: '🧍', nameKey: 'ms.stand' },
  { emoji: '🚶', nameKey: 'ms.walk' },
  { emoji: '🗣️', nameKey: 'ms.talk' },
  { emoji: '🦷', nameKey: 'ms.tooth' },
  { emoji: '🍚', nameKey: 'ms.food' },
  { emoji: '😴', nameKey: 'ms.sleep' },
]

const STORAGE_KEY = 'babyvault_milestones'

function loadMilestones(): Milestone[] {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved) return JSON.parse(saved)
  return PRESETS.map((p, i) => ({ id: `preset-${i}`, emoji: p.emoji, name: t(p.nameKey as any), nameKey: p.nameKey }))
}

function saveMilestones(ms: Milestone[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ms))
}

function getMilestoneName(m: Milestone): string {
  if (m.nameKey) return t(m.nameKey as any)
  return m.name
}

export default function Milestones() {
  const { user } = useAuth()
  const [milestones, setMilestones] = useState<Milestone[]>(loadMilestones)
  const [adding, setAdding] = useState(false)
  const [newName, setNewName] = useState('')
  const [newEmoji, setNewEmoji] = useState('⭐')
  const [datePickId, setDatePickId] = useState<string | null>(null)
  const [pickDate, setPickDate] = useState('')

  useEffect(() => { saveMilestones(milestones) }, [milestones])

  const toggle = (id: string) => {
    const m = milestones.find(m => m.id === id)
    if (m?.doneAt) {
      setMilestones(prev => prev.map(m => m.id === id ? { ...m, doneAt: undefined } : m))
    } else {
      setDatePickId(id)
      setPickDate(new Date().toISOString().slice(0, 10))
    }
  }

  const confirmDate = () => {
    if (!datePickId || !pickDate) return
    setMilestones(prev => prev.map(m =>
      m.id === datePickId ? { ...m, doneAt: new Date(pickDate).toISOString() } : m
    ))
    setDatePickId(null)
  }

  const addCustom = () => {
    if (!newName.trim()) return
    setMilestones(prev => [...prev, { id: crypto.randomUUID(), emoji: newEmoji || '⭐', name: newName.trim() }])
    setNewName('')
    setNewEmoji('⭐')
    setAdding(false)
  }

  const remove = (id: string) => {
    setMilestones(prev => prev.filter(m => m.id !== id))
  }

  // Memoize to prevent unnecessary re-renders
  const done = useMemo(() => milestones.filter(m => m.doneAt), [milestones])
  const todo = useMemo(() => milestones.filter(m => !m.doneAt), [milestones])
  const progress = useMemo(() => milestones.length ? (done.length / milestones.length) * 100 : 0, [milestones.length, done.length])

  return (
    <div className="px-4 pt-8 pb-28 paper-texture">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 relative">
        <h1 className="text-2xl font-display text-[var(--color-text)]">{t('milestones')}</h1>
        <div className="sticker animate-stamp">
          {done.length}/{milestones.length}
        </div>
      </div>

      {/* Decorative divider */}
      <div className="divider-dots mb-6" />

      {/* Progress bar - wavy style */}
      <div className="relative h-4 bg-[var(--color-linen)] rounded-full mb-8 overflow-hidden shadow-inner">
        <div 
          className="absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out shadow-sm"
          style={{ 
            width: `${progress}%`,
            background: 'linear-gradient(90deg, var(--color-success), var(--color-accent))'
          }}
        />
        {progress > 0 && (
          <div 
            className="absolute inset-y-0 left-0 rounded-full opacity-40"
            style={{ 
              width: `${progress}%`,
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)',
              animation: 'shimmer 2.5s infinite',
              backgroundSize: '200% 100%'
            }}
          />
        )}
      </div>

      {/* Todo milestones */}
      <div className="space-y-3 stagger-children">
        {todo.map((m) => (
          <button
            key={m.id}
            onClick={() => toggle(m.id)}
            className="w-full flex items-center gap-4 p-5 rounded-2xl bg-[var(--color-bg-card)] border border-[var(--color-border)] hover:border-[var(--color-primary)] active:scale-[0.98] transition-all duration-300 text-left shadow-sm hover:shadow-md group"
          >
            <span className="text-3xl transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-1">{m.emoji}</span>
            <span className="flex-1 text-[var(--color-text)] font-medium transition-colors group-hover:text-[var(--color-primary)]">{getMilestoneName(m)}</span>
            <span className="w-8 h-8 rounded-xl border-2 border-[var(--color-border)] flex items-center justify-center text-transparent group-hover:border-[var(--color-primary)] group-hover:bg-[var(--color-primary-wash)] transition-all duration-300">
              ✓
            </span>
          </button>
        ))}
      </div>

      {/* Add custom */}
      {adding ? (
        <div className="p-6 rounded-2xl bg-[var(--color-bg-card)] border border-[var(--color-border)] space-y-4 mb-8 animate-scale-in shadow-sm">
          <div className="flex gap-3">
            <input
              type="text"
              value={newEmoji}
              onChange={e => setNewEmoji(e.target.value)}
              className="w-16 px-3 py-3.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-center text-3xl transition-colors focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
              maxLength={2}
              autoFocus
            />
            <input
              type="text"
              placeholder={t('milestoneName')}
              value={newName}
              onChange={e => setNewName(e.target.value)}
              className="flex-1 px-5 py-3.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] transition-colors focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent font-medium"
              onKeyDown={e => e.key === 'Enter' && addCustom()}
            />
          </div>
          <div className="flex gap-3">
            <button onClick={() => setAdding(false)} className="flex-1 py-3.5 rounded-xl border border-[var(--color-border)] text-[var(--color-text-light)] font-semibold transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]">
              {t('cancel')}
            </button>
            <button onClick={addCustom} className="flex-1 py-3.5 rounded-xl bg-[var(--color-primary)] text-white font-semibold hover:bg-[var(--color-primary-dark)] transition-colors">
              {t('add')}
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="w-full p-5 rounded-2xl border-2 border-dashed border-[var(--color-border)] text-[var(--color-text-muted)] font-semibold transition-all duration-300 mb-8 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-wash)]/50"
        >
          {t('addCustom')}
        </button>
      )}

      {/* Completed milestones */}
      {done.length > 0 && (
        <>
          <h2 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-widest mt-8 mb-4 pl-1">{t('completed')}</h2>
          <div className="space-y-3">
            {done.map(m => (
              <div
                key={m.id}
                className="flex items-center gap-4 p-5 rounded-2xl bg-[var(--color-success-wash)]/50 border border-[var(--color-success)]/30 hover:border-[var(--color-success)] transition-all duration-300"
              >
                <span className="text-3xl animate-float">{m.emoji}</span>
                <div className="flex-1">
                  <span className="text-[var(--color-text)] font-medium text-lg">{getMilestoneName(m)}</span>
                  <p className="text-xs text-[var(--color-text-light)] mt-1">
                    📅 {new Date(m.doneAt!).toLocaleDateString()}
                  </p>
                </div>
                <button onClick={() => toggle(m.id)} className="w-9 h-9 rounded-xl bg-[var(--color-success)] text-white flex items-center justify-center text-lg shadow-sm hover:bg-[var(--color-success-light)] transition-colors">
                  ✓
                </button>
                {!m.id.startsWith('preset-') && (
                  <button onClick={() => remove(m.id)} className="text-red-500/60 hover:text-red-600 text-xs font-semibold px-3 py-1.5 transition-colors">
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Date picker modal */}
      {datePickId && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center animate-fade-in p-4" onClick={() => setDatePickId(null)}>
          <div className="bg-[var(--color-bg-card)] rounded-3xl p-6 mx-4 space-y-6 animate-scale-in max-w-md w-full" onClick={e => e.stopPropagation()}>
            <div className="text-center">
              <span className="text-5xl animate-float">{milestones.find(m => m.id === datePickId)?.emoji}</span>
              <h2 className="text-[var(--color-text)] font-display text-2xl mt-4 mb-1">
                🎉 {getMilestoneName(milestones.find(m => m.id === datePickId)!)}
              </h2>
              <p className="text-sm text-[var(--color-text-light)]">{t('selectDate')}</p>
            </div>
            <input
              type="date"
              value={pickDate}
              onChange={e => setPickDate(e.target.value)}
              className="w-full px-5 py-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] text-lg transition-colors focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
            />
            <div className="flex gap-3">
              <button onClick={() => setDatePickId(null)} className="flex-1 py-4 rounded-xl border border-[var(--color-border)] text-[var(--color-text-light)] font-semibold transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]">
                {t('cancel')}
              </button>
              <button onClick={confirmDate} className="flex-1 py-4 rounded-xl bg-[var(--color-success)] text-white font-semibold hover:bg-[var(--color-success-light)] transition-colors">
                {t('confirm')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cheer message */}
      {user?.babyName && (
        <p className="text-center text-sm text-[var(--color-text-muted)] mt-10 mb-8">
          Keep growing, {user.babyName}! 🌟
        </p>
      )}
    </div>
  )
}