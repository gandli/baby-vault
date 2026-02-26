import '@testing-library/jest-dom'
import { afterEach, beforeAll, afterAll } from 'vitest'
import { cleanup } from '@testing-library/react'
import { server } from './mocks/server'
import './global-mocks'

// Cleanup after each test
afterEach(() => {
  cleanup()
})