import { useState } from 'react'
import { TabBar, type Tab } from './components/TabBar'
import { PracticePage } from './components/PracticePage'
import { DictionaryPage } from './components/DictionaryPage'
import { StatsPage } from './components/StatsPage'
import { ExamPage } from './components/ExamPage'
import { SettingsPage } from './components/SettingsPage'
import { markRight, markWrong, markExamRight, markExamWrong, type Progress } from './lib/scheduler'
import { loadProgress, saveProgress, clearStorage } from './lib/storage'

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

  const handleExamAnswer = (word: string, remembered: boolean) => {
    setProgress((prev) => {
      const next = remembered ? markExamRight(prev, word) : markExamWrong(prev, word)
      saveProgress(next)
      return next
    })
  }

  const handleClearProgress = () => {
    clearStorage()
    setProgress({})
  }

  return (
    <>
      <main className="page">
        {tab === 'practice' && (
          <PracticePage progress={progress} onAnswer={handleAnswer} />
        )}
        {tab === 'exam' && (
          <ExamPage progress={progress} onAnswer={handleExamAnswer} />
        )}
        {tab === 'dictionary' && (
          <DictionaryPage progress={progress} />
        )}
        {tab === 'stats' && (
          <StatsPage progress={progress} />
        )}
        {tab === 'settings' && (
          <SettingsPage onClear={handleClearProgress} />
        )}
      </main>
      <TabBar active={tab} onChange={setTab} />
    </>
  )
}
