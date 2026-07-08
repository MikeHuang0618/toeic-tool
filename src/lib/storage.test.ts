import { beforeEach, describe, expect, it } from 'vitest'
import { loadProgress, saveProgress } from './storage'
import type { Progress } from './scheduler'

beforeEach(() => {
  localStorage.clear()
})

describe('storage', () => {
  it('round-trips progress through localStorage', () => {
    const progress: Progress = {
      abandon: { weight: 16, wrongCount: 2, rightCount: 1 },
      budget: { weight: 1, wrongCount: 0, rightCount: 5 },
    }
    saveProgress(progress)
    expect(loadProgress()).toEqual(progress)
  })

  it('returns empty progress when nothing is stored', () => {
    expect(loadProgress()).toEqual({})
  })

  it('returns empty progress when stored data is corrupt', () => {
    localStorage.setItem('toeic-progress-v1', '{not json')
    expect(loadProgress()).toEqual({})
  })

  it('returns empty progress when stored data is not an object', () => {
    localStorage.setItem('toeic-progress-v1', '"a string"')
    expect(loadProgress()).toEqual({})
  })
})
