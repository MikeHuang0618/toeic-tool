import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ExamPage } from './ExamPage'
import { WORD_MAP } from '../data/words'
import { acceptedMeanings } from '../lib/answer'

const WRONG_INPUT = '絕對不會匹配的答案'

const correctAnswerFor = (word: string) => acceptedMeanings(WORD_MAP.get(word)!.zh)[0]

describe('ExamPage', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  const setupUser = () =>
    userEvent.setup({ advanceTimers: (ms) => vi.advanceTimersByTime(ms) })

  const input = () => screen.getByRole('textbox', { name: '輸入中文意思' })
  const confirmBtn = () => screen.getByRole('button', { name: '確認' })

  /** 作答目前題目並等待回饋動畫結束，回傳該題單字。 */
  const answerCurrent = async (user: ReturnType<typeof setupUser>, correct: boolean) => {
    const word = screen.getByTestId('exam-word').textContent!
    await user.type(input(), correct ? correctAnswerFor(word) : WRONG_INPUT)
    await user.click(confirmBtn())
    await act(async () => {
      vi.advanceTimersByTime(5000)
    })
    return word
  }

  it('starts on the setup screen with an adjustable question count', () => {
    render(<ExamPage progress={{}} onAnswer={() => {}} />)
    expect(screen.getByText('20 題')).toBeInTheDocument()
    fireEvent.change(screen.getByRole('slider'), { target: { value: '50' } })
    expect(screen.getByText('50 題')).toBeInTheDocument()
  })

  it('shows an answer input with a 確認 button instead of 記得', async () => {
    const user = setupUser()
    render(<ExamPage progress={{}} onAnswer={() => {}} />)

    fireEvent.change(screen.getByRole('slider'), { target: { value: '10' } })
    await user.click(screen.getByRole('button', { name: '開始挑戰' }))

    expect(input()).toBeInTheDocument()
    expect(confirmBtn()).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '記得' })).not.toBeInTheDocument()
  })

  it('celebrates a typed correct answer and adds score', async () => {
    const user = setupUser()
    render(<ExamPage progress={{}} onAnswer={() => {}} />)

    fireEvent.change(screen.getByRole('slider'), { target: { value: '10' } })
    await user.click(screen.getByRole('button', { name: '開始挑戰' }))

    const word = screen.getByTestId('exam-word').textContent!
    await user.type(input(), correctAnswerFor(word))
    await user.click(confirmBtn())

    // Fresh words carry INITIAL_WEIGHT 8 → 8 × 10 × 1.0 combo multiplier.
    expect(screen.getByRole('status')).toHaveTextContent('答對了')
    expect(screen.getByText('+80')).toBeInTheDocument()

    await act(async () => {
      vi.advanceTimersByTime(5000)
    })
    expect(screen.getByText('第 2 / 10 題')).toBeInTheDocument()
  })

  it('shows the correct meaning and breaks the combo on a wrong typed answer', async () => {
    const user = setupUser()
    render(<ExamPage progress={{}} onAnswer={() => {}} />)

    fireEvent.change(screen.getByRole('slider'), { target: { value: '10' } })
    await user.click(screen.getByRole('button', { name: '開始挑戰' }))

    await answerCurrent(user, true)

    const word = screen.getByTestId('exam-word').textContent!
    const zh = WORD_MAP.get(word)!.zh
    await user.type(input(), WRONG_INPUT)
    await user.click(confirmBtn())

    const status = screen.getByRole('status')
    expect(status).toHaveTextContent('答錯了')
    expect(status).toHaveTextContent(zh)
    expect(screen.getByText('Combo Break!')).toBeInTheDocument()

    await act(async () => {
      vi.advanceTimersByTime(5000)
    })
    expect(screen.getByText('第 3 / 10 題')).toBeInTheDocument()
  })

  it('runs through all questions by typing answers and shows the summary', async () => {
    const user = setupUser()
    const onAnswer = vi.fn()
    render(<ExamPage progress={{}} onAnswer={onAnswer} />)

    fireEvent.change(screen.getByRole('slider'), { target: { value: '10' } })
    await user.click(screen.getByRole('button', { name: '開始挑戰' }))

    for (let i = 0; i < 10; i++) {
      expect(screen.getByText(`第 ${i + 1} / 10 題`)).toBeInTheDocument()
      await answerCurrent(user, true)
    }

    expect(onAnswer).toHaveBeenCalledTimes(10)
    expect(onAnswer).toHaveBeenLastCalledWith(expect.any(String), true)
    expect(screen.getByText('結算')).toBeInTheDocument()
    expect(screen.getByText('10/10')).toBeInTheDocument()
    expect(screen.getAllByText('✓ 記得')).toHaveLength(10)
  })

  it('reviews every question with its right/wrong mark and can restart', async () => {
    const user = setupUser()
    render(<ExamPage progress={{}} onAnswer={() => {}} />)

    fireEvent.change(screen.getByRole('slider'), { target: { value: '10' } })
    await user.click(screen.getByRole('button', { name: '開始挑戰' }))

    const missed = screen.getByTestId('exam-word').textContent!
    await answerCurrent(user, false)
    for (let i = 0; i < 9; i++) {
      await answerCurrent(user, true)
    }

    expect(screen.getByText('全部題目')).toBeInTheDocument()
    expect(screen.getByText('9/10')).toBeInTheDocument()
    expect(screen.getAllByText('✓ 記得')).toHaveLength(9)
    expect(screen.getAllByText('✗ 不記得')).toHaveLength(1)
    // The missed word is the first row and carries the wrong mark.
    const firstRow = screen.getAllByRole('listitem')[0]
    expect(firstRow.textContent).toContain(missed)
    expect(firstRow.textContent).toContain('✗ 不記得')

    await user.click(screen.getByRole('button', { name: '再次挑戰' }))
    expect(screen.getByRole('button', { name: '開始挑戰' })).toBeInTheDocument()
  })

  it('keeps 不記得 as an immediate skip that counts as wrong', async () => {
    const user = setupUser()
    const onAnswer = vi.fn()
    render(<ExamPage progress={{}} onAnswer={onAnswer} />)

    fireEvent.change(screen.getByRole('slider'), { target: { value: '10' } })
    await user.click(screen.getByRole('button', { name: '開始挑戰' }))

    const word = screen.getByTestId('exam-word').textContent!
    await user.click(screen.getByRole('button', { name: '不記得' }))

    expect(onAnswer).toHaveBeenCalledExactlyOnceWith(word, false)
    expect(screen.getByText('第 2 / 10 題')).toBeInTheDocument()
  })

  it('never shows the same word twice in a row', async () => {
    const user = setupUser()
    render(<ExamPage progress={{}} onAnswer={() => {}} />)

    fireEvent.change(screen.getByRole('slider'), { target: { value: '30' } })
    await user.click(screen.getByRole('button', { name: '開始挑戰' }))

    let prev = ''
    for (let i = 0; i < 30; i++) {
      const word = screen.getByTestId('exam-word').textContent!
      expect(word).not.toBe(prev)
      prev = word
      await user.click(screen.getByRole('button', { name: '不記得' }))
    }
  })
})
