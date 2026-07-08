import { useState } from 'react'
import { TabBar, type Tab } from './components/TabBar'
import { PracticePage } from './components/PracticePage'
import { DictionaryPage } from './components/DictionaryPage'
import { StatsPage } from './components/StatsPage'
import { markRight, markWrong, type Progress } from './lib/scheduler'
import { loadProgress, saveProgress } from './lib/storage'

export default function App() {
  const [tab, setTab] = useState<Tab>('practice')
  const [progress, setProgress] = useState<Progress>(loadProgress)

  const handleAnswer = (word: string, remembered: boolean) => {
    setProgress((prev) => {
      const next = remembered ? markRight(prev, word) : markWrong(prev, word)
      saveProgress(next)
      return next
    })
  }

  return (
    <>
      <main className="page">
        {tab === 'practice' && (
          <PracticePage progress={progress} onAnswer={handleAnswer} />
        )}
        {tab === 'dictionary' && (
          <DictionaryPage progress={progress} />
        )}
        {tab === 'stats' && (
          <StatsPage progress={progress} />
        )}
      </main>
      <TabBar active={tab} onChange={setTab} />
    </>
  )
}
