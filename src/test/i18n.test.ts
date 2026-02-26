import { describe, it, expect, vi } from 'vitest'
import { getLang, t } from '../lib/i18n'

describe('i18n Support', () => {
  describe('Scenario: Get current language', () => {
    it('Given I am in China, When I check language, Then I get Chinese locale', () => {
      // Given
      vi.stubGlobal('navigator', { language: 'zh-CN' })

      // When
      const lang = getLang()

      // Then
      expect(lang).toBe('zh')
    })

    it('Given I am in the US, When I check language, Then I get English locale', () => {
      // Given
      vi.stubGlobal('navigator', { language: 'en-US' })

      // When
      const lang = getLang()

      // Then
      expect(lang).toBe('en')
    })
  })

  describe('Scenario: Translate text', () => {
    it('Given I translate timeline, Then I get appropriate text in each language', () => {
      // Chinese
      vi.stubGlobal('navigator', { language: 'zh-CN' })
      expect(t('timeline')).toBe('的时间线')

      // English
      vi.stubGlobal('navigator', { language: 'en-US' })
      expect(t('timeline')).toBe('\'s Timeline')
    })
  })
})