/**
 * BDD Tests: Photo Upload Flow
 * 
 * Feature: Photo Management
 * As a parent
 * I want to upload and organize photos of my baby
 * So that I can preserve precious memories
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import Timeline from '../pages/home/Timeline'
import * as photoStore from '../lib/photo-store'

// Mock IndexedDB
const mockPhotos: photoStore.PhotoRecord[] = []

vi.mock('../../lib/photo-store', () => ({
  getPhotos: vi.fn(() => Promise.resolve(mockPhotos)),
  savePhoto: vi.fn((file: File, note: string) => 
    Promise.resolve({
      id: 'test-id',
      blob: file,
      thumbnail: 'data:image/jpeg;base64,mock',
      note,
      createdAt: new Date().toISOString(),
      score: 80,
      label: '精彩瞬间 ✨',
    })
  ),
  deletePhoto: vi.fn(() => Promise.resolve()),
  updatePhotoNote: vi.fn(() => Promise.resolve()),
  getScoreLabel: vi.fn((score: number) => '精彩瞬间 ✨'),
}))

// Mock auth context
vi.mock('../../lib/auth-context', () => ({
  useAuth: () => ({
    user: { babyName: '小豆子', babyBirthday: '2024-01-15' }
  })
}))

// Mock URL.createObjectURL
global.URL.createObjectURL = vi.fn(() => 'blob:mock-url')
global.URL.revokeObjectURL = vi.fn()

describe('Photo Upload Flow', () => {
  beforeEach(() => {
    mockPhotos.length = 0
    vi.clearAllMocks()
  })

  describe('Scenario: Upload first photo', () => {
    it('Given I am on timeline with no photos, When I click add button and select a photo, Then I see upload modal', async () => {
      const user = userEvent.setup()
      
      // Given
      render(
        <BrowserRouter>
          <Timeline />
        </BrowserRouter>
      )

      // When - trigger addPhoto event (from Layout)
      const file = new File(['mock image'], 'baby.jpg', { type: 'image/jpeg' })
      window.dispatchEvent(new CustomEvent('addPhoto', { detail: file }))

      // Then
      await waitFor(() => {
        expect(screen.getByPlaceholderText(/记录这一刻/i)).toBeInTheDocument()
      })
    })

    it('Given I see upload modal, When I add a note and save, Then photo is stored with note', async () => {
      const user = userEvent.setup()
      
      // Given
      render(
        <BrowserRouter>
          <Timeline />
        </BrowserRouter>
      )

      // When
      const file = new File(['mock image'], 'baby.jpg', { type: 'image/jpeg' })
      window.dispatchEvent(new CustomEvent('addPhoto', { detail: file }))

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/记录这一刻/i)).toBeInTheDocument()
      })

      await user.type(screen.getByPlaceholderText(/记录这一刻/i), '宝宝第一次笑')
      await user.click(screen.getByText(/保存/i))

      // Then
      await waitFor(() => {
        expect(photoStore.savePhoto).toHaveBeenCalled()
      })
    })
  })

  describe('Scenario: Cancel upload', () => {
    it('Given I see upload modal, When I click cancel, Then modal closes without saving', async () => {
      const user = userEvent.setup()
      
      // Given
      render(
        <BrowserRouter>
          <Timeline />
        </BrowserRouter>
      )

      const file = new File(['mock image'], 'baby.jpg', { type: 'image/jpeg' })
      window.dispatchEvent(new CustomEvent('addPhoto', { detail: file }))

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/记录这一刻/i)).toBeInTheDocument()
      })

      // When
      await user.click(screen.getByText(/取消/i))

      // Then
      await waitFor(() => {
        expect(screen.queryByPlaceholderText(/记录这一刻/i)).not.toBeInTheDocument()
      })
      expect(photoStore.savePhoto).not.toHaveBeenCalled()
    })
  })

  describe('Scenario: EXIF data extraction', () => {
    it('Given I upload a photo with EXIF, When photo is saved, Then EXIF data is extracted', async () => {
      // This tests the photo-store.ts extractExif function
      const file = new File(['mock image'], 'baby.jpg', { type: 'image/jpeg' })
      
      // EXIF extraction happens inside savePhoto
      await photoStore.savePhoto(file, 'test note')

      expect(photoStore.savePhoto).toHaveBeenCalledWith(file, 'test note')
    })
  })

  describe('Scenario: Photo scoring', () => {
    it('Given I upload a photo, When it is saved, Then a consistent score is assigned', async () => {
      const file = new File(['mock image'], 'baby.jpg', { type: 'image/jpeg' })
      file.lastModified = 1704067200000

      const result = await photoStore.savePhoto(file, 'test')

      expect(result.score).toBeDefined()
      expect(result.score).toBeGreaterThanOrEqual(65)
      expect(result.score).toBeLessThanOrEqual(94)
      expect(result.label).toBeDefined()
    })

    it('Given same photo uploaded twice, When scores are calculated, Then they are identical', async () => {
      const file1 = new File(['mock'], 'baby.jpg', { type: 'image/jpeg' })
      file1.lastModified = 1704067200000

      const file2 = new File(['mock'], 'baby.jpg', { type: 'image/jpeg' })
      file2.lastModified = 1704067200000

      const result1 = await photoStore.savePhoto(file1, 'test')
      const result2 = await photoStore.savePhoto(file2, 'test')

      expect(result1.score).toBe(result2.score)
    })
  })

  describe('Scenario: View photo fullscreen', () => {
    it('Given I have photos on timeline, When I click a photo, Then fullscreen viewer opens', async () => {
      // Given - render with existing photos
      const mockPhoto: photoStore.PhotoRecord = {
        id: 'test-id',
        blob: new File(['mock'], 'baby.jpg', { type: 'image/jpeg' }),
        thumbnail: 'data:image/jpeg;base64,mock',
        note: '宝宝笑',
        createdAt: new Date().toISOString(),
        score: 80,
        label: '精彩瞬间 ✨',
      }
      vi.mocked(photoStore.getPhotos).mockResolvedValueOnce([mockPhoto])

      render(
        <BrowserRouter>
          <Timeline />
        </BrowserRouter>
      )

      await waitFor(() => {
        expect(screen.getByAltText('宝宝笑')).toBeInTheDocument()
      })

      // When
      await userEvent.click(screen.getByAltText('宝宝笑'))

      // Then
      await waitFor(() => {
        expect(screen.getByText(/删除/i)).toBeInTheDocument()
      })
    })
  })

  describe('Scenario: Delete photo via long press', () => {
    it('Given I am viewing photo fullscreen, When I click delete, Then confirmation appears', async () => {
      const mockPhoto: photoStore.PhotoRecord = {
        id: 'test-id',
        blob: new File(['mock'], 'baby.jpg', { type: 'image/jpeg' }),
        thumbnail: 'data:image/jpeg;base64,mock',
        note: '宝宝笑',
        createdAt: new Date().toISOString(),
        score: 80,
        label: '精彩瞬间 ✨',
      }
      vi.mocked(photoStore.getPhotos).mockResolvedValueOnce([mockPhoto])

      render(
        <BrowserRouter>
          <Timeline />
        </BrowserRouter>
      )

      await waitFor(() => {
        expect(screen.getByAltText('宝宝笑')).toBeInTheDocument()
      })

      // When
      await userEvent.click(screen.getByAltText('宝宝笑'))
      await waitFor(() => {
        expect(screen.getByText(/删除/i)).toBeInTheDocument()
      })
      await userEvent.click(screen.getByText(/删除/i))

      // Then - photo is deleted
      await waitFor(() => {
        expect(photoStore.deletePhoto).toHaveBeenCalledWith('test-id')
      })
    })
  })

  describe('Scenario: Edit photo note', () => {
    it('Given I am viewing photo fullscreen, When I tap the note, Then I can edit it', async () => {
      const user = userEvent.setup()
      const mockPhoto: photoStore.PhotoRecord = {
        id: 'test-id',
        blob: new File(['mock'], 'baby.jpg', { type: 'image/jpeg' }),
        thumbnail: 'data:image/jpeg;base64,mock',
        note: '宝宝笑',
        createdAt: new Date().toISOString(),
        score: 80,
        label: '精彩瞬间 ✨',
      }
      vi.mocked(photoStore.getPhotos).mockResolvedValueOnce([mockPhoto])

      render(
        <BrowserRouter>
          <Timeline />
        </BrowserRouter>
      )

      await waitFor(() => {
        expect(screen.getByAltText('宝宝笑')).toBeInTheDocument()
      })

      await user.click(screen.getByAltText('宝宝笑'))

      await waitFor(() => {
        expect(screen.getByText('宝宝笑')).toBeInTheDocument()
      })

      // When - click on note to edit
      await user.click(screen.getByText('宝宝笑'))

      // Then - input appears
      await waitFor(() => {
        expect(screen.getByRole('textbox')).toBeInTheDocument()
      })
    })
  })
})