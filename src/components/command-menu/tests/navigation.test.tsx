import { render, screen } from '@/test-utils'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import CommandMenu from '..'

window.HTMLElement.prototype.scrollIntoView = vi.fn()

vi.mock('@/components/icons/ChainLogo', () => ({
  default: () => <span data-testid="chain-logo" />,
}))

vi.mock('@/components/token-logo', () => ({
  default: () => <span data-testid="token-logo" />,
}))

vi.mock('@/hooks/useIndexDTFList', () => ({
  default: () => ({
    data: [
      {
        address: '0xTarget',
        brand: { icon: '' },
        chainId: 8453,
        name: 'Target DTF',
        symbol: 'TARGET',
      },
    ],
  }),
}))

vi.mock('@/hooks/useTokenList', () => ({
  default: () => ({ list: [] }),
}))

const CurrentPath = () => {
  const { pathname } = useLocation()
  return <output data-testid="current-path">{pathname}</output>
}

describe('CommandMenu DTF navigation', () => {
  it.each([
    [
      '/ethereum/index-dtf/0xcurrent/governance/proposal/42',
      '/base/index-dtf/0xtarget/governance',
    ],
    [
      '/ethereum/index-dtf/0xcurrent/auctions/rebalance/7',
      '/base/index-dtf/0xtarget/auctions',
    ],
  ])(
    'keeps the top-level DTF section when switching from %s',
    async (currentPath, expectedPath) => {
      const user = userEvent.setup()

      render(
        <MemoryRouter initialEntries={[currentPath]}>
          <CommandMenu />
          <CurrentPath />
        </MemoryRouter>
      )

      await user.click(screen.getByRole('button', { name: 'Search' }))
      await user.click(await screen.findByText('Target DTF'))

      expect(screen.getByTestId('current-path')).toHaveTextContent(expectedPath)
    }
  )
})
