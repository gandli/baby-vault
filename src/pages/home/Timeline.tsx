import { useAuth } from '../../lib/auth-context'
import { useEffect, useRef, useState } from 'react'
import { type PhotoRecord, getPhotos, savePhoto, deletePhoto } from '../../lib/photo-store'

function getMonthAge(birthday: string): number {
  const birth = new Date(birthday)
  const now = new Date()
  return (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth())
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return '刚刚'
  if (mins < 60) return `${mins} 分钟前`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} 小时前`
  const days = Math.floor(hours / 24)
  return `${days} 天前`
}

export default function Timeline() {
  const { user } = useAuth()
  const monthAge = user?.babyBirthday ? getMonthAge(user.babyBirthday) : 0
  const fileRef = useRef<HTMLInputElement>(null)
  const [photos, setPhotos] = useState<PhotoRecord[]>([])
  const [showNote, setShowNote] = useState(false)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getPhotos().then(setPhotos)
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
  }

  return (
    <div className="px-4 pt-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">
            {user?.babyName}的时间线
          </h1>
          <p className="text-sm text-gray-400">{monthAge} 个月</p>
        </div>
        <button
          onClick={() => fileRef.current?.click()}
          className="w-12 h-12 rounded-full bg-[#6CB4EE] text-white text-2xl flex items-center justify-center shadow-lg active:scale-95 transition-transform"
        >
          +
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*,video/*"
          capture="environment"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* Note modal */}
      {showNote && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
          <div className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-t-2xl p-6 space-y-4">
            {pendingFile && (
              <img
                src={URL.createObjectURL(pendingFile)}
                className="w-full h-48 object-cover rounded-xl"
                alt="preview"
              />
            )}
            <input
              type="text"
              placeholder="记录这个瞬间…（可选）"
              value={note}
              onChange={e => setNote(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6CB4EE]"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={() => { setShowNote(false); setPendingFile(null) }}
                className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-500"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-3 rounded-xl bg-[#6CB4EE] text-white font-medium disabled:opacity-50"
              >
                {saving ? '保存中…' : '保存 📸'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Photo grid */}
      {photos.length > 0 ? (
        <div className="grid grid-cols-2 gap-3">
          {photos.map(p => (
            <div key={p.id} className="relative group">
              <img
                src={p.thumbnail}
                className="w-full aspect-square object-cover rounded-xl"
                alt={p.note || '照片'}
              />
              {p.note && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 rounded-b-xl">
                  <p className="text-white text-xs truncate">{p.note}</p>
                </div>
              )}
              <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleDelete(p.id)}
                  className="w-6 h-6 rounded-full bg-red-500/80 text-white text-xs flex items-center justify-center"
                >
                  ×
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1">{timeAgo(p.createdAt)}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <div className="text-5xl mb-4">📷</div>
          <p className="text-center">
            还没有照片<br />
            <span className="text-sm">点击 + 记录第一个瞬间</span>
          </p>
        </div>
      )}
    </div>
  )
}
