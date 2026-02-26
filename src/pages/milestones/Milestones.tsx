import { useState, useEffect } from 'react'
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

  const done = milestones.filter(m => m.doneAt)
  const todo = milestones.filter(m => !m.doneAt)
  const progress = milestones.length ? (done.length / milestones.length) * 100 : 0

  return (
    <div className="px-4 pt-6 pb-24 paper-texture">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--color-text)]">{t('milestones')}</h1>
        <div className="sticker">
          {done.length}/{milestones.length}
        </div>
      </div>

      {/* Progress bar - wavy style */}
      <div className="relative h-3 bg-[var(--color-border)] rounded-full mb-8 overflow-hidden">
        <div 
          className="absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out"
          style={{ 
            width: `${progress}%`,
            background: 'linear-gradient(90deg, var(--color-success), var(--color-accent))'
          }}
        />
        {progress > 0 && (
          <div 
            className="absolute inset-y-0 left-0 rounded-full opacity-30"
            style={{ 
              width: `${progress}%`,
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)',
              animation: 'shimmer 2s infinite',
              backgroundSize: '200% 100%'
            }}
          />
        )}
      </div>

      {/* Todo milestones */}
      <div className="space-y-3 mb-6">
        {todo.map(m => (
          <button
            key={m.id}
            onClick={() => toggle(m.id)}
            className="w-full flex items-center gap-4 p-4 rounded-2xl bg-[var(--color-bg-card)] border border-[var(--color-border)] active:scale-[0.98] transition-all duration-200 text-left shadow-sm hover:shadow-md"
          >
            <span className="text-3xl">{m.emoji}</span>
            <span className="flex-1 text-[var(--color-text)] font-medium">{getMilestoneName(m)}</span>
            <span className="w-7 h-7 rounded-full border-2 border-[var(--color-border)] flex items-center justify-center text-transparent">
              ○
            </span>
          </button>
        ))}
      </div>

      {/* Add custom */}
      {adding ? (
        <div className="p-5 rounded-2xl bg-[var(--color-bg-card)] border border-[var(--color-border)] space-y-4 mb-6 animate-scale-in">
          <div className="flex gap-3">
            <input
              type="text"
              value={newEmoji}
              onChange={e => setNewEmoji(e.target.value)}
              className="w-14 px-2 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-center text-2xl"
              maxLength={2}
            />
            <input
              type="text"
              placeholder={t('milestoneName')}
              value={newName}
              onChange={e => setNewName(e.target.value)}
              className="flex-1 px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)]"
              autoFocus
              onKeyDown={e => e.key === 'Enter' && addCustom()}
            />
          </div>
          <div className="flex gap-3">
            <button onClick={() => setAdding(false)} className="flex-1 py-2.5 rounded-xl border border-[var(--color-border)] text-[var(--color-text-light)] text-sm">
              {t('cancel')}
            </button>
            <button onClick={addCustom} className="flex-1 py-2.5 rounded-xl bg-[var(--color-primary)] text-white text-sm font-medium">
              {t('add')}
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="w-full p-4 rounded-2xl border-2 border-dashed border-[var(--color-border)] text-[var(--color-text-muted)] text-sm active:scale-[0.98] transition-all duration-200 mb-6 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
        >
          {t('addCustom')}
        </button>
      )}

      {/* Completed milestones */}
      {done.length > 0 && (
        <>
          <h2 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-4 pl-1">{t('completed')}</h2>
          <div className="space-y-3">
            {done.map(m => (
              <div
                key={m.id}
                className="flex items-center gap-4 p-4 rounded-2xl bg-[var(--color-success-light)]/30 border border-[var(--color-success)]/20"
              >
                <span className="text-3xl">{m.emoji}</span>
                <div className="flex-1">
                  <span className="text-[var(--color-text)] font-medium">{getMilestoneName(m)}</span>
                  <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                    {new Date(m.doneAt!).toLocaleDateString()}
                  </p>
                </div>
                <button onClick={() => toggle(m.id)} className="w-7 h-7 rounded-full bg-[var(--color-success)] text-white flex items-center justify-center">
                  ✓
                </button>
                {!m.id.startsWith('preset-') && (
                  <button onClick={() => remove(m.id)} className="text-red-400 text-xs px-2">{t('delete')}</button>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Date picker modal */}
      {datePickId && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center animate-fade-in" onClick={() => setDatePickId(null)}>
          <div className="bg-[var(--color-bg-card)] rounded-3xl p-6 mx-8 space-y-4 animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="text-center">
              <span className="text-4xl">{milestones.find(m => m.id === datePickId)?.emoji}</span>
              <p className="text-[var(--color-text)] font-semibold mt-2">
                🎉 {getMilestoneName(milestones.find(m => m.id === datePickId)!)}
              </p>
            </div>
            <p className="text-sm text-[var(--color-text-muted)] text-center">{t('selectDate')}</p>
            <input
              type="date"
              value={pickDate}
              onChange={e => setPickDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)]"
            />
            <div className="flex gap-3">
              <button onClick={() => setDatePickId(null)} className="flex-1 py-3 rounded-xl border border-[var(--color-border)] text-[var(--color-text-light)]">
                {t('cancel')}
              </button>
              <button onClick={confirmDate} className="flex-1 py-3 rounded-xl bg-[var(--color-success)] text-white font-medium">
                {t('confirm')}
              </button>
            </div>
          </div>
        </div>
      )}

      {user?.babyName && (
        <p className="text-center text-sm text-[var(--color-text-muted)] mt-8">
          {user.babyName}{t('cheerUp')}
        </p>
      )}
    </div>
  )
}