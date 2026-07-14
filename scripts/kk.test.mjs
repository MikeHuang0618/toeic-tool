import { describe, expect, it } from 'vitest'
import { dictionary } from 'cmu-pronouncing-dictionary'
import { arpabetToKK, toKK } from './kk.mjs'

describe('arpabetToKK', () => {
  it('converts a simple word with schwa and primary stress', () => {
    // abandon
    expect(arpabetToKK('AH0 B AE1 N D AH0 N')).toBe('əˈbændən')
  })

  it('omits the stress mark on monosyllables', () => {
    // book
    expect(arpabetToKK('B UH1 K')).toBe('bʊk')
  })

  it('uses KK e/o for the FACE/GOAT vowels', () => {
    // able
    expect(arpabetToKK('EY1 B AH0 L')).toBe('ˈebəl')
    // notice
    expect(arpabetToKK('N OW1 T AH0 S')).toBe('ˈnotəs')
  })

  it('writes word-final unstressed IY as ɪ', () => {
    // ability
    expect(arpabetToKK('AH0 B IH1 L AH0 T IY0')).toBe('əˈbɪlətɪ')
  })

  it('keeps non-final IY as i', () => {
    // create
    expect(arpabetToKK('K R IY0 EY1 T')).toBe('kriˈet')
  })

  it('distinguishes stressed ɝ from unstressed ɚ', () => {
    // computer
    expect(arpabetToKK('K AH0 M P Y UW1 T ER0')).toBe('kəmˈpjutɚ')
    // urgent
    expect(arpabetToKK('ER1 JH AH0 N T')).toBe('ˈɝdʒənt')
  })

  it('splits consonant clusters by maximal legal onset', () => {
    // accept: k closes the first syllable, s opens the second
    expect(arpabetToKK('AH0 K S EH1 P T')).toBe('əkˈsɛpt')
    // extra: str is a legal onset
    expect(arpabetToKK('EH1 K S T R AH0')).toBe('ˈɛkstrə')
  })

  it('marks secondary stress with ˌ', () => {
    // interview
    expect(arpabetToKK('IH1 N T ER0 V Y UW2')).toBe('ˈɪntɚˌvju')
  })

  it('converts affricates and digraph consonants', () => {
    // schedule
    expect(arpabetToKK('S K EH1 JH UH0 L')).toBe('ˈskɛdʒʊl')
    // change
    expect(arpabetToKK('CH EY1 N JH')).toBe('tʃendʒ')
  })
})

describe('toKK', () => {
  it('looks a word up in the CMU dictionary', () => {
    expect(toKK('abandon', dictionary)).toBe('əˈbændən')
  })

  it('joins phrase tokens with spaces', () => {
    expect(toKK('check in', dictionary)).toBe('tʃɛk ɪn')
  })

  it('returns null when any token is missing', () => {
    expect(toKK('zzzznotaword', dictionary)).toBeNull()
    expect(toKK('check zzzznotaword', dictionary)).toBeNull()
  })
})
