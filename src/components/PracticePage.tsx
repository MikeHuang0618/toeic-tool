import { useEffect, useRef, useState, type FormEvent } from 'react'
import { WORD_LIST, WORD_MAP } from '../data/words'
import { getStat, pickWord, type Progress } from '../lib/scheduler'
import { isMeaningCorrect } from '../lib/answer'
import {
  AnswerFeedback,
  CORRECT_FEEDBACK_MS,
  WRONG_FEEDBACK_MS,
  type FeedbackKind,
} from './AnswerFeedback'

interface PracticePageProps {
  progress: Progress
  onAnswer: (word: string, remembered: boolean) => void
}

export function PracticePage({ progress, onAnswer }: PracticePageProps) {
  const [current, setCurrent] = useState(() =>
    WORD_LIST.length > 0 ? pickWord(WORD_LIST, progress) : null,
  )
  const [revealed, setRevealed] = useState(false)
  const [input, setInput] = useState('')
  const [feedback, setFeedback] = useState<FeedbackKind | null>(null)
  const timerRef = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(timerRef.current), [])

  if (current === null) {
    return <p className="empty-state">沒有可練習的單字。</p>
  }

  const entry = WORD_MAP.get(current)!
  const stat = getStat(progress, current)

  const nextWord = () => {
    // The just-answered word is excluded from the next pick, so using the
    // pre-answer weights here gives the same distribution.
    setCurrent(pickWord(WORD_LIST, progress, current))
    setRevealed(false)
    setInput('')
    setFeedback(null)
  }

  const skip = () => {
    if (feedback !== null) return
    onAnswer(current, false)
    nextWord()
  }

  const confirm = (event: FormEvent) => {
    event.preventDefault()
    if (feedback !== null || input.trim() === '') return
    const correct = isMeaningCorrect(input, entry.zh)
    onAnswer(current, correct)
    setFeedback(correct ? 'correct' : 'wrong')
    timerRef.current = window.setTimeout(
      nextWord,
      correct ? CORRECT_FEEDBACK_MS : WRONG_FEEDBACK_MS,
    )
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

      <form className="answer-form" onSubmit={confirm}>
        <input
          type="text"
          className="answer-input"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="輸入中文意思"
          aria-label="輸入中文意思"
          autoComplete="off"
          enterKeyHint="done"
          disabled={feedback !== null}
        />
        <div className="answer-row">
          <button
            type="button"
            className="answer-btn no"
            onClick={skip}
            disabled={feedback !== null}
          >
            <span className="answer-mark" aria-hidden="true">✗</span>
            不記得
          </button>
          <button
            type="submit"
            className="answer-btn yes"
            disabled={feedback !== null || input.trim() === ''}
          >
            <span className="answer-mark" aria-hidden="true">✓</span>
            確認
          </button>
        </div>
      </form>

      {feedback !== null && <AnswerFeedback kind={feedback} answer={entry.zh} />}
    </div>
  )
}
