import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { EntityIdentity } from '../entity-identity'

describe('EntityIdentity name leading', () => {
  it('retains ordinary title leading unless explicitly compacted', () => {
    const { rerender } = render(
      <EntityIdentity
        mark=""
        name="A long asset name"
        supporting="$ASSET"
        wrapName
      />
    )
    const name = () => screen.getByText('A long asset name')
    expect(name()).toHaveClass('leading-6')
    rerender(
      <EntityIdentity
        mark=""
        name="A long asset name"
        supporting="$ASSET"
        wrapName
        nameLeading="compact"
      />
    )
    expect(name()).toHaveClass(
      'text-base',
      'font-medium',
      'leading-5',
      'min-h-6'
    )
    expect(name()).not.toHaveClass('leading-6')
    expect(screen.getByText('$ASSET')).toHaveClass(
      'text-sm',
      'font-light',
      'leading-5'
    )
  })

  it('does not enlarge compact-density identities', () => {
    render(
      <EntityIdentity
        mark=""
        name="ASSET"
        density="compact"
        nameLeading="compact"
      />
    )
    expect(screen.getByText('ASSET')).toHaveClass('text-sm', 'leading-5')
    expect(screen.getByText('ASSET')).not.toHaveClass('min-h-6')
  })
})
