import wordsAB from './words-a-b.json'
import wordsC from './words-c.json'
import wordsDF from './words-d-f.json'
import wordsGL from './words-g-l.json'
import wordsMO from './words-m-o.json'
import wordsPR from './words-p-r.json'
import wordsSZ from './words-s-z.json'

export interface WordEntry {
  word: string
  pos: string
  zh: string
}

export const WORDS: WordEntry[] = [
  ...wordsAB,
  ...wordsC,
  ...wordsDF,
  ...wordsGL,
  ...wordsMO,
  ...wordsPR,
  ...wordsSZ,
].sort((a, b) => a.word.localeCompare(b.word, 'en'))

export const WORD_LIST: string[] = WORDS.map((entry) => entry.word)
