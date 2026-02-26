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

// Random rotation for polaroid effect
function getRotation(index: number): number {
  const seed = index * 7 + 3
  return ((seed % 7) - 3) * 0.8
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

  useEffect(() => {
    getPhotos().then(p => { setPhotos(p); setLoading(false) })
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
    <div className="px-4 pt-6 pb-24 paper-texture">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">
            {user?.babyName}{t('timeline')}
          </h1>
          <p className="text-sm text-[var(--color-text-light)] mt-1">
            {monthAge}{t('months')} · {t('day', { n: dayAge })}
          </p>
        </div>
        <button
          onClick={() => fileRef.current?.click()}
          className="w-14 h-14 rounded-full bg-[var(--color-primary)] text-white text-2xl flex items-center justify-center shadow-lg active:scale-95 transition-all duration-200 hover:shadow-xl"
          style={{ boxShadow: '0 4px 14px rgba(124, 158, 178, 0.4)' }}
        >
          <span className="relative -top-0.5">+</span>
        </button>
        <input ref={fileRef} type="file" accept="image/*,video/*" capture="environment" className="hidden" onChange={handleFileChange} />
      </div>

      {/* Upload modal */}
      {showNote && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center animate-fade-in" onClick={() => { setShowNote(false); setPendingFile(null) }}>
          <div className="bg-[var(--color-bg-card)] w-full max-w-lg rounded-t-3xl p-6 space-y-4 animate-slide-up" onClick={e => e.stopPropagation()}>
            {pendingFile && (
              <div className="relative">
                <img src={URL.createObjectURL(pendingFile)} className="w-full h-48 object-cover rounded-xl" alt="preview" />
                <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-black/5" />
              </div>
            )}
            <textarea
              placeholder={t('recordMoment')}
              value={note}
              onChange={e => setNote(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] resize-none font-hand text-base"
              rows={2}
              autoFocus
            />
            <div className="flex gap-3">
              <button onClick={() => { setShowNote(false); setPendingFile(null) }} className="flex-1 py-3 rounded-xl border border-[var(--color-border)] text-[var(--color-text-light)] font-medium">
                {t('cancel')}
              </button>
              <button onClick={handleSave} disabled={saving} className="flex-1 py-3 rounded-xl bg-[var(--color-primary)] text-white font-medium disabled:opacity-50 transition-all">
                {saving ? t('saving') : t('save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen viewer */}
      {viewing && (
        <div className="fixed inset-0 bg-black/95 z-50 flex flex-col animate-fade-in" onClick={() => { setViewing(null); setEditingNote(false) }}>
          <div className="flex items-center justify-between p-4 text-white">
            <button onClick={() => { setViewing(null); setEditingNote(false) }} className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10">
              <span className="text-xl">✕</span>
            </button>
            <span className="text-white/60 text-sm">{new Date(viewing.createdAt).toLocaleDateString()}</span>
            <button onClick={() => { handleDelete(viewing.id); setViewing(null) }} className="text-red-400 text-sm px-3 py-1">
              {t('delete')}
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center px-4" onClick={e => e.stopPropagation()}>
            <img src={getPhotoURL(viewing)} className="max-w-full max-h-[70vh] object-contain" alt={viewing.note || ''} />
          </div>
          <div className="p-6 pb-8">
            {editingNote ? (
              <div className="flex gap-2">
                <input type="text" value={viewNote} onChange={e => setViewNote(e.target.value)}
                  className="flex-1 px-4 py-2 rounded-lg bg-white/10 text-white border border-white/20 focus:outline-none font-hand"
                  autoFocus onKeyDown={e => e.key === 'Enter' && handleSaveNote()} />
                <button onClick={handleSaveNote} className="text-[var(--color-primary-light)] font-medium px-4">{t('save')}</button>
              </div>
            ) : (
              <button onClick={() => { setEditingNote(true); setViewNote(viewing.note) }} className="text-white/70 text-center w-full font-hand text-lg">
                {viewing.note || t('addNote')}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Long press delete confirm */}
      {longPressId && (
        <div className="fixed inset-0 bg-black/60 z-40 flex items-center justify-center animate-fade-in" onClick={() => setLongPressId(null)}>
          <div className="bg-[var(--color-bg-card)] rounded-2xl p-6 mx-8 space-y-4 animate-scale-in" onClick={e => e.stopPropagation()}>
            <p className="text-[var(--color-text)] text-center font-medium">{t('deletePhoto')}</p>
            <div className="flex gap-3">
              <button onClick={() => setLongPressId(null)} className="flex-1 py-2.5 rounded-lg border border-[var(--color-border)] text-[var(--color-text-light)]">{t('cancel')}</button>
              <button onClick={() => handleDelete(longPressId)} className="flex-1 py-2.5 rounded-lg bg-red-500 text-white font-medium">{t('delete')}</button>
            </div>
          </div>
        </div>
      )}

      {/* Photo grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-[var(--color-text-muted)]">
          <div className="text-4xl animate-pulse">📸</div>
          <p className="mt-3 text-sm">{t('loading')}</p>
        </div>
      ) : photos.length > 0 ? (
        <div className="space-y-10">
          {groups.map(g => (
            <div key={g.label}>
              <h2 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-4 pl-1">{g.label}</h2>
              <div className="grid grid-cols-2 gap-5">
                {g.photos.map((p, i) => (
                  <div
                    key={p.id}
                    className="cursor-pointer transition-all duration-300 hover:scale-[1.02]"
                    style={{ transform: `rotate(${getRotation(i)}deg)` }}
                    onClick={() => { if (!longPressId) { setViewing(p); setEditingNote(false) } }}
                    onTouchStart={() => onTouchStart(p.id)}
                    onTouchEnd={onTouchEnd}
                    onTouchCancel={onTouchEnd}
                    onContextMenu={e => { e.preventDefault(); setLongPressId(p.id) }}
                  >
                    {/* Polaroid frame */}
                    <div className="polaroid rounded-sm">
                      <img src={p.thumbnail} className="w-full aspect-square object-cover" alt={p.note || ''} loading="lazy" />
                      <p className="font-hand text-center text-[var(--color-text-light)] mt-2 px-1 truncate text-base">
                        {p.note || ' '}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-[var(--color-text-muted)]">
          <div className="text-7xl mb-4 opacity-60">📷</div>
          <p className="text-center text-lg font-medium">{t('noPhotos')}</p>
          <p className="text-sm mt-1">{t('noPhotosTip')}</p>
        </div>
      )}
    </div>
  )
}