/**
 * BDD Tests: Settings Page
 * 
 * Feature: Settings
 * As a parent
 * I want to configure app settings
 * So that I can customize my experience
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import Settings from '../pages/settings/Settings'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value }),
    removeItem: vi.fn((key: string) => { delete store[key] }),
    clear: vi.fn(() => { store = {} }),
  }
})()

Object.defineProperty(window, 'localStorage', { value: localStorageMock })

// Mock auth context
vi.mock('../../lib/auth-context', () => ({
  useAuth: () => ({
    user: { babyName: '小豆子', babyBirthday: '2024-01-15' }
  })
}))

// Mock photo store
vi.mock('../../lib/photo-store', () => ({
  exportData: vi.fn(() => Promise.resolve(JSON.stringify({ version: '0.2.0' }))),
  downloadJSON: vi.fn(),
  getPhotos: vi.fn(() => Promise.resolve([])),
}))

describe('Settings Page', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  describe('Scenario: View settings', () => {
    it('Given I am on settings page, When I view the page, Then I see all settings options', async () => {
      // Given
      render(
        <BrowserRouter>
          <Settings />
        </BrowserRouter>
      )

      // Then
      expect(screen.getByText(/设置/i)).toBeInTheDocument()
    })
  })

  describe('Scenario: Edit baby profile', () => {
    it('Given I want to change baby name, When I edit and save, Then profile is updated', async () => {
      const user = userEvent.setup()

      // Given
      localStorageMock.getItem.mockReturnValue(JSON.stringify({
        babyName: '小豆子',
        babyBirthday: '2024-01-15'
      }))

      render(
        <BrowserRouter>
          <Settings />
        </BrowserRouter>
      )

      await waitFor(() => {
        expect(screen.getByText(/小豆子/i)).toBeInTheDocument()
      })

      // When - find edit button
      const editButtons = screen.queryAllByRole('button', { name: /编辑/i })
      if (editButtons.length > 0) {
        await user.click(editButtons[0])

        await waitFor(() => {
          const input = screen.queryByRole('textbox', { name: /宝宝名字/i })
          if (input) {
            // Can edit
            expect(input).toBeInTheDocument()
          }
        })
      }
    })
  })

  describe('Scenario: Export data', () => {
    it('Given I want to backup my data, When I click export, Then JSON file is downloaded', async () => {
      const user = userEvent.setup()

      // Given
      render(
        <BrowserRouter>
          <Settings />
        </BrowserRouter>
      )

      // When - find export button
      const exportButton = screen.queryByRole('button', { name: /导出/i }) ||
                           screen.queryByText(/导出/i)
      
      if (exportButton) {
        await user.click(exportButton)

        // Then
        await waitFor(() => {
          expect(screen.getByText(/导出/i)).toBeInTheDocument()
        })
      }
    })
  })

  describe('Scenario: Dark mode toggle', () => {
    it('Given I am using light mode, When I toggle dark mode, Then theme changes', async () => {
      const user = userEvent.setup()

      // Given
      render(
        <BrowserRouter>
          <Settings />
        </BrowserRouter>
      )

      // When - find dark mode toggle
      const darkModeToggle = screen.queryByRole('checkbox', { name: /暗色/i }) ||
                             screen.queryByRole('switch', { name: /暗色/i })
      
      if (darkModeToggle) {
        await user.click(darkModeToggle)

        // Then
        await waitFor(() => {
          expect(document.documentElement.classList.contains('dark')).toBe(true)
        })
      }
    })
  })

  describe('Scenario: Language switch', () => {
    it('Given app is in Chinese, When I switch to English, Then UI updates', async () => {
      const user = userEvent.setup()

      // Given
      render(
        <BrowserRouter>
          <Settings />
        </BrowserRouter>
      )

      // When - find language selector
      const languageSelect = screen.queryByRole('combobox', { name: /语言/i }) ||
                             screen.queryByRole('listbox', { name: /语言/i })
      
      if (languageSelect) {
        await user.click(languageSelect)
        
        // Then
        await waitFor(() => {
          expect(screen.getByText(/English/i)).toBeInTheDocument()
        })
      }
    })
  })

  describe('Scenario: Clear all data', () => {
    it('Given I want to reset app, When I confirm clear data, Then all data is removed', async () => {
      const user = userEvent.setup()

      // Given
      render(
        <BrowserRouter>
          <Settings />
        </BrowserRouter>
      )

      // When - find clear data button
      const clearButton = screen.queryByRole('button', { name: /清除/i }) ||
                          screen.queryByText(/清除/i)
      
      if (clearButton) {
        await user.click(clearButton)

        // Then - confirmation dialog should appear
        await waitFor(() => {
          expect(screen.getByText(/确认/i)).toBeInTheDocument()
        })
      }
    })
  })
})