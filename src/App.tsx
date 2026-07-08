import { useState, useRef } from 'react'
import { TabBar, type Tab } from './components/TabBar'
import { PracticePage } from './components/PracticePage'
import { DictionaryPage } from './components/DictionaryPage'
import { StatsPage } from './components/StatsPage'
import { ExamPage } from './components/ExamPage'
import { SettingsPage } from './components/SettingsPage'
import { markRight, markWrong, markExamRight, markExamWrong, type Progress } from './lib/scheduler'
import { loadProgress, saveProgress, clearStorage } from './lib/storage'

const TABS_ORDER: Tab[] = ['practice', 'exam', 'dictionary', 'stats', 'settings']

export default function App() {
  const [tab, setTab] = useState<Tab>('practice')
  const [prevTab, setPrevTab] = useState<Tab>('practice')
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

  const handleTabChange = (newTab: Tab) => {
    if (newTab === tab) return
    setPrevTab(tab)
    setTab(newTab)
  }

  // Touch swipe gesture navigation
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    const target = e.target as HTMLElement
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable ||
      target.closest('.exam-slider')
    ) {
      return
    }

    const diffX = e.changedTouches[0].clientX - touchStartX.current
    const diffY = e.changedTouches[0].clientY - touchStartY.current

    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 60) {
      const currentIndex = TABS_ORDER.indexOf(tab)
      if (diffX < 0) {
        if (currentIndex < TABS_ORDER.length - 1) {
          handleTabChange(TABS_ORDER[currentIndex + 1])
        }
      } else {
        if (currentIndex > 0) {
          handleTabChange(TABS_ORDER[currentIndex - 1])
        }
      }
    }
  }

  const tabIndex = TABS_ORDER.indexOf(tab)
  const prevIndex = TABS_ORDER.indexOf(prevTab)
  const animClass = tabIndex >= prevIndex ? 'slide-from-right' : 'slide-from-left'

  return (
    <>
      <main
        className="page"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div key={tab} className={`page-transition-wrap ${animClass}`}>
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
        </div>
      </main>
      <TabBar active={tab} onChange={handleTabChange} />
    </>
  )
}
