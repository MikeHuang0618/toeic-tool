import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { StatsPage } from './StatsPage'
import type { Progress } from '../lib/scheduler'

describe('StatsPage', () => {
  it('shows an empty state per tab without hiding the tab switcher', async () => {
    const user = userEvent.setup()
    const progress: Progress = { abandon: { weight: 16, wrongCount: 1, rightCount: 0 } }
    render(<StatsPage progress={progress} />)

    expect(screen.getByText('abandon')).toBeInTheDocument()

    // Switching to the exam tab with no exam records must keep the tabs
    // visible so the user can switch back.
    await user.click(screen.getByRole('button', { name: '考試' }))
    expect(screen.getByText(/沒有考錯的單字/)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '練習' }))
    expect(screen.getByText('abandon')).toBeInTheDocument()
  })

  it('hides words that were only ever answered correctly', () => {
    const progress: Progress = {
      abandon: { weight: 1, wrongCount: 0, rightCount: 5 },
      budget: { weight: 16, wrongCount: 2, rightCount: 0 },
    }
    render(<StatsPage progress={progress} />)

    expect(screen.getByText('budget')).toBeInTheDocument()
    expect(screen.queryByText('abandon')).not.toBeInTheDocument()
  })

  it('sorts practice stats by wrong count, then weight', () => {
    const progress: Progress = {
      abandon: { weight: 16, wrongCount: 1, rightCount: 0 },
      budget: { weight: 8, wrongCount: 3, rightCount: 1 },
      cabinet: { weight: 32, wrongCount: 1, rightCount: 0 },
    }
    render(<StatsPage progress={progress} />)

    const words = screen.getAllByText(/^(abandon|budget|cabinet)/).map((el) => el.textContent)
    expect(words[0]).toMatch(/budget/)
    expect(words[1]).toMatch(/cabinet/) // same wrongCount as abandon, higher weight
    expect(words[2]).toMatch(/abandon/)
  })

  it('separates exam records from practice records', async () => {
    const user = userEvent.setup()
    const progress: Progress = {
      abandon: { weight: 16, wrongCount: 1, rightCount: 0 },
      budget: { weight: 16, wrongCount: 0, rightCount: 0, examWrongCount: 2, examRightCount: 1 },
    }
    render(<StatsPage progress={progress} />)

    expect(screen.getByText('abandon')).toBeInTheDocument()
    expect(screen.queryByText('budget')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '考試' }))
    expect(screen.getByText('budget')).toBeInTheDocument()
    expect(screen.queryByText('abandon')).not.toBeInTheDocument()
    expect(screen.getByText('✗ 2')).toBeInTheDocument()
  })
})
