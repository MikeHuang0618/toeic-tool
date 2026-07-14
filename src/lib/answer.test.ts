import { describe, expect, it } from 'vitest'
import { acceptedMeanings, isMeaningCorrect } from './answer'

describe('isMeaningCorrect', () => {
  it('matches a single exact meaning', () => {
    expect(isMeaningCorrect('能力', '能力')).toBe(true)
  })

  it('matches any one of multiple 「；」-separated meanings', () => {
    expect(isMeaningCorrect('放棄', '放棄；拋棄')).toBe(true)
    expect(isMeaningCorrect('拋棄', '放棄；拋棄')).toBe(true)
  })

  it('rejects input that matches no meaning', () => {
    expect(isMeaningCorrect('蘋果', '放棄；拋棄')).toBe(false)
  })

  it('rejects a partial substring of a meaning', () => {
    expect(isMeaningCorrect('放', '放棄；拋棄')).toBe(false)
  })

  it('ignores surrounding and internal whitespace', () => {
    expect(isMeaningCorrect(' 放棄 ', '放棄；拋棄')).toBe(true)
    expect(isMeaningCorrect('放 棄', '放棄；拋棄')).toBe(true)
    expect(isMeaningCorrect('　拋棄　', '放棄；拋棄')).toBe(true)
  })

  it('treats fullwidth-paren annotations as optional', () => {
    expect(isMeaningCorrect('會計', '會計（學）')).toBe(true)
    expect(isMeaningCorrect('會計（學）', '會計（學）')).toBe(true)
    expect(isMeaningCorrect('前進', '前進；預先（in advance 事先）')).toBe(true)
    expect(isMeaningCorrect('預先', '前進；預先（in advance 事先）')).toBe(true)
  })

  it('matches each alternative in a 「／」-joined meaning', () => {
    expect(isMeaningCorrect('辦理登機', '報到；辦理登機／入住')).toBe(true)
    expect(isMeaningCorrect('入住', '報到；辦理登機／入住')).toBe(true)
    expect(isMeaningCorrect('報到', '報到；辦理登機／入住')).toBe(true)
  })

  it('also splits on halfwidth separators', () => {
    expect(isMeaningCorrect('支持', '備份;支持')).toBe(true)
    expect(isMeaningCorrect('入住', '辦理登機/入住')).toBe(true)
  })

  it('rejects empty or whitespace-only input', () => {
    expect(isMeaningCorrect('', '能力')).toBe(false)
    expect(isMeaningCorrect('   ', '能力')).toBe(false)
  })
})

describe('acceptedMeanings', () => {
  it('lists every accepted variant for a compound meaning', () => {
    const accepted = acceptedMeanings('會計（學）；記帳')
    expect(accepted).toContain('會計（學）')
    expect(accepted).toContain('會計')
    expect(accepted).toContain('記帳')
  })

  it('produces no empty candidates', () => {
    expect(acceptedMeanings('放棄；拋棄')).not.toContain('')
  })
})
