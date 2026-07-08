export type Tab = 'practice' | 'dictionary' | 'stats'

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
]

export function TabBar({ active, onChange }: TabBarProps) {
  return (
    <nav className="tabbar" aria-label="主選單">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          aria-current={active === tab.id ? 'page' : undefined}
        >
          {tab.icon}
          <span>{tab.label}</span>
        </button>
      ))}
    </nav>
  )
}
