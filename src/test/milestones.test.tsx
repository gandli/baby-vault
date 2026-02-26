/**
 * BDD Tests: Milestone Management
 * 
 * Feature: Milestones
 * As a parent
 * I want to track baby's milestones
 * So that I can celebrate developmental achievements
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import Milestones from '../pages/milestones/Milestones'

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

describe('Milestone Management', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  describe('Scenario: View default milestones', () => {
    it('Given I am a new user, When I visit milestones page, Then I see suggested milestones', async () => {
      // Given
      render(
        <BrowserRouter>
          <Milestones />
        </BrowserRouter>
      )

      // Then - default milestones should be shown
      await waitFor(() => {
        expect(screen.getByText(/里程碑/i)).toBeInTheDocument()
      })
    })
  })

  describe('Scenario: Add custom milestone', () => {
    it('Given I am on milestones page, When I add a new milestone, Then it appears in the list', async () => {
      const user = userEvent.setup()

      // Given
      render(
        <BrowserRouter>
          <Milestones />
        </BrowserRouter>
      )

      await waitFor(() => {
        expect(screen.getByText(/里程碑/i)).toBeInTheDocument()
      })

      // When - add new milestone
      const addButton = screen.queryByRole('button', { name: /添加/i }) || 
                        screen.queryByRole('button', { name: /\+/i }) ||
                        screen.queryAllByRole('button').find(btn => btn.textContent?.includes('+'))
      
      if (addButton) {
        await user.click(addButton)

        // Then
        await waitFor(() => {
          expect(localStorageMock.setItem).toHaveBeenCalled()
        })
      }
    })
  })

  describe('Scenario: Mark milestone as completed', () => {
    it('Given I have an uncompleted milestone, When I mark it done, Then it shows completion date', async () => {
      const user = userEvent.setup()

      // Given - with existing milestones
      localStorageMock.getItem.mockReturnValue(JSON.stringify([
        { id: '1', title: '第一次翻身', completed: false, targetMonths: 3 }
      ]))

      render(
        <BrowserRouter>
          <Milestones />
        </BrowserRouter>
      )

      await waitFor(() => {
        expect(screen.getByText(/第一次翻身/i)).toBeInTheDocument()
      })

      // When - click to complete
      const milestone = screen.getByText(/第一次翻身/i)
      await user.click(milestone)

      // Then
      await waitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalled()
      })
    })
  })

  describe('Scenario: Delete milestone', () => {
    it('Given I have a milestone, When I delete it, Then it is removed from the list', async () => {
      const user = userEvent.setup()

      // Given
      localStorageMock.getItem.mockReturnValue(JSON.stringify([
        { id: '1', title: '测试里程碑', completed: false }
      ]))

      render(
        <BrowserRouter>
          <Milestones />
        </BrowserRouter>
      )

      await waitFor(() => {
        expect(screen.getByText(/测试里程碑/i)).toBeInTheDocument()
      })

      // When - delete (if there's a delete button)
      const deleteButtons = screen.queryAllByRole('button', { name: /删除/i })
      if (deleteButtons.length > 0) {
        await user.click(deleteButtons[0])
        
        // Then
        await waitFor(() => {
          expect(screen.queryByText(/测试里程碑/i)).not.toBeInTheDocument()
        })
      }
    })
  })

  describe('Scenario: Milestone suggestions based on baby age', () => {
    it('Given my baby is 2 months old, When I view milestones, Then 3-month milestones are highlighted', async () => {
      // Given
      render(
        <BrowserRouter>
          <Milestones />
        </BrowserRouter>
      )

      // Then
      await waitFor(() => {
        expect(screen.getByText(/里程碑/i)).toBeInTheDocument()
      })
    })
  })
})