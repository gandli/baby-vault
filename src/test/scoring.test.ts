import { describe, it, expect } from 'vitest'
import { calculatePhotoScore, getScoreLabel } from '../lib/photo-store'

describe('Photo Scoring', () => {
  describe('Scenario: Calculate consistent score', () => {
    it('Given same file, When I calculate score multiple times, Then score is identical', () => {
      // Given
      const file = new File(['mock'], 'baby.jpg', { type: 'image/jpeg' })

      // When
      const score1 = calculatePhotoScore(file)
      const score2 = calculatePhotoScore(file)

      // Then
      expect(score1).toBe(score2)
      expect(score1).toBeGreaterThanOrEqual(65)
      expect(score1).toBeLessThanOrEqual(94)
    })
  })

  describe('Scenario: Get label from score', () => {
    it('Given a score in valid range, When I get label, Then I get appropriate label', () => {
      // Test all score ranges
      expect(getScoreLabel(95)).toBe('神照片！🏆')
      expect(getScoreLabel(85)).toBe('精彩瞬间 ✨')
      expect(getScoreLabel(75)).toBe('可爱时刻 🥰')
      expect(getScoreLabel(65)).toBe('普通日常 😊')
    })
  })
})