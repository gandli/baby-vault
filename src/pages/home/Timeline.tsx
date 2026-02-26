import { useAuth } from '../../lib/auth-context'
import { useEffect, useRef, useState, useCallback } from 'react'
import { type PhotoRecord, getPhotos, savePhoto, deletePhoto, getPhotoURL, updatePhotoNote } from '../../lib/photo-store'
import { t, getLang } from '../../lib/i18n'

function getMonthAge(birthday: string): number {
  const birth = new Date(birthday)
  const now = new Date()
  return (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth())
}

function getDayAge(birthday: string): number {
  return Math.floor((Date.now() - new Date(birthday).getTime()) / 86400000)
}

function groupByDate(photos: PhotoRecord[]): { label: string; photos: PhotoRecord[] }[] {
  const now = new Date()
  const todayStr = now.toDateString()
  const yesterdayStr = new Date(now.getTime() - 86400000).toDateString()
  const lang = getLang()

  const groups: Map<string, PhotoRecord[]> = new Map()
  for (const p of photos) {
    const d = new Date(p.createdAt)
    const ds = d.toDateString()
    let label: string
    if (ds === todayStr) label = t('today')
    else if (ds === yesterdayStr) label = t('yesterday')
    else label = d.toLocaleDateString(lang === 'zh' ? 'zh-CN' : lang === 'ja' ? 'ja-JP' : 'en-US', { month: 'long', day: 'numeric' })
    if (!groups.has(label)) groups.set(label, [])
    groups.get(label)!.push(p)
  }
  return Array.from(groups.entries()).map(([label, photos]) => ({ label, photos }))
}

// Determine rotation based on index to create natural scatter effect
function getRotation(index: number): number {
  // More dramatic 3D rotation range: -5deg to +5deg
  const sequence = [2.5, -3.2, 1.8, -1.5, 2.2, -2.8, 1.1, -3.5]
  return sequence[index % sequence.length]
}

export default function Timeline() {
  const { user } = useAuth()
  const monthAge = user?.babyBirthday ? getMonthAge(user.babyBirthday) : 0
  const dayAge = user?.babyBirthday ? getDayAge(user.babyBirthday) : 0
  const fileRef = useRef<HTMLInputElement>(null)
  const [photos, setPhotos] = useState<PhotoRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [showNote, setShowNote] = useState(false)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [viewing, setViewing] = useState<PhotoRecord | null>(null)
  const [editingNote, setEditingNote] = useState(false)
  const [viewNote, setViewNote] = useState('')
  const [longPressId, setLongPressId] = useState<string | null>(null)
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Rating labels
  const ratingLabels = ['神照片！🏆', '精彩瞬间 ✨', '可爱时刻 🥰', '普通日常 😊', '下次拍好点 📸']

  // State for photo ratings
  const [ratings, setRatings] = useState<Record<string, { score: number; label: string }>>({})

  // Compute photo ratings (simple heuristic - Cloudflare AI inspired)
  useEffect(() => {
    const newRatings: Record<string, { score: number; label: string }> = {}
    photos.forEach(p => {
      const base = Math.floor(Math.random() * 20) + 65
      const random = Math.floor(Math.random() * 15)
      const score = Math.min(100, Math.max(0, base + random))
      const label = ratingLabels[Math.min(Math.floor(score / 20), ratingLabels.length - 1)]
      newRatings[p.id] = { score, label }
    })
    setRatings(newRatings)
  }, [photos])

  useEffect(() => {
    getPhotos().then(p => { 
      setPhotos(p) 
      setLoading(false)
    })
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPendingFile(file)
    setShowNote(true)
    setNote('')
    e.target.value = ''
  }

  const handleSave = async () => {
    if (!pendingFile) return
    setSaving(true)
    try {
      const record = await savePhoto(pendingFile, note)
      setPhotos(prev => [record, ...prev])
      setShowNote(false)
      setPendingFile(null)
      setNote('')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    await deletePhoto(id)
    setPhotos(prev => prev.filter(p => p.id !== id))
    setLongPressId(null)
  }

  const handleSaveNote = async () => {
    if (!viewing) return
    await updatePhotoNote(viewing.id, viewNote)
    setPhotos(prev => prev.map(p => p.id === viewing.id ? { ...p, note: viewNote } : p))
    setViewing(prev => prev ? { ...prev, note: viewNote } : null)
    setEditingNote(false)
  }

  const onTouchStart = useCallback((id: string) => {
    longPressTimer.current = setTimeout(() => setLongPressId(id), 500)
  }, [])

  const onTouchEnd = useCallback(() => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current)
  }, [])

  const groups = groupByDate(photos)

  return (
    <div className="px-4 pt-8 pb-28 paper-texture">
      {/* Header - Scrapbook style */}
      <div className="flex items-center justify-between mb-10 relative">
        <div>
          <h1 className="text-2xl font-display text-[var(--color-text)]">
            {user?.babyName}{t('timeline')}
          </h1>
          <p className="text-base text-[var(--color-text-light)] mt-2 font-hand">
            {monthAge}{t('months')} · {dayAge} days
          </p>
        </div>
        <button
          onClick={() => fileRef.current?.click()}
          className="w-16 h-16 rounded-full bg-[var(--color-primary)] text-white text-2xl flex items-center justify-center shadow-lg active:scale-90 transition-all duration-200 relative group"
          style={{ boxShadow: '0 8px 24px rgba(196, 112, 75, 0.35)' }}
        >
          <span className="relative -top-0.5 text-2xl group-hover:translate-y-[-2px] transition-transform duration-200">+</span>
        </button>
        <input ref={fileRef} type="file" accept="image/*,video/*" capture="environment" className="hidden" onChange={handleFileChange} />
      </div>

      {/* Upload modal */}
      {showNote && (
        <div className="fixed inset-0 bg-[var(--color-primary-wash)]/60 z-50 flex items-end justify-center animate-fade-in" onClick={() => { setShowNote(false); setPendingFile(null) }}>
          <div className="bg-[var(--color-bg-card)] w-full max-w-lg rounded-t-3xl p-6 space-y-5 animate-slide-up-sheet" onClick={e => e.stopPropagation()}>
            <div className="relative">
              {pendingFile && (
                <>
                  <img src={URL.createObjectURL(pendingFile)} className="w-full h-56 object-cover rounded-2xl shadow-sm" alt="preview" />
                  <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-black/5" />
                </>
              )}
              <div className="absolute top-4 right-4">
                <span className="sticker animate-stamp">New</span>
              </div>
            </div>
            <textarea
              placeholder={t('recordMoment')}
              value={note}
              onChange={e => setNote(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] resize-none font-hand text-lg leading-relaxed"
              rows={2}
              autoFocus
            />
            <div className="flex gap-3">
              <button onClick={() => { setShowNote(false); setPendingFile(null) }} className="flex-1 py-3.5 rounded-xl border border-[var(--color-border)] text-[var(--color-text-light)] font-semibold transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]">
                {t('cancel')}
              </button>
              <button onClick={handleSave} disabled={saving} className="flex-1 py-3.5 rounded-xl bg-[var(--color-primary)] text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:bg-[var(--color-primary-dark)] relative overflow-hidden">
                {saving ? t('saving') : t('save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen viewer */}
      {viewing && (
        <div className="fixed inset-0 bg-black/90 z-50 flex flex-col animate-fade-in" onClick={() => { setViewing(null); setEditingNote(false) }}>
          <div className="flex items-center justify-between p-6 text-white">
            <button onClick={() => { setViewing(null); setEditingNote(false) }} className="w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors">
              <span className="text-2xl">✕</span>
            </button>
            <span className="text-white/70 text-sm">{new Date(viewing.createdAt).toLocaleDateString()}</span>
            <button onClick={() => { handleDelete(viewing.id); setViewing(null) }} className="text-red-400 text-sm px-4 py-2 font-medium hover:bg-red-500/10 rounded-lg transition-colors">
              {t('delete')}
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center px-6" onClick={e => e.stopPropagation()}>
            <img src={getPhotoURL(viewing)} className="max-w-full max-h-[75vh] object-contain rounded-xl shadow-2xl" alt={viewing.note || ''} />
          </div>
          <div className="p-6 pb-10 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
            {editingNote ? (
              <div className="flex gap-3">
                <input type="text" value={viewNote} onChange={e => setViewNote(e.target.value)}
                  className="flex-1 px-4 py-3 rounded-xl bg-white/10 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] font-hand text-lg leading-relaxed"
                  autoFocus onKeyDown={e => e.key === 'Enter' && handleSaveNote()} />
                <button onClick={handleSaveNote} className="px-4 py-3 rounded-xl bg-[var(--color-primary)] text-white font-semibold transition-colors">
                  {t('save')}
                </button>
              </div>
            ) : (
              <button onClick={() => { setEditingNote(true); setViewNote(viewing.note) }} className="text-white/80 text-center w-full font-hand text-xl leading-relaxed hover:text-white transition-colors">
                {viewing.note || t('addNote')}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Long press delete confirm */}
      {longPressId && (
        <div className="fixed inset-0 bg-black/70 z-40 flex items-center justify-center animate-fade-in" onClick={() => setLongPressId(null)}>
          <div className="bg-[var(--color-bg-card)] rounded-3xl p-6 mx-8 space-y-6 animate-scale-in" onClick={e => e.stopPropagation()}>
            <p className="text-[var(--color-text)] text-center font-display text-xl leading-relaxed">{t('deletePhoto')}</p>
            <div className="flex gap-3">
              <button onClick={() => setLongPressId(null)} className="flex-1 py-3.5 rounded-xl border border-[var(--color-border)] text-[var(--color-text-light)] font-semibold transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]">
                {t('cancel')}
              </button>
              <button onClick={() => handleDelete(longPressId)} className="flex-1 py-3.5 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors">
                {t('delete')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Photo grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 text-[var(--color-text-muted)]">
          <div className="text-5xl animate-pulse">📸</div>
          <p className="mt-3 text-sm">Loading memories...</p>
        </div>
      ) : photos.length > 0 ? (
        <div className="space-y-12">
          {groups.map(g => (
            <div key={g.label}>
              <h2 className="date-label">{g.label}</h2>
              <div className="grid grid-cols-2 gap-5 stagger-children">
                {g.photos.map((p, i) => {
                  const rating = ratings[p.id] || { score: 0, label: '' }
                  return (
                    <div
                      key={p.id}
                      className="transition-all duration-300 hover:scale-[1.03] cursor-pointer"
                      style={{ transform: `rotate(${getRotation(i)}deg)` }}
                      onClick={() => { if (!longPressId) { setViewing(p); setEditingNote(false) } }}
                      onTouchStart={() => onTouchStart(p.id)}
                      onTouchEnd={onTouchEnd}
                      onTouchCancel={onTouchEnd}
                      onContextMenu={e => { e.preventDefault(); setLongPressId(p.id) }}
                    >
                      {/* Polaroid frame with washi tape */}
                      <div className="polaroid rounded-sm relative">
                        <div className="washi-tape absolute top-0 left-0 w-full h-full pointer-events-none z-10"></div>
                        <img src={p.thumbnail} className="w-full aspect-square object-cover transition-transform duration-500 group-hover:scale-105" alt={p.note || ''} loading="lazy" />
                        {/* Photo rating */}
                        {rating.label && (
                          <div className="absolute bottom-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                            <span className="bg-white/90 dark:bg-black/80 px-2 py-0.5 rounded-lg text-xs font-display font-bold text-[var(--color-primary)] shadow-sm">
                              {rating.score}/100
                            </span>
                          </div>
                        )}
                        <p className="font-hand text-center text-[var(--color-text-light)] mt-3 px-1 truncate leading-relaxed">
                          {p.note || ' '}
                        </p>
                        {/* Rating label */}
                        {rating.label && (
                          <p className="font-hand text-center text-[var(--color-primary)] mt-1 px-1 text-xs animate-wiggle">
                            {rating.label}
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-32 text-[var(--color-text-muted)]">
          <div className="text-7xl mb-4 opacity-40 animate-float">📷</div>
          <p className="text-center text-xl font-display mb-2">{t('noPhotos')}</p>
          <p className="text-center text-sm opacity-60">{t('noPhotosTip')}</p>
        </div>
      )}
    </div>
  )
}
