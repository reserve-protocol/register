import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'

import { SearchField } from '@/components/design-system-v1/search-field'

const ClearableSearch = () => {
  const [value, setValue] = useState('ethereum')

  return (
    <SearchField
      aria-label="Search DTFs"
      value={value}
      onChange={(event) => setValue(event.target.value)}
      onClear={() => setValue('')}
    />
  )
}

describe('V1 SearchField candidate', () => {
  it('inherits the canonical TextInput geometry and search semantics', () => {
    render(<SearchField aria-label="Search DTFs" placeholder="Search" />)

    const input = screen.getByRole('searchbox', { name: 'Search DTFs' })
    const control = screen.getByTestId('canonical-text-input')

    expect(control).toHaveClass('h-11', 'rounded-full')
    expect(input).toHaveAttribute('type', 'search')
    expect(control.querySelector('svg')?.parentElement).toHaveClass(
      '[&>svg]:size-4'
    )
  })

  it('clears a controlled query and returns focus to search', () => {
    render(<ClearableSearch />)

    const input = screen.getByRole('searchbox', { name: 'Search DTFs' })
    fireEvent.click(screen.getByRole('button', { name: 'Clear search' }))

    expect(input).toHaveValue('')
    expect(input).toHaveFocus()
  })

  it('replaces clear with a non-interactive loading indicator', () => {
    render(
      <SearchField
        aria-label="Search DTFs"
        value="ethereum"
        onChange={() => undefined}
        onClear={() => undefined}
        loading
      />
    )

    const input = screen.getByRole('searchbox', { name: 'Search DTFs' })
    expect(input).toHaveAttribute('aria-busy', 'true')
    expect(
      screen.queryByRole('button', { name: 'Clear search' })
    ).not.toBeInTheDocument()
  })
})
