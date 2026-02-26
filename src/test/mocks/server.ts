import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

// Mock handlers for API calls (if any)
export const handlers = [
  // Add any API mock handlers here
]

export const server = setupServer(...handlers)