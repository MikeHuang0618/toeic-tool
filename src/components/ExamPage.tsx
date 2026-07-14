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

interface ExamPageProps {
  progress: Progress
  onAnswer: (word: string, remembered: boolean) => void
}

type ExamState = 'setup' | 'playing' | 'summary'

interface QuestionResult {
  word: string
  remembered: boolean
}

function comboMultiplier(combo: number): number {
  if (combo >= 20) return 2.0
  if (combo >= 10) return 1.5
  if (combo >= 5) return 1.2
  return 1.0
}

export function ExamPage({ progress, onAnswer }: ExamPageProps) {
  const [state, setState] = useState<ExamState>('setup')
  const [totalQuestions, setTotalQuestions] = useState(20)

  const [questions, setQuestions] = useState<string[]>([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [maxCombo, setMaxCombo] = useState(0)
  const [results, setResults] = useState<QuestionResult[]>([])
  const [popText, setPopText] = useState<{ text: string; id: number } | null>(null)
  const [input, setInput] = useState('')
  const [feedback, setFeedback] = useState<FeedbackKind | null>(null)
  const timerRef = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(timerRef.current), [])

  const startExam = () => {
    // Weighted draw per question (hard words show up more), never twice in a row.
    const picked: string[] = []
    let prev: string | undefined
    for (let i = 0; i < totalQuestions; i++) {
      const word = pickWord(WORD_LIST, progress, prev)
      picked.push(word)
      prev = word
    }

    setQuestions(picked)
    setCurrentIdx(0)
    setScore(0)
    setCombo(0)
    setMaxCombo(0)
    setResults([])
    setPopText(null)
    setInput('')
    setFeedback(null)
    setState('playing')
  }

  const recordAnswer = (remembered: boolean) => {
    const word = questions[currentIdx]
    const stat = getStat(progress, word)

    onAnswer(word, remembered)
    setResults((prev) => [...prev, { word, remembered }])

    if (remembered) {
      const newCombo = combo + 1
      setCombo(newCombo)
      setMaxCombo(Math.max(maxCombo, newCombo))
      const earned = Math.round(stat.weight * 10 * comboMultiplier(newCombo))
      setScore((s) => s + earned)
      setPopText({ text: `+${earned}`, id: Date.now() })
    } else {
      setCombo(0)
      setPopText({ text: 'Combo Break!', id: Date.now() })
    }
  }

  const goNext = () => {
    setInput('')
    setFeedback(null)
    if (currentIdx + 1 >= questions.length) {
      setState('summary')
    } else {
      setCurrentIdx((i) => i + 1)
    }
  }

  if (state === 'setup') {
    return (
      <div className="exam-setup">
        <header className="page-header">
          <h1>考試</h1>
          <p className="page-subtitle">連續答對累積 Combo，難字加倍計分</p>
        </header>

        <div className="exam-setup-card">
          <h2>題目數量</h2>
          <div className="slider-value">{totalQuestions} 題</div>
          <input
            type="range"
            className="exam-slider"
            min="10"
            max="100"
            step="10"
            value={totalQuestions}
            onChange={(event) => setTotalQuestions(Number(event.target.value))}
            aria-label="題目數量"
          />
          <button type="button" className="start-btn" onClick={startExam}>
            開始挑戰
          </button>
        </div>
      </div>
    )
  }

  if (state === 'summary') {
    const rightTotal = results.filter((r) => r.remembered).length
    return (
      <div className="exam-summary">
        <header className="page-header">
          <h1>結算</h1>
          <p className="page-subtitle">共 {results.length} 題</p>
        </header>
        <div className="summary-card">
          <div className="summary-score">
            <span className="summary-label">總分</span>
            <span className="summary-value">{score.toLocaleString()}</span>
          </div>
          <div className="summary-score">
            <span className="summary-label">答對</span>
            <span className="summary-value">
              {rightTotal}/{results.length}
            </span>
          </div>
          <div className="summary-combo">
            <span className="summary-label">最大連擊</span>
            <span className="summary-value">🔥 {maxCombo}</span>
          </div>
        </div>

        <section className="exam-review">
          <h2>全部題目</h2>
          <ul className="stats-list">
            {results.map(({ word, remembered }, index) => {
              const entry = WORD_MAP.get(word)!
              return (
                <li key={`${word}-${index}`} className="stats-item">
                  <div className="stats-main">
                    <span className="stats-word">
                      {entry.word} <span className="stats-pos">{entry.pos}</span>
                    </span>
                    <span className="stats-zh">{entry.zh}</span>
                  </div>
                  {remembered ? (
                    <span className="metric-badge right">✓ 記得</span>
                  ) : (
                    <span className="metric-badge wrong">✗ 不記得</span>
                  )}
                </li>
              )
            })}
          </ul>
        </section>

        <button type="button" className="start-btn mt-4" onClick={() => setState('setup')}>
          再次挑戰
        </button>
      </div>
    )
  }

  const currentWord = questions[currentIdx]
  const entry = WORD_MAP.get(currentWord)!

  const skip = () => {
    if (feedback !== null) return
    recordAnswer(false)
    goNext()
  }

  const confirm = (event: FormEvent) => {
    event.preventDefault()
    if (feedback !== null || input.trim() === '') return
    const correct = isMeaningCorrect(input, entry.zh)
    recordAnswer(correct)
    setFeedback(correct ? 'correct' : 'wrong')
    timerRef.current = window.setTimeout(
      goNext,
      correct ? CORRECT_FEEDBACK_MS : WRONG_FEEDBACK_MS,
    )
  }

  return (
    <div className="exam-playing">
      <header className="exam-header">
        <div className="exam-progress">
          第 {currentIdx + 1} / {questions.length} 題
        </div>
        <div className="exam-scoreboard">
          <div className="exam-score">{score.toLocaleString()}</div>
          <div className={`exam-combo ${combo > 0 ? 'active' : ''}`}>
            🔥 x{combo} <span className="combo-multi">({comboMultiplier(combo)}x)</span>
          </div>
          {popText && (
            <div key={popText.id} className="score-pop" aria-hidden="true">
              {popText.text}
            </div>
          )}
        </div>
      </header>

      <div className="word-card exam-card">
        <span className="word-pos">{entry.pos}</span>
        <span className="word-text" data-testid="exam-word">
          {currentWord}
        </span>
        {entry.kk && <span className="word-kk">[{entry.kk}]</span>}
      </div>

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
