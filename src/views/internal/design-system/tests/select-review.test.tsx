import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/design-system-v1/select'
import {
  popupItemGeometry,
  popupItemTypography,
} from '@/components/design-system-v1/popup-item-geometry'
import {
  popupTriggerGap,
  popupTriggerPadding,
} from '@/components/design-system-v1/popup-chevron'
import SelectStateSheet from '../select-state-sheet'

const SelectHarness = () => {
  return (
    <Select defaultValue="all" defaultOpen>
      <SelectTrigger aria-label="Created">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All time</SelectItem>
        <SelectItem value="24h">Last 24 hours</SelectItem>
        <SelectItem value="legacy" disabled>
          Legacy range
        </SelectItem>
      </SelectContent>
    </Select>
  )
}

describe('V1 Select candidate', () => {
  it('uses the accepted control geometry and retains bounded-value semantics', async () => {
    render(<SelectHarness />)

    const trigger = document.querySelector('[role="combobox"]')
    const disabledOption = await screen.findByRole('option', {
      name: 'Legacy range',
    })
    const selectedOption = screen.getByRole('option', { name: 'All time' })

    expect(trigger).toBeInstanceOf(HTMLButtonElement)
    expect(trigger).toHaveClass(
      'group',
      'h-11',
      'rounded-full',
      popupTriggerGap.default,
      popupTriggerPadding.defaultText
    )
    expect(trigger?.querySelector('[data-slot="popup-chevron"]')).toHaveClass(
      'group-data-[state=open]:rotate-180'
    )
    expect(selectedOption).toHaveClass(
      popupItemGeometry.itemInset,
      popupItemTypography.singleLine,
      'rounded',
      'pr-10',
      'focus:bg-foreground/5',
      'data-[highlighted]:bg-foreground/5'
    )
    expect(selectedOption).not.toHaveClass('rounded-lg')
    expect(selectedOption).not.toHaveClass('focus:bg-muted')
    expect(selectedOption.querySelector('.absolute')).toHaveClass('right-3')
    expect(document.querySelector('[data-radix-select-viewport]')).toHaveClass(
      popupItemGeometry.popupInset
    )
    expect(disabledOption).toHaveAttribute('data-disabled')
    expect(screen.getByRole('listbox')).toBeVisible()
  })

  it('keeps an optional leading visual attached to the submitted label', async () => {
    render(
      <Select defaultValue="base" defaultOpen>
        <SelectTrigger aria-label="Chain">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem
            value="base"
            textValue="Base"
            leadingVisual={<svg data-testid="chain-mark" />}
          >
            Base
          </SelectItem>
        </SelectContent>
      </Select>
    )

    const option = await screen.findByRole('option', { name: 'Base' })

    const leadingVisual = option.querySelector(
      '[data-slot="select-leading-visual"]'
    )

    expect(leadingVisual).toHaveClass('[&>svg]:size-4')
    expect(
      leadingVisual?.querySelector('[data-testid="chain-mark"]')
    ).toBeInTheDocument()
    expect(screen.getAllByTestId('chain-mark')).toHaveLength(2)
    expect(document.querySelector('[role="combobox"]')).toHaveTextContent(
      'Base'
    )
  })

  it('uses compact geometry only when explicitly requested', () => {
    render(
      <Select defaultValue="25">
        <SelectTrigger size="compact" aria-label="Rows per page">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="25">25</SelectItem>
        </SelectContent>
      </Select>
    )

    expect(screen.getByRole('combobox', { name: 'Rows per page' })).toHaveClass(
      'h-8',
      'pl-3.5',
      'pr-2.5',
      'rounded-full'
    )
  })

  it('keeps the evidenced dense pagination trigger at its fixed width', () => {
    render(<SelectStateSheet />)

    expect(screen.getByRole('combobox', { name: 'Rows per page' })).toHaveClass(
      'w-[70px]',
      'pl-3.5',
      'pr-2.5'
    )
  })
})
