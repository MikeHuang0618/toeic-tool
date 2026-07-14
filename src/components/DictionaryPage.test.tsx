import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DictionaryPage } from './DictionaryPage'

describe('DictionaryPage', () => {
  it('filters by English substring', async () => {
    const user = userEvent.setup()
    render(<DictionaryPage progress={{}} />)
    await user.type(screen.getByRole('searchbox'), 'abandon')
    expect(screen.getByText('放棄；拋棄')).toBeInTheDocument()
  })

  it('filters by Chinese meaning', async () => {
    const user = userEvent.setup()
    render(<DictionaryPage progress={{}} />)
    await user.type(screen.getByRole('searchbox'), '會計師')
    expect(screen.getByText(/accountant/)).toBeInTheDocument()
  })

  it('shows the KK phonetics for each entry', async () => {
    const user = userEvent.setup()
    render(<DictionaryPage progress={{}} />)
    await user.type(screen.getByRole('searchbox'), 'abandon')
    expect(screen.getByText('[əˈbændən]')).toBeInTheDocument()
  })

  it('shows an empty state when nothing matches', async () => {
    const user = userEvent.setup()
    render(<DictionaryPage progress={{}} />)
    await user.type(screen.getByRole('searchbox'), 'zzzzzz')
    expect(screen.getByText(/查無符合/)).toBeInTheDocument()
  })

  it('shows the wrong-count badge from progress', async () => {
    const user = userEvent.setup()
    render(
      <DictionaryPage
        progress={{ abandon: { weight: 16, wrongCount: 3, rightCount: 0 } }}
      />,
    )
    await user.type(screen.getByRole('searchbox'), 'abandon')
    expect(screen.getByLabelText('不記得 3 次')).toBeInTheDocument()
  })

  it('hides the letter rail while searching', async () => {
    const user = userEvent.setup()
    render(<DictionaryPage progress={{}} />)
    expect(screen.getByRole('navigation', { name: '字母索引' })).toBeInTheDocument()
    await user.type(screen.getByRole('searchbox'), 'abandon')
    expect(screen.queryByRole('navigation', { name: '字母索引' })).not.toBeInTheDocument()
  })
})
