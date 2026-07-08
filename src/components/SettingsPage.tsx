import { useState } from 'react'

interface SettingsPageProps {
  onClear: () => void
}

export function SettingsPage({ onClear }: SettingsPageProps) {
  const [cleared, setCleared] = useState(false)

  const handleClear = () => {
    if (window.confirm('確定要清空所有學習紀錄嗎？此操作無法還原。')) {
      onClear()
      setCleared(true)
    }
  }

  return (
    <div className="settings-page">
      <header className="page-header">
        <h1>設定</h1>
        <p className="page-subtitle">管理你的學習資料</p>
      </header>

      <div className="settings-card">
        <h2>清除學習紀錄</h2>
        <p className="settings-desc">
          刪除所有練習與考試紀錄，所有單字的權重會重置為預設值。紀錄只存在這台裝置上。
        </p>
        <button type="button" className="danger-btn" onClick={handleClear}>
          清空所有學習紀錄
        </button>
        {cleared && <p className="settings-done">已清空，所有單字回到預設權重。</p>}
      </div>
    </div>
  )
}
