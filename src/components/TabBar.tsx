import { useEffect, useRef, useState, useMemo } from 'react'

export type Tab = 'practice' | 'exam' | 'dictionary' | 'stats' | 'settings'

interface TabBarProps {
  active: Tab
  onChange: (tab: Tab, options?: { smooth?: boolean }) => void
  progress: number
}

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  {
    id: 'practice',
    label: '練習',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3" y="5" width="18" height="14" rx="3" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="m8.5 12.5 2.5 2.5 4.5-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 'exam',
    label: '考試',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 2L2 7l10 5 10-5-10-5z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M2 17l10 5 10-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M2 12l10 5 10-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 'dictionary',
    label: '字典',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 4.5A2.5 2.5 0 0 1 7.5 2H19v17H7.5A2.5 2.5 0 0 0 5 21.5z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M5 19a2.5 2.5 0 0 1 2.5-2.5H19" fill="none" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
  },
  {
    id: 'stats',
    label: '統計',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="4" y="14" width="4" height="6" rx="1" fill="none" stroke="currentColor" strokeWidth="2" />
        <rect x="10" y="9" width="4" height="11" rx="1" fill="none" stroke="currentColor" strokeWidth="2" />
        <rect x="16" y="4" width="4" height="16" rx="1" fill="none" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
  },
  {
    id: 'settings',
    label: '設定',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="3.2" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M12 2.8v3M12 18.2v3M2.8 12h3M18.2 12h3M5.5 5.5l2.1 2.1M16.4 16.4l2.1 2.1M18.5 5.5l-2.1 2.1M7.6 16.4l-2.1 2.1" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
]

export function TabBar({ active, onChange, progress }: TabBarProps) {
  const navRef = useRef<HTMLElement>(null)
  const [buttonRects, setButtonRects] = useState<{ left: number; width: number }[]>([])
  const [jellyTab, setJellyTab] = useState<Tab | null>(null)
  const [isScrolled, setIsScrolled] = useState(false)
  const [draggingProgress, setDraggingProgress] = useState<number | null>(null)
  const lastTouchX = useRef<number | null>(null)
  const [stretch, setStretch] = useState({ leftOffset: 0, widthOffset: 0 })

  useEffect(() => {
    const nav = navRef.current
    if (!nav) return
    const update = () => {
      const buttons = Array.from(nav.querySelectorAll<HTMLButtonElement>('button[data-tab-id]'))
      const rects = buttons.map(btn => ({
        left: btn.offsetLeft,
        width: btn.offsetWidth
      }))
      setButtonRects(rects)
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  const indicatorStyle = useMemo(() => {
    if (buttonRects.length === 0) return { left: 0, width: 0, opacity: 0 }
    const activeProgress = draggingProgress !== null ? draggingProgress : progress
    const p = Math.max(0, Math.min(activeProgress, buttonRects.length - 1))
    const i = Math.floor(p)
    const j = Math.min(i + 1, buttonRects.length - 1)
    const ratio = p - i
    
    let left = buttonRects[i].left + (buttonRects[j].left - buttonRects[i].left) * ratio
    let width = buttonRects[i].width + (buttonRects[j].width - buttonRects[i].width) * ratio
    
    if (draggingProgress !== null) {
      left += stretch.leftOffset
      width += stretch.widthOffset
    }
    
    return { left, width, opacity: 1 }
  }, [progress, draggingProgress, stretch, buttonRects])

  const lastScrollY = useRef(0)
  const scrollUpAccumulator = useRef(0)

  useEffect(() => {
    const handleScroll = (e: Event) => {
      const target = e.target as HTMLElement
      if (target && target.classList && target.classList.contains('page-slide')) {
        const currentScrollY = target.scrollTop
        if (currentScrollY <= 10) {
          setIsScrolled(false)
          scrollUpAccumulator.current = 0
        } else {
          const delta = currentScrollY - lastScrollY.current
          if (delta > 0) {
            setIsScrolled(true)
            scrollUpAccumulator.current = 0
          } else if (delta < 0) {
            scrollUpAccumulator.current += Math.abs(delta)
            if (scrollUpAccumulator.current > 20) {
              setIsScrolled(false)
            }
          }
        }
        lastScrollY.current = currentScrollY
      }
    }
    
    window.addEventListener('scroll', handleScroll, { capture: true, passive: true })
    return () => window.removeEventListener('scroll', handleScroll, { capture: true })
  }, [])

  const getProgressFromX = (x: number): number => {
    if (buttonRects.length === 0) return 0
    const centers = buttonRects.map(r => r.left + r.width / 2)
    if (x <= centers[0]) return 0
    if (x >= centers[centers.length - 1]) return centers.length - 1
    
    for (let k = 0; k < centers.length - 1; k++) {
      if (x >= centers[k] && x <= centers[k + 1]) {
        const ratio = (x - centers[k]) / (centers[k + 1] - centers[k])
        return k + ratio
      }
    }
    return 0
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    const nav = navRef.current
    if (!nav) return
    const rect = nav.getBoundingClientRect()
    const touch = e.touches[0]
    const relativeX = touch.clientX - rect.left
    
    lastTouchX.current = touch.clientX
    setDraggingProgress(getProgressFromX(relativeX))
    setStretch({ leftOffset: 0, widthOffset: 0 })
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    const nav = navRef.current
    if (!nav) return
    const rect = nav.getBoundingClientRect()
    const touch = e.touches[0]
    const relativeX = touch.clientX - rect.left
    
    if (lastTouchX.current !== null) {
      const dx = touch.clientX - lastTouchX.current
      const maxStretch = 30
      const stretchAmt = Math.max(-maxStretch, Math.min(maxStretch, dx * 1.2))
      
      setStretch(prev => {
        const currentLeftOffset = stretchAmt < 0 ? stretchAmt : 0
        const currentWidthOffset = Math.abs(stretchAmt)
        return {
          leftOffset: prev.leftOffset * 0.6 + currentLeftOffset * 0.4,
          widthOffset: prev.widthOffset * 0.6 + currentWidthOffset * 0.4
        }
      })
    }
    
    lastTouchX.current = touch.clientX
    setDraggingProgress(getProgressFromX(relativeX))
  }

  const handleTouchEnd = () => {
    if (draggingProgress !== null) {
      const closestIndex = Math.round(draggingProgress)
      const targetTab = TABS[closestIndex]?.id
      if (targetTab) {
        onChange(targetTab, { smooth: false })
      }
    }
    setDraggingProgress(null)
    lastTouchX.current = null
    setStretch({ leftOffset: 0, widthOffset: 0 })
  }

  return (
    <nav
      className={`tabbar ${isScrolled ? 'shrunk' : ''}`}
      ref={navRef}
      aria-label="主選單"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div className="tabbar-indicator" style={indicatorStyle} aria-hidden="true" />
      {TABS.map((tab) => (
        <button
          key={tab.id}
          data-tab-id={tab.id}
          type="button"
          className={jellyTab === tab.id ? 'jelly' : undefined}
          onClick={() => {
            onChange(tab.id, { smooth: true })
            setJellyTab(tab.id)
          }}
          onAnimationEnd={() => setJellyTab((t) => (t === tab.id ? null : t))}
          aria-current={active === tab.id ? 'page' : undefined}
        >
          {tab.icon}
          <span>{tab.label}</span>
        </button>
      ))}
    </nav>
  )
}
