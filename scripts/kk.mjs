// ARPABET（CMU 發音字典）→ KK 音標轉換。
// KK 慣例：FACE=e、GOAT=o、非重音 AH=ə、ER=ɚ/ɝ、字尾非重音 IY=ɪ、
// 單音節字不標重音、重音符號標在音節開頭（依最大節首原則切音節）。

const VOWELS = {
  AA: 'ɑ',
  AE: 'æ',
  AH: 'ʌ',
  AO: 'ɔ',
  AW: 'aʊ',
  AY: 'aɪ',
  EH: 'ɛ',
  ER: 'ɝ',
  EY: 'e',
  IH: 'ɪ',
  IY: 'i',
  OW: 'o',
  OY: 'ɔɪ',
  UH: 'ʊ',
  UW: 'u',
}

const CONSONANTS = {
  B: 'b',
  CH: 'tʃ',
  D: 'd',
  DH: 'ð',
  F: 'f',
  G: 'ɡ',
  HH: 'h',
  JH: 'dʒ',
  K: 'k',
  L: 'l',
  M: 'm',
  N: 'n',
  NG: 'ŋ',
  P: 'p',
  R: 'r',
  S: 's',
  SH: 'ʃ',
  T: 't',
  TH: 'θ',
  V: 'v',
  W: 'w',
  Y: 'j',
  Z: 'z',
  ZH: 'ʒ',
}

// 合法英語節首（ARPABET，空白分隔）。單一子音（NG 除外）一律合法。
const ONSET_CLUSTERS = new Set([
  'P R', 'B R', 'T R', 'D R', 'K R', 'G R', 'F R', 'TH R', 'SH R',
  'P L', 'B L', 'K L', 'G L', 'F L', 'S L',
  'S P', 'S T', 'S K', 'S M', 'S N', 'S F', 'S W',
  'T W', 'D W', 'K W', 'G W', 'HH W', 'TH W',
  'P Y', 'B Y', 'T Y', 'D Y', 'K Y', 'G Y', 'F Y', 'V Y',
  'M Y', 'N Y', 'HH Y', 'L Y', 'S Y', 'Z Y', 'TH Y',
  'S P R', 'S P L', 'S T R', 'S K R', 'S K W', 'S K Y', 'S P Y', 'S T Y',
])

function isLegalOnset(cluster) {
  if (cluster.length === 0) return true
  if (cluster.length === 1) return cluster[0] !== 'NG'
  return ONSET_CLUSTERS.has(cluster.join(' '))
}

function parsePhone(raw) {
  const match = raw.match(/^([A-Z]+)([0-2])?$/)
  if (!match) throw new Error(`unknown ARPABET phone: ${raw}`)
  const [, phone, stress] = match
  if (!(phone in VOWELS) && !(phone in CONSONANTS)) {
    throw new Error(`unknown ARPABET phone: ${raw}`)
  }
  return { phone, stress: stress === undefined ? null : Number(stress) }
}

/** 將音素序列切成音節：[{ onset, vowel, coda, stress }]。 */
function syllabify(phones) {
  const syllables = []
  let pending = [] // 尚未分配的子音
  for (const p of phones) {
    if (p.stress === null) {
      pending.push(p.phone)
      continue
    }
    if (syllables.length === 0) {
      syllables.push({ onset: pending, vowel: p, coda: [] })
    } else {
      // 兩母音之間的子音群：最長合法節首歸下一音節，其餘作前一音節的節尾。
      let split = Math.max(0, pending.length - 3)
      while (split < pending.length && !isLegalOnset(pending.slice(split))) {
        split++
      }
      const prev = syllables[syllables.length - 1]
      prev.coda = pending.slice(0, split)
      syllables.push({ onset: pending.slice(split), vowel: p, coda: [] })
    }
    pending = []
  }
  if (syllables.length === 0) throw new Error('no vowel found')
  syllables[syllables.length - 1].coda = pending
  return syllables
}

function vowelToKK(vowel, isFinalPhone) {
  const { phone, stress } = vowel
  if (phone === 'AH' && stress === 0) return 'ə'
  if (phone === 'ER') return stress === 0 ? 'ɚ' : 'ɝ'
  if (phone === 'IY' && stress === 0 && isFinalPhone) return 'ɪ'
  return VOWELS[phone]
}

/**
 * 將一個 ARPABET 發音字串轉成 KK 音標。
 * @param {string} arpabet 例如 "AH0 B AE1 N D AH0 N"
 * @returns {string} 例如 "əˈbændən"
 */
export function arpabetToKK(arpabet) {
  const phones = arpabet.trim().split(/\s+/).map(parsePhone)
  const syllables = syllabify(phones)
  const multi = syllables.length > 1

  return syllables
    .map((syl, index) => {
      const isLast = index === syllables.length - 1
      const stressMark =
        multi && syl.vowel.stress === 1 ? 'ˈ' : multi && syl.vowel.stress === 2 ? 'ˌ' : ''
      const onset = syl.onset.map((c) => CONSONANTS[c]).join('')
      const coda = syl.coda.map((c) => CONSONANTS[c]).join('')
      const vowel = vowelToKK(syl.vowel, isLast && syl.coda.length === 0)
      return stressMark + onset + vowel + coda
    })
    .join('')
}

/**
 * 將單字或片語（空白分隔）轉成 KK 音標；任一 token 查不到回傳 null。
 * @param {string} text
 * @param {{ [word: string]: string }} dict word → ARPABET
 * @returns {string | null}
 */
export function toKK(text, dict) {
  const tokens = text.toLowerCase().split(/\s+/).filter(Boolean)
  const parts = []
  for (const token of tokens) {
    const arpabet = dict[token]
    if (!arpabet) return null
    parts.push(arpabetToKK(arpabet))
  }
  return parts.join(' ')
}
