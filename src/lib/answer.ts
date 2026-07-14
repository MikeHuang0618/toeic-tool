// 判斷使用者輸入的中文是否符合字典釋義。
// 釋義格式如「放棄；拋棄」「會計（學）」「報到；辦理登機／入住」。

const normalize = (text: string): string => text.replace(/\s+/g, '')

const stripParens = (text: string): string =>
  text.replace(/（[^）]*）/g, '').replace(/\([^)]*\)/g, '')

export function acceptedMeanings(zh: string): string[] {
  const accepted = new Set<string>()
  const add = (candidate: string) => {
    for (const variant of [candidate, stripParens(candidate)]) {
      const normalized = normalize(variant)
      if (normalized) accepted.add(normalized)
    }
  }

  add(zh)
  for (const meaning of zh.split(/[；;]/)) {
    add(meaning)
    for (const alternative of meaning.split(/[／/]/)) {
      add(alternative)
    }
  }
  return [...accepted]
}

export function isMeaningCorrect(input: string, zh: string): boolean {
  const normalized = normalize(input)
  if (!normalized) return false
  return acceptedMeanings(zh).includes(normalized)
}
