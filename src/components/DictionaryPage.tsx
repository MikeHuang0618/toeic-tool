import { useMemo, useState } from 'react'
import { WORDS, type WordEntry } from '../data/words'
import { getStat, type Progress } from '../lib/scheduler'

interface DictionaryPageProps {
  progress: Progress
}

function groupByLetter(entries: WordEntry[]): Map<string, WordEntry[]> {
  const groups = new Map<string, WordEntry[]>()
  for (const entry of entries) {
    const letter = entry.word[0].normalize('NFD')[0].toUpperCase()
    const group = groups.get(letter)
    if (group) group.push(entry)
    else groups.set(letter, [entry])
  }
  return groups
}

export function DictionaryPage({ progress }: DictionaryPageProps) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return WORDS
    return WORDS.filter(
      (entry) => entry.word.toLowerCase().includes(q) || entry.zh.includes(query.trim()),
    )
  }, [query])

  const groups = useMemo(() => groupByLetter(filtered), [filtered])

  const jumpTo = (letter: string) => {
    document.getElementById(`dict-${letter}`)?.scrollIntoView({ block: 'start' })
  }

  return (
    <div className="dictionary">
      <header className="page-header">
        <h1>字典</h1>
      </header>
      <div className="dict-search-wrap">
        <input
          type="search"
          className="dict-search"
          placeholder={`搜尋 ${WORDS.length} 個單字或中文`}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          aria-label="搜尋單字"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="empty-state">查無符合「{query.trim()}」的單字。</p>
      ) : (
        [...groups.entries()].map(([letter, entries]) => (
          <section key={letter} id={`dict-${letter}`} className="dict-section">
            <h2>{letter}</h2>
            <ul>
              {entries.map((entry) => {
                const { wrongCount } = getStat(progress, entry.word)
                return (
                  <li key={entry.word}>
                    <div className="dict-entry">
                      <span className="dict-word">
                        {entry.word} <span className="dict-pos">{entry.pos}</span>
                      </span>
                      <span className="dict-zh">{entry.zh}</span>
                    </div>
                    {wrongCount > 0 && (
                      <span className="dict-miss" aria-label={`不記得 ${wrongCount} 次`}>
                        ✗ {wrongCount}
                      </span>
                    )}
                  </li>
                )
              })}
            </ul>
          </section>
        ))
      )}

      {!query.trim() && (
        <nav className="letter-rail" aria-label="字母索引">
          {[...groups.keys()].map((letter) => (
            <button key={letter} type="button" onClick={() => jumpTo(letter)}>
              {letter}
            </button>
          ))}
        </nav>
      )}
    </div>
  )
}
