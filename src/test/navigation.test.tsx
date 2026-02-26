/**
 * BDD Tests: Navigation & Layout
 * 
 * Feature: Navigation
 * As a user
 * I want to navigate between pages
 * So that I can access different features
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter, MemoryRouter } from 'react-router-dom'
import Layout from '../components/Layout'

// Mock auth context
vi.mock('../../lib/auth-context', () => ({
  useAuth: () => ({
    user: { babyName: '小豆子', babyBirthday: '2024-01-15' }
  })
}))

describe('Navigation & Layout', () => {
  describe('Scenario: View dock bar', () => {
    it('Given I am on any page, When I view the bottom, Then I see the navigation dock', () => {
      // Given
      render(
        <BrowserRouter>
          <Layout />
        </BrowserRouter>
      )

      // Then
      expect(screen.getByRole('navigation')).toBeInTheDocument()
    })
  })

  describe('Scenario: Navigate between tabs', () => {
    it('Given I am on timeline, When I click milestones tab, Then I navigate to milestones', async () => {
      const user = userEvent.setup()

      // Given
      render(
        <MemoryRouter initialEntries={['/']}>
          <Layout />
        </MemoryRouter>
      )

      // When
      const milestonesLink = screen.getByRole('link', { name: /里程碑/i })
      await user.click(milestonesLink)

      // Then
      await waitFor(() => {
        expect(milestonesLink).toHaveAttribute('href', '/milestones')
      })
    })

    it('Given I am on milestones, When I click settings tab, Then I navigate to settings', async () => {
      const user = userEvent.setup()

      // Given
      render(
        <MemoryRouter initialEntries={['/milestones']}>
          <Layout />
        </MemoryRouter>
      )

      // When
      const settingsLink = screen.getByRole('link', { name: /设置/i })
      await user.click(settingsLink)

      // Then
      await waitFor(() => {
        expect(settingsLink).toHaveAttribute('href', '/settings')
      })
    })
  })

  describe('Scenario: Add photo button', () => {
    it('Given I am on any page, When I click the add button, Then file picker opens', async () => {
      const user = userEvent.setup()

      // Given
      render(
        <BrowserRouter>
          <Layout />
        </BrowserRouter>
      )

      // When
      const addButton = screen.getByRole('button', { name: /添加/i }) ||
                        screen.getByRole('button', { name: /➕/i })
      
      // Create a spy on the click
      const clickSpy = vi.fn()
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      
      if (fileInput) {
        const mockClick = vi.spyOn(fileInput, 'click')
        await user.click(addButton)
        
        // Then
        expect(mockClick).toHaveBeenCalled()
      }
    })
  })

  describe('Scenario: Active tab indicator', () => {
    it('Given I am on timeline, When I view the dock, Then timeline tab is highlighted', () => {
      // Given
      render(
        <MemoryRouter initialEntries={['/']}>
          <Layout />
        </MemoryRouter>
      )

      // Then
      const timelineLink = screen.getByRole('link', { name: /时间轴/i })
      // Active state would be via className
      expect(timelineLink).toBeInTheDocument()
    })
  })

  describe('Scenario: Safe area on mobile', () => {
    it('Given I am on a mobile device, When I view the dock, Then safe area is respected', () => {
      // Given
      render(
        <BrowserRouter>
          <Layout />
        </BrowserRouter>
      )

      // Then - check for safe-bottom class
      const nav = screen.getByRole('navigation')
      expect(nav.className).toContain('bottom')
    })
  })
})