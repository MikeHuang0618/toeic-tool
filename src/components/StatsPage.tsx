import { useMemo, useState } from 'react'
import { WORDS } from '../data/words'
import { getStat, type Progress } from '../lib/scheduler'

interface StatsPageProps {
  progress: Progress
}

type StatsTab = 'practice' | 'exam'

export function StatsPage({ progress }: StatsPageProps) {
  const [activeTab, setActiveTab] = useState<StatsTab>('practice')

  const rows = useMemo(() => {
    const filtered = WORDS.map((entry) => ({ entry, stat: getStat(progress, entry.word) })).filter(
      ({ stat }) => (activeTab === 'practice' ? stat.wrongCount > 0 : stat.examWrongCount > 0),
    )
    filtered.sort((a, b) => {
      const wrongDiff =
        activeTab === 'practice'
          ? b.stat.wrongCount - a.stat.wrongCount
          : b.stat.examWrongCount - a.stat.examWrongCount
      return wrongDiff !== 0 ? wrongDiff : b.stat.weight - a.stat.weight
    })
    return filtered
  }, [progress, activeTab])

  return (
    <div className="stats">
      <header className="page-header">
        <h1>統計</h1>
        <p className="page-subtitle">答錯過的單字，依次數排序</p>
      </header>

      <div className="stats-tabs">
        <button
          type="button"
          className={`stats-tab-btn ${activeTab === 'practice' ? 'active' : ''}`}
          onClick={() => setActiveTab('practice')}
        >
          練習
        </button>
        <button
          type="button"
          className={`stats-tab-btn ${activeTab === 'exam' ? 'active' : ''}`}
          onClick={() => setActiveTab('exam')}
        >
          考試
        </button>
      </div>

      {rows.length === 0 ? (
        <p className="empty-state">
          {activeTab === 'practice'
            ? '目前沒有練錯的單字——答錯的字會出現在這裡。'
            : '目前沒有考錯的單字——考試答錯的字會出現在這裡。'}
        </p>
      ) : (
        <ul className="stats-list">
          {rows.map(({ entry, stat }) => (
            <li key={entry.word} className="stats-item">
              <div className="stats-main">
                <span className="stats-word">
                  {entry.word} <span className="stats-pos">{entry.pos}</span>
                </span>
                <span className="stats-zh">{entry.zh}</span>
              </div>
              <div className="stats-metrics">
                <span className="metric-badge weight">難度 {stat.weight}</span>
                {activeTab === 'practice' ? (
                  <span className="metric-badge wrong">✗ {stat.wrongCount}</span>
                ) : (
                  <span className="metric-badge exam-wrong">✗ {stat.examWrongCount}</span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
