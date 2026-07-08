import { useEffect, useRef, useState } from 'react'

export type Tab = 'practice' | 'exam' | 'dictionary' | 'stats' | 'settings'

interface TabBarProps {
  active: Tab
  onChange: (tab: Tab) => void
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

export function TabBar({ active, onChange }: TabBarProps) {
  const navRef = useRef<HTMLElement>(null)
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0, opacity: 0 })
  const [jellyTab, setJellyTab] = useState<Tab | null>(null)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const nav = navRef.current
    if (!nav) return
    const update = () => {
      const activeBtn = nav.querySelector<HTMLButtonElement>('button[aria-current="page"]')
      if (activeBtn) {
        setIndicatorStyle({ left: activeBtn.offsetLeft, width: activeBtn.offsetWidth, opacity: 1 })
      }
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [active])

  const lastScrollY = useRef(0)
  const scrollUpAccumulator = useRef(0)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      
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
    
    lastScrollY.current = window.scrollY
    
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav className={`tabbar ${isScrolled ? 'shrunk' : ''}`} ref={navRef} aria-label="主選單">
      <div className="tabbar-indicator" style={indicatorStyle} aria-hidden="true" />
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={jellyTab === tab.id ? 'jelly' : undefined}
          onClick={() => {
            onChange(tab.id)
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
