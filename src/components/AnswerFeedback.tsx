import type { CSSProperties } from 'react'

export const CORRECT_FEEDBACK_MS = 1100
export const WRONG_FEEDBACK_MS = 2200

const CONFETTI_PIECES = 10

export type FeedbackKind = 'correct' | 'wrong'

interface AnswerFeedbackProps {
  kind: FeedbackKind
  /** 正確釋義，答錯時顯示給使用者看。 */
  answer: string
}

export function AnswerFeedback({ kind, answer }: AnswerFeedbackProps) {
  return (
    <div className={`answer-feedback ${kind}`} role="status">
      <div className="feedback-card">
        {kind === 'correct' && (
          <span className="feedback-confetti" aria-hidden="true">
            {Array.from({ length: CONFETTI_PIECES }, (_, i) => (
              <i key={i} style={{ '--i': i } as CSSProperties} />
            ))}
          </span>
        )}
        <span className="feedback-emoji" aria-hidden="true">
          {kind === 'correct' ? '🎉' : '😢'}
        </span>
        <span className="feedback-title">{kind === 'correct' ? '答對了！' : '答錯了'}</span>
        {kind === 'wrong' && <span className="feedback-answer">{answer}</span>}
      </div>
    </div>
  )
}
