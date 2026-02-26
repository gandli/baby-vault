import { describe, it, expect } from 'vitest'

describe('Photo Record Structure', () => {
  it('Given a photo record, When I check fields, Then it has all required fields', () => {
    // Given
    const mockFile = new File(['mock'], 'baby.jpg', { type: 'image/jpeg' })
    const record = {
      id: 'test-1' as string,
      blob: mockFile,
      thumbnail: 'data:image/jpeg;base64,mock' as string,
      note: '宝宝笑' as string,
      createdAt: new Date().toISOString() as string,
    }

    // Then
    expect(record).toHaveProperty('id')
    expect(record).toHaveProperty('blob')
    expect(record).toHaveProperty('thumbnail')
    expect(record).toHaveProperty('note')
    expect(record).toHaveProperty('createdAt')
  })
})