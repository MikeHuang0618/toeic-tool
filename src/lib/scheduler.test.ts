import { describe, expect, it } from 'vitest'
import {
  INITIAL_WEIGHT,
  MAX_WEIGHT,
  MIN_WEIGHT,
  getStat,
  markExamRight,
  markExamWrong,
  markRight,
  markWrong,
  pickWord,
  type Progress,
} from './scheduler'

function mulberry32(seed: number): () => number {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

describe('getStat', () => {
  it('returns default stat for an unseen word', () => {
    const stat = getStat({}, 'abandon')
    expect(stat).toEqual({
      weight: INITIAL_WEIGHT,
      wrongCount: 0,
      rightCount: 0,
      examWrongCount: 0,
      examRightCount: 0,
    })
  })

  it('returns the stored stat for a seen word', () => {
    const progress: Progress = { abandon: { weight: 2, wrongCount: 3, rightCount: 1 } }
    expect(getStat(progress, 'abandon')).toEqual({
      weight: 2,
      wrongCount: 3,
      rightCount: 1,
      examWrongCount: 0,
      examRightCount: 0,
    })
  })

  it('normalizes progress saved before the exam feature existed', () => {
    const legacy: Progress = { budget: { weight: 4, wrongCount: 1, rightCount: 2 } }
    const stat = getStat(legacy, 'budget')
    expect(stat.examWrongCount).toBe(0)
    expect(stat.examRightCount).toBe(0)
  })
})

describe('markRight', () => {
  it('halves the weight and increments rightCount', () => {
    const next = markRight({}, 'budget')
    expect(getStat(next, 'budget')).toEqual({
      weight: INITIAL_WEIGHT / 2,
      wrongCount: 0,
      rightCount: 1,
      examWrongCount: 0,
      examRightCount: 0,
    })
  })

  it('does not lower the weight below MIN_WEIGHT', () => {
    let progress: Progress = {}
    for (let i = 0; i < 10; i++) progress = markRight(progress, 'budget')
    expect(getStat(progress, 'budget').weight).toBe(MIN_WEIGHT)
    expect(getStat(progress, 'budget').rightCount).toBe(10)
  })

  it('does not mutate the previous progress object', () => {
    const before: Progress = { budget: { weight: 8, wrongCount: 0, rightCount: 0 } }
    markRight(before, 'budget')
    expect(before.budget.weight).toBe(8)
  })
})

describe('markWrong', () => {
  it('doubles the weight and increments wrongCount', () => {
    const next = markWrong({}, 'invoice')
    expect(getStat(next, 'invoice')).toEqual({
      weight: INITIAL_WEIGHT * 2,
      wrongCount: 1,
      rightCount: 0,
      examWrongCount: 0,
      examRightCount: 0,
    })
  })

  it('does not raise the weight above MAX_WEIGHT', () => {
    let progress: Progress = {}
    for (let i = 0; i < 10; i++) progress = markWrong(progress, 'invoice')
    expect(getStat(progress, 'invoice').weight).toBe(MAX_WEIGHT)
    expect(getStat(progress, 'invoice').wrongCount).toBe(10)
  })
})

describe('markExamRight', () => {
  it('halves the weight and increments only examRightCount', () => {
    const progress: Progress = { ledger: { weight: 8, wrongCount: 2, rightCount: 1 } }
    const next = markExamRight(progress, 'ledger')
    expect(getStat(next, 'ledger')).toEqual({
      weight: 4,
      wrongCount: 2,
      rightCount: 1,
      examWrongCount: 0,
      examRightCount: 1,
    })
  })

  it('does not lower the weight below MIN_WEIGHT', () => {
    let progress: Progress = {}
    for (let i = 0; i < 10; i++) progress = markExamRight(progress, 'ledger')
    expect(getStat(progress, 'ledger').weight).toBe(MIN_WEIGHT)
    expect(getStat(progress, 'ledger').examRightCount).toBe(10)
  })
})

describe('markExamWrong', () => {
  it('doubles the weight and increments only examWrongCount', () => {
    const progress: Progress = { ledger: { weight: 8, wrongCount: 2, rightCount: 1 } }
    const next = markExamWrong(progress, 'ledger')
    expect(getStat(next, 'ledger')).toEqual({
      weight: 16,
      wrongCount: 2,
      rightCount: 1,
      examWrongCount: 1,
      examRightCount: 0,
    })
  })

  it('does not raise the weight above MAX_WEIGHT', () => {
    let progress: Progress = {}
    for (let i = 0; i < 10; i++) progress = markExamWrong(progress, 'ledger')
    expect(getStat(progress, 'ledger').weight).toBe(MAX_WEIGHT)
    expect(getStat(progress, 'ledger').examWrongCount).toBe(10)
  })
})

describe('pickWord', () => {
  it('never immediately repeats the excluded word', () => {
    const rng = mulberry32(42)
    const words = ['alpha', 'beta', 'gamma']
    for (let i = 0; i < 200; i++) {
      expect(pickWord(words, {}, 'beta', rng)).not.toBe('beta')
    }
  })

  it('returns the only word even when it is excluded', () => {
    expect(pickWord(['solo'], {}, 'solo', mulberry32(1))).toBe('solo')
  })

  it('picks high-weight words far more often than low-weight ones', () => {
    const rng = mulberry32(2024)
    const progress: Progress = {
      known: { weight: MIN_WEIGHT, wrongCount: 0, rightCount: 6 },
      unknown: { weight: MAX_WEIGHT, wrongCount: 6, rightCount: 0 },
    }
    const counts = { known: 0, unknown: 0 }
    for (let i = 0; i < 10_000; i++) {
      counts[pickWord(['known', 'unknown'], progress, undefined, rng) as keyof typeof counts]++
    }
    // Expected ratio is 64:1; allow generous statistical slack.
    expect(counts.unknown / counts.known).toBeGreaterThan(30)
  })

  it('throws on an empty word list', () => {
    expect(() => pickWord([], {}, undefined, mulberry32(1))).toThrow()
  })
})
