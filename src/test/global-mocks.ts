import '@testing-library/jest-dom'
import { beforeAll, afterAll, beforeEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'
import { extendExpect } from '@testing-library/jest-dom'

expect.extend(matchers)

// Mock localStorage
const localStorageMock = (function() {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value },
    removeItem: (key: string) => { delete store[key] },
    clear: () => { store = {} },
  }
})()

Object.defineProperty(window, 'localStorage', { value: localStorageMock })

// Mock indexedDB for Node.js environment
const mockIDBFactory = {
  open: () => ({
    onupgradeneeded: null,
    onsuccess: null,
    onerror: null,
    result: {
      objectStoreNames: { contains: () => true },
      transaction: () => ({
        objectStore: () => ({
          put: () => ({ oncomplete: null, onerror: null }),
          get: () => ({ onsuccess: null, onerror: null }),
          delete: () => ({ oncomplete: null, onerror: null }),
          getAll: () => ({ onsuccess: null, onerror: null }),
        }),
        oncomplete: null,
        onerror: null,
      }),
    },
  }),
}

Object.defineProperty(window, 'indexedDB', { value: mockIDBFactory })

// Mock navigator.language
const originalLanguage = Object.getOwnPropertyDescriptor(navigator, 'language')

beforeAll(() => {
  // Set default language to Chinese for tests
  Object.defineProperty(navigator, 'language', { value: 'zh-CN' })
})

afterAll(() => {
  if (originalLanguage) {
    Object.defineProperty(navigator, 'language', originalLanguage)
  }
})

beforeEach(() => {
  cleanup()
  localStorageMock.clear()
})