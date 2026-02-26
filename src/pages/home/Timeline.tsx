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
    <div className="px-4 pt-6 pb-24">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">
            {user?.babyName}{t('timeline')}
          </h1>
          <p className="text-sm text-gray-400">{monthAge}{t('months')} · {t('day', { n: dayAge })}</p>
        </div>
        <button
          onClick={() => fileRef.current?.click()}
          className="w-12 h-12 rounded-full bg-[#6CB4EE] text-white text-2xl flex items-center justify-center shadow-lg active:scale-95 transition-transform"
        >
          +
        </button>
        <input ref={fileRef} type="file" accept="image/*,video/*" capture="environment" className="hidden" onChange={handleFileChange} />
      </div>

      {showNote && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
          <div className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-t-2xl p-6 space-y-4 animate-slide-up">
            {pendingFile && <img src={URL.createObjectURL(pendingFile)} className="w-full h-48 object-cover rounded-xl" alt="preview" />}
            <input
              type="text" placeholder={t('recordMoment')} value={note} onChange={e => setNote(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6CB4EE]"
              autoFocus onKeyDown={e => e.key === 'Enter' && handleSave()}
            />
            <div className="flex gap-3">
              <button onClick={() => { setShowNote(false); setPendingFile(null) }} className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-500">{t('cancel')}</button>
              <button onClick={handleSave} disabled={saving} className="flex-1 py-3 rounded-xl bg-[#6CB4EE] text-white font-medium disabled:opacity-50">{saving ? t('saving') : t('save')}</button>
            </div>
          </div>
        </div>
      )}

      {viewing && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col animate-fade-in">
          <div className="flex items-center justify-between p-4">
            <button onClick={() => { setViewing(null); setEditingNote(false) }} className="text-white text-lg">✕</button>
            <span className="text-white/60 text-sm">{new Date(viewing.createdAt).toLocaleString()}</span>
            <button onClick={() => { handleDelete(viewing.id); setViewing(null) }} className="text-red-400 text-sm">{t('delete')}</button>
          </div>
          <div className="flex-1 flex items-center justify-center px-4 overflow-hidden">
            <img src={getPhotoURL(viewing)} className="max-w-full max-h-[65vh] object-contain rounded-xl" alt={viewing.note || ''} />
          </div>
          <div className="px-6 py-4">
            {editingNote ? (
              <div className="flex gap-2">
                <input type="text" value={viewNote} onChange={e => setViewNote(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg bg-white/10 text-white border border-white/20 focus:outline-none"
                  autoFocus onKeyDown={e => e.key === 'Enter' && handleSaveNote()} />
                <button onClick={handleSaveNote} className="text-[#6CB4EE] text-sm px-3">{t('save')}</button>
              </div>
            ) : (
              <button onClick={() => { setEditingNote(true); setViewNote(viewing.note) }} className="text-white/80 text-sm text-center w-full">
                {viewing.note || t('addNote')}
              </button>
            )}
          </div>
        </div>
      )}

      {longPressId && (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center" onClick={() => setLongPressId(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 mx-8 space-y-4" onClick={e => e.stopPropagation()}>
            <p className="text-gray-700 dark:text-gray-200 text-center">{t('deletePhoto')}</p>
            <div className="flex gap-3">
              <button onClick={() => setLongPressId(null)} className="flex-1 py-2 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-500 text-sm">{t('cancel')}</button>
              <button onClick={() => handleDelete(longPressId)} className="flex-1 py-2 rounded-lg bg-red-500 text-white text-sm">{t('delete')}</button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <div className="text-3xl animate-pulse">⏳</div>
          <p className="mt-2 text-sm">{t('loading')}</p>
        </div>
      ) : photos.length > 0 ? (
        <div className="space-y-6">
          {groups.map(g => (
            <div key={g.label}>
              <h2 className="text-sm font-medium text-gray-400 mb-3">{g.label}</h2>
              <div className="grid grid-cols-2 gap-3">
                {g.photos.map(p => (
                  <div key={p.id} className="relative cursor-pointer active:scale-[0.97] transition-transform"
                    onClick={() => { if (!longPressId) { setViewing(p); setEditingNote(false) } }}
                    onTouchStart={() => onTouchStart(p.id)} onTouchEnd={onTouchEnd} onTouchCancel={onTouchEnd}
                    onContextMenu={e => { e.preventDefault(); setLongPressId(p.id) }}>
                    <img src={p.thumbnail} className="w-full aspect-square object-cover rounded-xl" alt={p.note || ''} loading="lazy" />
                    {p.note && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 rounded-b-xl">
                        <p className="text-white text-xs truncate">{p.note}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <div className="text-5xl mb-4">📷</div>
          <p className="text-center">{t('noPhotos')}<br /><span className="text-sm">{t('noPhotosTip')}</span></p>
        </div>
      )}
    </div>
  )
}
