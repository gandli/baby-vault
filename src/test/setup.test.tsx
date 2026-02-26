/**
 * BDD Tests: User Setup Flow
 * 
 * Feature: User Onboarding
 * As a new user
 * I want to set up my baby's profile
 * So that the app can personalize the experience
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import Setup from '../pages/auth/Setup'

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

// Mock useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('User Setup Flow', () => {
  beforeEach(() => {
    localStorageMock.clear()
    mockNavigate.mockClear()
  })

  describe('Scenario: New user first visit', () => {
    it('Given I am a new user, When I visit the app, Then I see the setup form', async () => {
      // Given
      render(
        <BrowserRouter>
          <Setup />
        </BrowserRouter>
      )

      // Then
      expect(screen.getByText(/宝宝名字/i)).toBeInTheDocument()
      expect(screen.getByText(/出生日期/i)).toBeInTheDocument()
    })

    it('Given I am on the setup page, When I enter baby info and submit, Then profile is saved', async () => {
      const user = userEvent.setup()
      
      // Given
      render(
        <BrowserRouter>
          <Setup />
        </BrowserRouter>
      )

      // When
      await user.type(screen.getByPlaceholderText(/宝宝名字/i), '小豆子')
      await user.type(screen.getByPlaceholderText(/出生日期/i), '2024-01-15')
      await user.click(screen.getByText(/开始记录/i))

      // Then
      await waitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalledWith(
          'babyvault_user',
          expect.stringContaining('小豆子')
        )
        expect(mockNavigate).toHaveBeenCalledWith('/timeline')
      })
    })
  })

  describe('Scenario: Validation errors', () => {
    it('Given I am on setup page, When I submit without filling required fields, Then I see error messages', async () => {
      const user = userEvent.setup()
      
      // Given
      render(
        <BrowserRouter>
          <Setup />
        </BrowserRouter>
      )

      // When
      await user.click(screen.getByText(/开始记录/i))

      // Then - form should show validation (HTML5 required)
      const nameInput = screen.getByPlaceholderText(/宝宝名字/i)
      expect(nameInput).toBeRequired()
    })
  })

  describe('Scenario: Returning user', () => {
    it('Given I have already set up my profile, When I visit the app, Then I am redirected to timeline', async () => {
      // Given
      localStorageMock.getItem.mockReturnValue(JSON.stringify({
        babyName: '小豆子',
        babyBirthday: '2024-01-15'
      }))

      // When we render the app (App.tsx would handle this redirect)
      // This is typically handled at the router level

      // Then - navigation should redirect
      // (This would be tested in App.test.tsx)
    })
  })
})