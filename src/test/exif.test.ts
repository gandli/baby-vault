import { describe, it, expect } from 'vitest'
import { formatPhotoDate, formatGps } from '../lib/photo-store'

describe('EXIF Handling', () => {
  describe('Scenario: Format photo date', () => {
    it('Given a valid ISO date string, When I format it, Then I get localized date string', () => {
      // Given
      const isoString = '2024-01-15T10:30:00Z'

      // When
      const formatted = formatPhotoDate(isoString)

      // Then
      expect(formatted).toContain('2024')
      expect(formatted).toContain('1')
      expect(formatted).toContain('15')
    })
  })

  describe('Scenario: Format GPS coordinates', () => {
    it('Given valid lat/lng, When I format it, Then I get DMS notation', () => {
      // Given
      const lat = 39.9042
      const lng = 116.4074

      // When
      const formatted = formatGps(lat, lng)

      // Then
      expect(formatted).toContain('N')
      expect(formatted).toContain('E')
      expect(formatted).toContain('39')
      expect(formatted).toContain('116')
    })

    it('Given negative coordinates (S/W), When I format it, Then I get correct directions', () => {
      // Given
      const lat = -33.8688
      const lng = -151.2093

      // When
      const formatted = formatGps(lat, lng)

      // Then
      expect(formatted).toContain('S')
      expect(formatted).toContain('W')
    })

    it('Given undefined coordinates, When I format it, Then I get empty string', () => {
      // Given - undefined
      // When
      const formatted = formatGps(undefined, undefined)

      // Then
      expect(formatted).toBe('')
    })
  })
})