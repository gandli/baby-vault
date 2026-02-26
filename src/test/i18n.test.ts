/**
 * BDD Tests: i18n (Internationalization)
 * 
 * Feature: Multi-language Support
 * As a user
 * I want to switch between languages
 * So that I can use the app in my preferred language
 */
import { describe, it, expect, vi } from 'vitest'
import { getLang, t } from '../lib/i18n'

describe('i18n Support', () => {
  describe('Scenario: Get current language', () => {
    it('Given I am in China, When I check language, Then I get Chinese locale', () => {
      // Given - browser locale simulation
      const originalLang = navigator.language
      vi.stubGlobal('navigator', { language: 'zh-CN' })

      // When
      const lang = getLang()

      // Then
      expect(lang).toBe('zh')
    })

    it('Given I am in the US, When I check language, Then I get English locale', () => {
      // Given
      const originalLang = navigator.language
      vi.stubGlobal('navigator', { language: 'en-US' })

      // When
      const lang = getLang()

      // Then
      expect(lang).toBe('en')
    })
  })

  describe('Scenario: Translate text', () => {
    it('Given I am in Chinese, When I translate timeline, Then I get "时间轴"', () => {
      // Given
      vi.stubGlobal('navigator', { language: 'zh-CN' })

      // When
      const text = t('timeline')

      // Then
      expect(text).toBe('时间轴')
    })

    it('Given I am in English, When I translate timeline, Then I get "Timeline"', () => {
      // Given
      vi.stubGlobal('navigator', { language: 'en-US' })

      // When
      const text = t('timeline')

      // Then
      expect(text).toBe('Timeline')
    })

    it('Given I translate save, Then I get appropriate text in each language', () => {
      // Chinese
      vi.stubGlobal('navigator', { language: 'zh-CN' })
      expect(t('save')).toBe('保存')

      // English
      vi.stubGlobal('navigator', { language: 'en-US' })
      expect(t('save')).toBe('Save')
    })
  })

  describe('Scenario: Translate milestone terms', () => {
    it('Given I translate milestone, Then I get appropriate text in each language', () => {
      // Chinese
      vi.stubGlobal('navigator', { language: 'zh-CN' })
      expect(t('milestones')).toBe('里程碑')

      // English
      vi.stubGlobal('navigator', { language: 'en-US' })
      expect(t('milestones')).toBe('Milestones')
    })
  })

  describe('Scenario: Translate button labels', () => {
    it('Given I translate cancel, Then I get appropriate text in each language', () => {
      // Chinese
      vi.stubGlobal('navigator', { language: 'zh-CN' })
      expect(t('cancel')).toBe('取消')

      // English
      vi.stubGlobal('navigator', { language: 'en-US' })
      expect(t('cancel')).toBe('Cancel')
    })

    it('Given I translate delete, Then I get appropriate text in each language', () => {
      // Chinese
      vi.stubGlobal('navigator', { language: 'zh-CN' })
      expect(t('delete')).toBe('删除')

      // English
      vi.stubGlobal('navigator', { language: 'en-US' })
      expect(t('delete')).toBe('Delete')
    })
  })
})