const DB_NAME = 'babyvault'
const DB_VERSION = 1
const STORE_NAME = 'photos'

export interface PhotoRecord {
  id: string
  blob: Blob        // original full-res image
  thumbnail: string // base64 data URL (300px for grid)
  note: string
  createdAt: string
  score?: number    // 0-100 rating (persistent)
  label?: string    // rating label (persistent)
}

export function getPhotoURL(record: PhotoRecord): string {
  return URL.createObjectURL(record.blob)
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' })
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export async function savePhoto(file: File, note: string): Promise<PhotoRecord> {
  const db = await openDB()
  const thumbnail = await createThumbnail(file, 300)
  
  // Calculate score based on image properties ID (consistent)
  const score = calculatePhotoScore(file)
  const label = getScoreLabel(score)
  
  const record: PhotoRecord = {
    id: crypto.randomUUID(),
    blob: file,
    thumbnail,
    note,
    createdAt: new Date().toISOString(),
    score,
    label,
  }
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).put(record)
    tx.oncomplete = () => resolve(record)
    tx.onerror = () => reject(tx.error)
  })
}

export async function getPhotos(): Promise<PhotoRecord[]> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const req = tx.objectStore(STORE_NAME).getAll()
    req.onsuccess = () => {
      const photos = req.result as PhotoRecord[]
      photos.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      resolve(photos)
    }
    req.onerror = () => reject(req.error)
  })
}

export async function deletePhoto(id: string): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).delete(id)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function updatePhotoNote(id: string, note: string): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const store = db.transaction(STORE_NAME, 'readwrite').objectStore(STORE_NAME)
    const req = store.get(id)
    req.onsuccess = () => {
      const record = req.result
      if (record) {
        record.note = note
        const putReq = store.put(record)
        putReq.onsuccess = () => resolve()
        putReq.onerror = () => reject(putReq.error)
      } else resolve()
    }
    req.onerror = () => reject(req.error)
  })
}

function createThumbnail(file: File, maxSize: number): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const scale = Math.min(maxSize / img.width, maxSize / img.height, 1)
      canvas.width = img.width * scale
      canvas.height = img.height * scale
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      resolve(canvas.toDataURL('image/jpeg', 0.7))
      URL.revokeObjectURL(img.src)
    }
    img.src = URL.createObjectURL(file)
  })
}

export async function exportData(): Promise<string> {
  const photos = await getPhotos()
  const data = photos.map(p => ({
    id: p.id,
    note: p.note,
    createdAt: p.createdAt,
    thumbnail: p.thumbnail,
  }))
  return JSON.stringify({
    version: '0.1.0',
    exportedAt: new Date().toISOString(),
    user: JSON.parse(localStorage.getItem('babyvault_user') || '{}'),
    milestones: JSON.parse(localStorage.getItem('babyvault_milestones') || '[]'),
    photos: data,
    photoCount: data.length,
  }, null, 2)
}

export function downloadJSON(json: string, filename: string) {
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

// Rating labels (fixed, not random)
const RATING_LABELS = ['神照片！🏆', '精彩瞬间 ✨', '可爱时刻 🥰', '普通日常 😊', '下次拍好点 📸']

// Determine label based on score
export function getScoreLabel(score: number): string {
  const index = Math.min(Math.floor(score / 20), RATING_LABELS.length - 1)
  return RATING_LABELS[index]
}

// Calculate score based on file name hash (consistent across refreshes)
export function calculatePhotoScore(file: File): number {
  // Hash the file name + size + lastModified to create deterministic score
  const hash = (str: string): number => {
    let h = 0
    for (let i = 0; i < str.length; i++) {
      h = ((h << 5) - h) + str.charCodeAt(i)
      h |= 0
    }
    return Math.abs(h)
  }
  
  const input = `${file.name}-${file.size}-${file.lastModified}`
  const baseScore = hash(input) % 30 // 0-29 range
  return 65 + baseScore // 65-94 range (no very low or very high scores)
}
