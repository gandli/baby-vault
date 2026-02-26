const DB_NAME = 'babyvault'
const DB_VERSION = 2  // Bump version for new fields
const STORE_NAME = 'photos'

export interface ExifData {
  dateTime?: string      // Original photo date/time from EXIF
  latitude?: number      // GPS latitude
  longitude?: number    // GPS longitude
  locationName?: string // Reverse geocoded location name
}

export interface PhotoRecord {
  id: string
  blob: Blob           // original full-res image
  thumbnail: string    // base64 data URL (300px for grid)
  note: string
  createdAt: string    // When saved to app
  capturedAt?: string  // When photo was taken (from EXIF)
  exif?: ExifData     // EXIF metadata
  score?: number       // 0-100 rating (persistent)
  label?: string       // rating label (persistent)
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

// Extract EXIF data from image file
async function extractExif(file: File): Promise<ExifData> {
  const exif: ExifData = {}
  
  try {
    // Read file as ArrayBuffer
    const buffer = await file.arrayBuffer()
    const view = new DataView(buffer)
    
    // Check for JPEG/TIFF magic numbers
    if (view.getUint16(0, false) !== 0xFFD8) {
      return exif  // Not a JPEG, no EXIF
    }
    
    let offset = 2
    const length = view.byteLength
    
    // Find EXIF marker (0xFFE1)
    while (offset < length) {
      if (view.getUint8(offset) !== 0xFF) break
      const marker = view.getUint8(offset + 1)
      if (marker === 0xE1) {
        // Found EXIF
        const exifLength = view.getUint16(offset + 2, false)
        const exifStart = offset + 4
        
        // Parse EXIF (simplified - just get DateTime and GPS)
        const exifData = parseExifBlock(buffer, exifStart, exifLength)
        return exifData
      }
      offset += 2 + view.getUint16(offset + 2, false)
    }
  } catch (e) {
    console.warn('EXIF extraction failed:', e)
  }
  
  return exif
}

// Parse EXIF block for DateTime and GPS
function parseExifBlock(buffer: ArrayBuffer, start: number, length: number): ExifData {
  const exif: ExifData = {}
  const decoder = new TextDecoder('utf-8')
  
  try {
    // Simple string search for DateTimeOriginal
    const str = decoder.decode(new Uint8Array(buffer, start, Math.min(length, 65536)))
    
    // DateTime format: "YYYY:MM:DD HH:MM:SS"
    const dateTimeMatch = str.match(/(\d{4}:\d{2}:\d{2} \d{2}:\d{2}:\d{2})/)
    if (dateTimeMatch) {
      // Convert to ISO format
      const [date, time] = dateTimeMatch[1].split(' ')
      const [year, month, day] = date.split(':')
      const [hour, min, sec] = time.split(':')
      exif.dateTime = `${year}-${month}-${day}T${hour}:${min}:${sec}`
    }
    
    // GPS extraction (simplified - look for GPSLatitudeRef, GPSLongitudeRef)
    // This is a basic implementation; for full GPS parsing, use exifreader library
    const latMatch = str.match(/GPSLatitude.*?(\d+)\/(\d+).*?(\d+)\/(\d+).*?(\d+)\/(\d+)/s)
    const lngMatch = str.match(/GPSLongitude.*?(\d+)\/(\d+).*?(\d+)\/(\d+).*?(\d+)\/(\d+)/s)
    const latRefMatch = str.match(/GPSLatitudeRef.*?([NS])/s)
    const lngRefMatch = str.match(/GPSLongitudeRef.*?([EW])/s)
    
    if (latMatch && latRefMatch) {
      const deg = parseInt(latMatch[1]) / parseInt(latMatch[2])
      const min = parseInt(latMatch[3]) / parseInt(latMatch[4])
      const sec = parseInt(latMatch[5]) / parseInt(latMatch[6])
      exif.latitude = deg + min / 60 + sec / 3600
      if (latRefMatch[1] === 'S') exif.latitude *= -1
    }
    
    if (lngMatch && lngRefMatch) {
      const deg = parseInt(lngMatch[1]) / parseInt(lngMatch[2])
      const min = parseInt(lngMatch[3]) / parseInt(lngMatch[4])
      const sec = parseInt(lngMatch[5]) / parseInt(lngMatch[6])
      exif.longitude = deg + min / 60 + sec / 3600
      if (lngRefMatch[1] === 'W') exif.longitude *= -1
    }
  } catch (e) {
    console.warn('EXIF parsing failed:', e)
  }
  
  return exif
}

export async function savePhoto(file: File, note: string): Promise<PhotoRecord> {
  const db = await openDB()
  const thumbnail = await createThumbnail(file, 300)
  const exif = await extractExif(file)
  
  // Calculate score based on file properties (consistent)
  const score = calculatePhotoScore(file)
  const label = getScoreLabel(score)
  
  const record: PhotoRecord = {
    id: crypto.randomUUID(),
    blob: file,
    thumbnail,
    note,
    createdAt: new Date().toISOString(),
    capturedAt: exif.dateTime,
    exif,
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
      // Sort by capturedAt (EXIF) if available, else createdAt
      photos.sort((a, b) => {
        const aTime = a.capturedAt || a.createdAt
        const bTime = b.capturedAt || b.createdAt
        return bTime.localeCompare(aTime)
      })
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

export async function updatePhotoExif(id: string, exif: ExifData): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const store = db.transaction(STORE_NAME, 'readwrite').objectStore(STORE_NAME)
    const req = store.get(id)
    req.onsuccess = () => {
      const record = req.result
      if (record) {
        record.exif = exif
        if (exif.dateTime) record.capturedAt = exif.dateTime
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
    capturedAt: p.capturedAt,
    exif: p.exif,
    thumbnail: p.thumbnail,
  }))
  return JSON.stringify({
    version: '0.2.0',
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

// Calculate score based on file properties (consistent across refreshes)
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

// Format date for display
export function formatPhotoDate(isoString: string): string {
  const date = new Date(isoString)
  return date.toLocaleDateString('zh-CN', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Format GPS coordinates for display
export function formatGps(lat?: number, lng?: number): string {
  if (lat === undefined || lng === undefined) return ''
  const latDir = lat >= 0 ? 'N' : 'S'
  const lngDir = lng >= 0 ? 'E' : 'W'
  return `${Math.abs(lat).toFixed(4)}°${latDir}, ${Math.abs(lng).toFixed(4)}°${lngDir}`
}