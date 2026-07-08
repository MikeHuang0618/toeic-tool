import { useState, useRef, useEffect } from 'react'
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
  const [progress, setProgress] = useState<Progress>(loadProgress)
  const [scrollProgress, setScrollProgress] = useState(0)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

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

  const handleTabChange = (newTab: Tab, options?: { smooth?: boolean }) => {
    const targetIndex = TABS_ORDER.indexOf(newTab)
    const container = scrollContainerRef.current
    if (container) {
      const width = container.offsetWidth
      if (width > 0) {
        const isSmooth = options?.smooth !== false
        if (!isSmooth) {
          setScrollProgress(targetIndex)
        }
        setTab(newTab)
        container.scrollTo({
          left: targetIndex * width,
          behavior: isSmooth ? 'smooth' : 'auto'
        })
      }
    }
  }

  const handleScroll = () => {
    const container = scrollContainerRef.current
    if (!container) return
    const width = container.offsetWidth
    if (width === 0) return
    const currentProgress = container.scrollLeft / width
    setScrollProgress(currentProgress)

    const roundedIndex = Math.round(currentProgress)
    const nextTab = TABS_ORDER[roundedIndex]
    if (nextTab && nextTab !== tab) {
      setTab(nextTab)
    }
  }

  // Set initial scroll offset once the container mounts
  useEffect(() => {
    const container = scrollContainerRef.current
    if (container) {
      const index = TABS_ORDER.indexOf('practice')
      container.scrollLeft = index * container.offsetWidth
      setScrollProgress(index)
    }
  }, [])

  return (
    <>
      <main className="page">
        <div
          className="page-scroll-container"
          ref={scrollContainerRef}
          onScroll={handleScroll}
        >
          {TABS_ORDER.map((tabId) => (
            <div key={tabId} className="page-slide" data-tab-id={tabId}>
              {tabId === 'practice' && (
                <PracticePage progress={progress} onAnswer={handleAnswer} />
              )}
              {tabId === 'exam' && (
                <ExamPage progress={progress} onAnswer={handleExamAnswer} />
              )}
              {tabId === 'dictionary' && (
                <DictionaryPage progress={progress} isActive={tab === 'dictionary'} />
              )}
              {tabId === 'stats' && (
                <StatsPage progress={progress} />
              )}
              {tabId === 'settings' && (
                <SettingsPage onClear={handleClearProgress} />
              )}
            </div>
          ))}
        </div>
      </main>
      <TabBar active={tab} onChange={handleTabChange} progress={scrollProgress} />
    </>
  )
}
