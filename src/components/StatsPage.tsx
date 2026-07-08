import { WORDS } from '../data/words'
import type { Progress } from '../lib/scheduler'
import { getStat } from '../lib/scheduler'

interface StatsPageProps {
  progress: Progress
}

export function StatsPage({ progress }: StatsPageProps) {
  // 過濾出有練習過的單字（答對或答錯至少一次）
  const practicedWords = WORDS.map((entry) => {
    const stat = getStat(progress, entry.word)
    return { ...entry, stat }
  }).filter((item) => item.stat.rightCount > 0 || item.stat.wrongCount > 0)

  // 依照權重 (weight) 由高至低排序，若權重相同則依錯誤次數由高至低
  practicedWords.sort((a, b) => {
    if (b.stat.weight !== a.stat.weight) {
      return b.stat.weight - a.stat.weight
    }
    return b.stat.wrongCount - a.stat.wrongCount
  })

  if (practicedWords.length === 0) {
    return (
      <div className="empty-state">
        <p>目前還沒有任何練習紀錄喔！</p>
        <p>去「練習」頁籤多答幾題，再來這裡看看你的學習弱點吧。</p>
      </div>
    )
  }

  return (
    <div>
      <div className="page-header">
        <h1>學習弱點統計</h1>
        <p className="page-subtitle">這裡列出你最不熟的單字，權重越高出現機率越大</p>
      </div>
      
      <ul className="stats-list">
        {practicedWords.map(({ word, pos, zh, stat }) => (
          <li key={word} className="stats-item">
            <div className="stats-main">
              <span className="stats-word">{word}</span>
              <span className="stats-pos">{pos}</span>
              <span className="stats-zh">{zh}</span>
            </div>
            <div className="stats-metrics">
              <div className="metric-badge weight" title="目前難度權重">
                難度 {stat.weight.toFixed(1)}
              </div>
              <div className="metric-badge wrong" title="累積答錯次數">
                錯 {stat.wrongCount}
              </div>
              <div className="metric-badge right" title="累積答對次數">
                對 {stat.rightCount}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
