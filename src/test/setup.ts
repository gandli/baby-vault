import '@testing-library/jest-dom'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import './global-mocks'

// Cleanup after each test
afterEach(() => {
  cleanup()
})