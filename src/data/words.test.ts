import { describe, expect, it } from 'vitest'
import { WORDS } from './words'

describe('word data', () => {
  it('contains a substantial word list', () => {
    expect(WORDS.length).toBeGreaterThanOrEqual(800)
  })

  it('has no duplicate words', () => {
    const seen = new Set<string>()
    const duplicates: string[] = []
    for (const { word } of WORDS) {
      if (seen.has(word.toLowerCase())) duplicates.push(word)
      seen.add(word.toLowerCase())
    }
    expect(duplicates).toEqual([])
  })

  it('has non-empty word, pos and zh on every entry', () => {
    for (const entry of WORDS) {
      expect(entry.word.trim()).not.toBe('')
      expect(entry.pos.trim()).not.toBe('')
      expect(entry.zh.trim()).not.toBe('')
    }
  })

  it('is sorted A to Z', () => {
    for (let i = 1; i < WORDS.length; i++) {
      expect(
        WORDS[i - 1].word.localeCompare(WORDS[i].word, 'en'),
        `${WORDS[i - 1].word} should come before ${WORDS[i].word}`,
      ).toBeLessThanOrEqual(0)
    }
  })
})
