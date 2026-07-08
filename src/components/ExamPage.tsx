import { useState } from 'react'
import { WORD_LIST, WORD_MAP } from '../data/words'
import { getStat, pickWord, type Progress } from '../lib/scheduler'

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
    setState('playing')
  }

  const handleAnswer = (remembered: boolean) => {
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
      </div>

      <div className="answer-row">
        <button type="button" className="answer-btn no" onClick={() => handleAnswer(false)}>
          <span className="answer-mark" aria-hidden="true">✗</span>
          不記得
        </button>
        <button type="button" className="answer-btn yes" onClick={() => handleAnswer(true)}>
          <span className="answer-mark" aria-hidden="true">✓</span>
          記得
        </button>
      </div>
    </div>
  )
}
