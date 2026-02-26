import { describe, it, expect } from 'vitest'
import { downloadJSON } from '../lib/photo-store'

describe('Data Export', () => {
  describe('Scenario: Download JSON file', () => {
    it('Given I export data, When I download, Then file is saved with correct name', () => {
      // Mock DOM elements
      const mockAnchor = {
        href: '',
        download: '',
        click: vi.fn(),
      }
      vi.spyOn(document, 'createElement').mockReturnValue(mockAnchor as any)
      vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url')
      vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})

      // When
      downloadJSON(JSON.stringify({ version: '0.2.0' }), 'babyvault-export.json')

      // Then
      expect(mockAnchor.download).toBe('babyvault-export.json')
      expect(mockAnchor.click).toHaveBeenCalled()
    })
  })
})