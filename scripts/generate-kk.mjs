// 為 src/data/*.json 的每個詞條加上 KK 音標欄位（kk）。
// 用法：node scripts/generate-kk.mjs
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { dictionary } from 'cmu-pronouncing-dictionary'
import { toKK } from './kk.mjs'

const dataDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'data')
const files = [
  'words-a-b.json',
  'words-c.json',
  'words-d-f.json',
  'words-g-l.json',
  'words-m-o.json',
  'words-p-r.json',
  'words-s-z.json',
  'phrases.json',
]

// CMU 查不到（重音符、連字號）或字尾 -y 重音標記與 KK 慣例不符的詞條，手動標音。
const MANUAL_KK = {
  'résumé': 'ˈrɛzəˌme',
  'round-trip ticket': 'raʊnd trɪp ˈtɪkət',
  'ability': 'əˈbɪlətɪ',
  'inquiry': 'ɪnˈkwaɪrɪ',
  'oversee': 'ˌovɚˈsi',
}

const missing = []
let total = 0

for (const file of files) {
  const path = join(dataDir, file)
  const entries = JSON.parse(readFileSync(path, 'utf8'))
  for (const entry of entries) {
    total++
    const kk = MANUAL_KK[entry.word] ?? toKK(entry.word, dictionary)
    if (kk === null) {
      missing.push(entry.word)
      delete entry.kk
    } else {
      entry.kk = kk
    }
  }
  const lines = entries.map((entry) => `  ${JSON.stringify(entry).replaceAll('","', '", "').replaceAll('":"', '": "').replace('{"', '{ "').replace('"}', '" }')}`)
  writeFileSync(path, `[\n${lines.join(',\n')}\n]\n`)
}

console.log(`total: ${total}, missing: ${missing.length}`)
if (missing.length > 0) console.log(missing.join('\n'))
