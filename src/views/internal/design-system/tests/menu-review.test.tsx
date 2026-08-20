import { fireEvent, render, screen } from '@testing-library/react'
import { Copy, ExternalLink, Trash2 } from 'lucide-react'
import { describe, expect, it, vi } from 'vitest'

import {
  Menu,
  MenuContent,
  MenuItem,
  MenuLinkItem,
  MenuSeparator,
  MenuTrigger,
} from '@/components/design-system-v1/menu'
import {
  popupItemGeometry,
  popupItemTypography,
} from '@/components/design-system-v1/popup-item-geometry'
import {
  PopupChevron,
  popupTriggerPadding,
} from '@/components/design-system-v1/popup-chevron'
import tailwindConfig from '../../../../../tailwind.config'
import MenuStateSheet from '../menu-state-sheet'

const MenuHarness = ({ onCopy = vi.fn() }: { onCopy?: () => void }) => (
  <Menu defaultOpen>
    <MenuTrigger>Actions</MenuTrigger>
    <MenuContent>
      <MenuItem leadingIcon={<Copy />} onSelect={onCopy}>
        Copy address
      </MenuItem>
      <MenuLinkItem
        href="https://etherscan.io"
        trailingVisual={<ExternalLink />}
      >
        View on explorer
      </MenuLinkItem>
      <MenuItem disabled>Unavailable action</MenuItem>
      <MenuSeparator />
      <MenuItem tone="destructive" leadingIcon={<Trash2 />}>
        Remove resource
      </MenuItem>
    </MenuContent>
  </Menu>
)

describe('V1 Menu candidate', () => {
  it('registers the accepted motion durations as consumable Tailwind tokens', () => {
    expect(tailwindConfig.theme.extend.transitionDuration).toEqual({
      120: '120ms',
      180: '180ms',
      240: '240ms',
    })
  })

  it('shares one open-state chevron treatment with other popup triggers', () => {
    render(
      <Menu>
        <MenuTrigger asChild>
          <button type="button">
            Links
            <PopupChevron />
          </button>
        </MenuTrigger>
        <MenuContent>
          <MenuItem>Website</MenuItem>
        </MenuContent>
      </Menu>
    )

    expect(screen.getByRole('button', { name: 'Links' })).toHaveClass('group')
    expect(document.querySelector('[data-slot="popup-chevron"]')).toHaveClass(
      'group-data-[state=open]:rotate-180',
      'duration-120',
      'motion-reduce:transition-none'
    )
  })

  it('keeps compact text and chevron triggers optically balanced', () => {
    expect(popupTriggerPadding.compactText).toBe('pl-3.5 pr-2.5')

    render(<MenuStateSheet />)
    expect(screen.getByRole('button', { name: 'Links' })).toHaveClass(
      'pl-3.5',
      'pr-2.5'
    )
  })

  it('uses the accepted popup geometry without inheriting Select semantics', async () => {
    render(<MenuHarness />)

    const copy = await screen.findByRole('menuitem', { name: 'Copy address' })
    const popup = screen.getByRole('menu')
    const separator = screen.getByRole('separator')

    expect(popup).toHaveClass('rounded-lg', popupItemGeometry.popupInset)
    expect(copy).toHaveClass(
      popupItemGeometry.itemInset,
      popupItemTypography.singleLine,
      'rounded',
      'data-[highlighted]:bg-foreground/5'
    )
    expect(separator).toHaveClass('-mx-2', 'my-1')
    expect(separator).not.toHaveClass('mx-0', 'mx-3')
    expect(screen.queryByRole('option')).not.toBeInTheDocument()
  })

  it('supports optional leading and trailing visuals on stable axes', async () => {
    render(<MenuHarness />)

    const copy = await screen.findByRole('menuitem', { name: 'Copy address' })
    const explorer = screen.getByRole('menuitem', {
      name: 'View on explorer',
    })

    expect(copy.querySelector('[data-slot="menu-leading-visual"]')).toHaveClass(
      '[&>svg]:size-4'
    )
    expect(
      explorer.querySelector('[data-slot="menu-trailing-visual"]')
    ).toHaveClass('ml-auto', '[&>svg]:size-4')
    expect(explorer).toHaveAttribute('href', 'https://etherscan.io')
  })

  it('activates ordinary actions while retaining disabled and destructive semantics', async () => {
    const onCopy = vi.fn()
    render(<MenuHarness onCopy={onCopy} />)

    const copy = await screen.findByRole('menuitem', { name: 'Copy address' })
    const disabled = screen.getByRole('menuitem', {
      name: 'Unavailable action',
    })
    const destructive = screen.getByRole('menuitem', {
      name: 'Remove resource',
    })

    fireEvent.click(copy)

    expect(onCopy).toHaveBeenCalledOnce()
    expect(disabled).toHaveAttribute('data-disabled')
    expect(destructive).toHaveAttribute('data-tone', 'destructive')
    expect(destructive).toHaveClass('text-destructive')
  })
})
