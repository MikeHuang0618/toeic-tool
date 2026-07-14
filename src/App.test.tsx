import { beforeEach, describe, expect, it, vi } from 'vitest'
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'
import { WORD_MAP } from './data/words'
import { acceptedMeanings } from './lib/answer'

beforeEach(() => {
  localStorage.clear()
})

describe('App', () => {
  it('starts on the practice page with a hidden meaning', () => {
    render(<App />)
    expect(screen.getByTestId('practice-word').textContent).not.toBe('')
    expect(screen.getByText('點一下顯示中文')).toBeInTheDocument()
  })

  it('reveals the Chinese meaning when the card is tapped', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: /顯示中文$/ }))
    expect(screen.queryByText('點一下顯示中文')).not.toBeInTheDocument()
  })

  it('moves to a different word after a correct typed answer', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    try {
      const user = userEvent.setup({ advanceTimers: (ms) => vi.advanceTimersByTime(ms) })
      render(<App />)
      const before = screen.getByTestId('practice-word').textContent!

      const meaning = acceptedMeanings(WORD_MAP.get(before)!.zh)[0]
      await user.type(screen.getByRole('textbox', { name: '輸入中文意思' }), meaning)
      await user.click(screen.getByRole('button', { name: '確認' }))

      expect(screen.getByRole('status')).toHaveTextContent('答對了')
      await act(async () => {
        vi.advanceTimersByTime(5000)
      })
      expect(screen.getByTestId('practice-word').textContent).not.toBe(before)
    } finally {
      vi.useRealTimers()
    }
  })

  it('marks a word as forgotten and shows the miss count in the dictionary', async () => {
    const user = userEvent.setup()
    render(<App />)

    const word = screen.getByTestId('practice-word').textContent!
    await user.click(screen.getByRole('button', { name: '不記得' }))

    await user.click(screen.getByRole('button', { name: '字典' }))
    await user.type(screen.getByRole('searchbox'), word)
    expect(screen.getByLabelText('不記得 1 次')).toBeInTheDocument()
  })

  it('persists progress across app restarts', async () => {
    const user = userEvent.setup()
    const { unmount } = render(<App />)
    const word = screen.getByTestId('practice-word').textContent!
    await user.click(screen.getByRole('button', { name: '不記得' }))
    unmount()

    render(<App />)
    await user.click(screen.getByRole('button', { name: '字典' }))
    await user.type(screen.getByRole('searchbox'), word)
    expect(screen.getByLabelText('不記得 1 次')).toBeInTheDocument()
  })
})
