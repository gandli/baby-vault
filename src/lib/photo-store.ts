const DB_NAME = 'babyvault'
const DB_VERSION = 1
const STORE_NAME = 'photos'

export interface PhotoRecord {
  id: string
  blob: Blob        // original full-res image
  thumbnail: string // base64 data URL (300px for grid)
  note: string
  createdAt: string
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
  const record: PhotoRecord = {
    id: crypto.randomUUID(),
    blob: file,
    thumbnail,
    note,
    createdAt: new Date().toISOString(),
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
