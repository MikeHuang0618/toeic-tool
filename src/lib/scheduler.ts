export interface WordStat {
  weight: number
  wrongCount: number
  rightCount: number
}

export type Progress = Record<string, WordStat>

export const INITIAL_WEIGHT = 8
export const MIN_WEIGHT = 1
export const MAX_WEIGHT = 64

export function getStat(progress: Progress, word: string): WordStat {
  return progress[word] ?? { weight: INITIAL_WEIGHT, wrongCount: 0, rightCount: 0 }
}

export function markRight(progress: Progress, word: string): Progress {
  const stat = getStat(progress, word)
  return {
    ...progress,
    [word]: {
      ...stat,
      weight: Math.max(MIN_WEIGHT, stat.weight / 2),
      rightCount: stat.rightCount + 1,
    },
  }
}

export function markWrong(progress: Progress, word: string): Progress {
  const stat = getStat(progress, word)
  return {
    ...progress,
    [word]: {
      ...stat,
      weight: Math.min(MAX_WEIGHT, stat.weight * 2),
      wrongCount: stat.wrongCount + 1,
    },
  }
}

export function pickWord(
  words: string[],
  progress: Progress,
  exclude?: string,
  rng: () => number = Math.random,
): string {
  if (words.length === 0) throw new Error('pickWord: word list is empty')
  if (words.length === 1) return words[0]

  const cumulative: number[] = new Array(words.length)
  let total = 0
  for (let i = 0; i < words.length; i++) {
    const weight = words[i] === exclude ? 0 : getStat(progress, words[i]).weight
    total += weight
    cumulative[i] = total
  }

  const target = rng() * total
  let lo = 0
  let hi = words.length - 1
  while (lo < hi) {
    const mid = (lo + hi) >> 1
    if (cumulative[mid] > target) hi = mid
    else lo = mid + 1
  }
  return words[lo]
}
