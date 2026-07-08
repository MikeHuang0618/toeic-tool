import { useState } from 'react'
import { WORD_LIST, WORD_MAP } from '../data/words'
import { getStat, pickWord, type Progress } from '../lib/scheduler'

interface PracticePageProps {
  progress: Progress
  onAnswer: (word: string, remembered: boolean) => void
}

export function PracticePage({ progress, onAnswer }: PracticePageProps) {
  const [current, setCurrent] = useState(() =>
    WORD_LIST.length > 0 ? pickWord(WORD_LIST, progress) : null,
  )
  const [revealed, setRevealed] = useState(false)

  if (current === null) {
    return <p className="empty-state">沒有可練習的單字。</p>
  }

  const entry = WORD_MAP.get(current)!
  const stat = getStat(progress, current)

  const answer = (remembered: boolean) => {
    onAnswer(current, remembered)
    // The just-answered word is excluded from the next pick, so using the
    // pre-answer weights here gives the same distribution.
    setCurrent(pickWord(WORD_LIST, progress, current))
    setRevealed(false)
  }

  return (
    <div className="practice">
      <header className="page-header">
        <h1>練習</h1>
        <p className="page-subtitle">共 {WORD_LIST.length} 字 · 點卡片看中文</p>
      </header>

      <button
        type="button"
        className="word-card"
        onClick={() => setRevealed((r) => !r)}
        aria-label={revealed ? `${current}，隱藏中文` : `${current}，顯示中文`}
      >
        <span className="word-pos">{entry.pos}</span>
        <span className="word-text" data-testid="practice-word">
          {current}
        </span>
        {revealed ? (
          <span className="word-zh">{entry.zh}</span>
        ) : (
          <span className="word-hint">點一下顯示中文</span>
        )}
        {revealed && stat.wrongCount > 0 && (
          <span className="word-miss">✗ 不記得 {stat.wrongCount} 次</span>
        )}
      </button>

      <div className="answer-row">
        <button type="button" className="answer-btn no" onClick={() => answer(false)}>
          <span className="answer-mark" aria-hidden="true">✗</span>
          不記得
        </button>
        <button type="button" className="answer-btn yes" onClick={() => answer(true)}>
          <span className="answer-mark" aria-hidden="true">✓</span>
          記得
        </button>
      </div>
    </div>
  )
}
