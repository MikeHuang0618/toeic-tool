import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PracticePage } from './PracticePage'
import { WORD_MAP } from '../data/words'
import { acceptedMeanings } from '../lib/answer'

const WRONG_INPUT = '絕對不會匹配的答案'

const correctAnswerFor = (word: string) => acceptedMeanings(WORD_MAP.get(word)!.zh)[0]

describe('PracticePage answer input', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  const setup = () => {
    const onAnswer = vi.fn()
    render(<PracticePage progress={{}} onAnswer={onAnswer} />)
    const user = userEvent.setup({ advanceTimers: (ms) => vi.advanceTimersByTime(ms) })
    return { user, onAnswer }
  }

  const input = () => screen.getByRole('textbox', { name: '輸入中文意思' })
  const confirmBtn = () => screen.getByRole('button', { name: '確認' })

  it('renders a Chinese input with a 確認 button instead of 記得', () => {
    setup()
    expect(input()).toBeInTheDocument()
    expect(confirmBtn()).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '記得' })).not.toBeInTheDocument()
  })

  it('shows the KK phonetics on the word card', () => {
    setup()
    const word = screen.getByTestId('practice-word').textContent!
    expect(screen.getByText(`[${WORD_MAP.get(word)!.kk}]`)).toBeInTheDocument()
  })

  it('disables 確認 while the input is empty', async () => {
    const { user } = setup()
    expect(confirmBtn()).toBeDisabled()
    await user.type(input(), '意思')
    expect(confirmBtn()).toBeEnabled()
  })

  it('celebrates a correct answer then moves to the next word', async () => {
    const { user, onAnswer } = setup()
    const word = screen.getByTestId('practice-word').textContent!

    await user.type(input(), correctAnswerFor(word))
    await user.click(confirmBtn())

    expect(screen.getByRole('status')).toHaveTextContent('答對了')
    expect(onAnswer).toHaveBeenCalledExactlyOnceWith(word, true)

    await act(async () => {
      vi.advanceTimersByTime(5000)
    })
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    expect(screen.getByTestId('practice-word').textContent).not.toBe(word)
    expect(input()).toHaveValue('')
  })

  it('shows disappointment and the correct meaning after a wrong answer', async () => {
    const { user, onAnswer } = setup()
    const word = screen.getByTestId('practice-word').textContent!
    const zh = WORD_MAP.get(word)!.zh

    await user.type(input(), WRONG_INPUT)
    await user.click(confirmBtn())

    const status = screen.getByRole('status')
    expect(status).toHaveTextContent('答錯了')
    expect(status).toHaveTextContent(zh)
    expect(onAnswer).toHaveBeenCalledExactlyOnceWith(word, false)

    await act(async () => {
      vi.advanceTimersByTime(5000)
    })
    expect(screen.getByTestId('practice-word').textContent).not.toBe(word)
  })

  it('blocks further answers while feedback is showing', async () => {
    const { user, onAnswer } = setup()
    const word = screen.getByTestId('practice-word').textContent!

    await user.type(input(), correctAnswerFor(word))
    await user.click(confirmBtn())
    await user.click(confirmBtn())
    await user.click(screen.getByRole('button', { name: '不記得' }))

    expect(onAnswer).toHaveBeenCalledTimes(1)
  })

  it('submits the answer with the Enter key', async () => {
    const { user, onAnswer } = setup()
    const word = screen.getByTestId('practice-word').textContent!

    await user.type(input(), `${correctAnswerFor(word)}{enter}`)

    expect(screen.getByRole('status')).toHaveTextContent('答對了')
    expect(onAnswer).toHaveBeenCalledExactlyOnceWith(word, true)
  })

  it('keeps 不記得 as an immediate skip', async () => {
    const { user, onAnswer } = setup()
    const word = screen.getByTestId('practice-word').textContent!

    await user.click(screen.getByRole('button', { name: '不記得' }))

    expect(onAnswer).toHaveBeenCalledExactlyOnceWith(word, false)
    expect(screen.getByTestId('practice-word').textContent).not.toBe(word)
  })
})
