import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ExamPage } from './ExamPage'

describe('ExamPage', () => {
  it('starts on the setup screen with an adjustable question count', () => {
    render(<ExamPage progress={{}} onAnswer={() => {}} />)
    expect(screen.getByText('20 題')).toBeInTheDocument()
    fireEvent.change(screen.getByRole('slider'), { target: { value: '50' } })
    expect(screen.getByText('50 題')).toBeInTheDocument()
  })

  it('runs through all questions and shows the summary', async () => {
    const user = userEvent.setup()
    const onAnswer = vi.fn()
    render(<ExamPage progress={{}} onAnswer={onAnswer} />)

    fireEvent.change(screen.getByRole('slider'), { target: { value: '10' } })
    await user.click(screen.getByRole('button', { name: '開始挑戰' }))

    for (let i = 0; i < 10; i++) {
      expect(screen.getByText(`第 ${i + 1} / 10 題`)).toBeInTheDocument()
      await user.click(screen.getByRole('button', { name: '記得' }))
    }

    expect(onAnswer).toHaveBeenCalledTimes(10)
    expect(onAnswer).toHaveBeenLastCalledWith(expect.any(String), true)
    expect(screen.getByText('結算')).toBeInTheDocument()
    expect(screen.getByText('10/10')).toBeInTheDocument()
    expect(screen.getAllByText('✓ 記得')).toHaveLength(10)
  })

  it('reviews every question with its right/wrong mark and can restart', async () => {
    const user = userEvent.setup()
    render(<ExamPage progress={{}} onAnswer={() => {}} />)

    fireEvent.change(screen.getByRole('slider'), { target: { value: '10' } })
    await user.click(screen.getByRole('button', { name: '開始挑戰' }))

    const missed = screen.getByTestId('exam-word').textContent!
    await user.click(screen.getByRole('button', { name: '不記得' }))
    for (let i = 0; i < 9; i++) {
      await user.click(screen.getByRole('button', { name: '記得' }))
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

  it('never shows the same word twice in a row', async () => {
    const user = userEvent.setup()
    render(<ExamPage progress={{}} onAnswer={() => {}} />)

    fireEvent.change(screen.getByRole('slider'), { target: { value: '30' } })
    await user.click(screen.getByRole('button', { name: '開始挑戰' }))

    let prev = ''
    for (let i = 0; i < 30; i++) {
      const word = screen.getByTestId('exam-word').textContent!
      expect(word).not.toBe(prev)
      prev = word
      await user.click(screen.getByRole('button', { name: '記得' }))
    }
  })
})
