import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import {
  MultiSelectFilter,
  type MultiSelectFilterOption,
} from '@/components/design-system-v1/multi-select-filter'
import {
  popupItemGeometry,
  popupItemTypography,
} from '@/components/design-system-v1/popup-item-geometry'
import { popupTriggerGap } from '@/components/design-system-v1/popup-chevron'

const OPTIONS: readonly MultiSelectFilterOption[] = [
  {
    value: '1',
    label: 'Ethereum',
    leadingVisual: <svg data-testid="chain-mark" />,
  },
  { value: '8453', label: 'Base' },
  { value: '56', label: 'BNB Smart Chain' },
]

describe('V1 MultiSelectFilter candidate', () => {
  it('stages checkbox selection until Apply and uses canonical geometry', async () => {
    const onApply = vi.fn()

    render(
      <MultiSelectFilter
        accessibleLabel="Filter by network"
        options={OPTIONS}
        selected={['8453']}
        onApply={onApply}
        triggerContent="1 network"
      />
    )

    const trigger = screen.getByRole('button', { name: 'Filter by network' })
    expect(trigger).toHaveClass(
      'group',
      'h-11',
      'rounded-full',
      'text-base',
      'font-light',
      popupTriggerGap.default
    )
    expect(trigger.querySelector('[data-slot="popup-chevron"]')).toHaveClass(
      'group-data-[state=open]:rotate-180'
    )

    fireEvent.click(trigger)
    const ethereum = await screen.findByRole('checkbox', { name: 'Ethereum' })
    const optionRow = ethereum.closest('label')
    const popup = optionRow?.closest(
      '[data-radix-popper-content-wrapper]'
    )?.firstElementChild
    const actionGroup = screen.getByTestId('canonical-action-group')

    expect(optionRow).toHaveClass(
      popupItemGeometry.itemInset,
      popupItemTypography.singleLine,
      'rounded',
      'gap-2',
      'hover:bg-foreground/5'
    )
    expect(optionRow?.parentElement).toHaveClass(popupItemGeometry.popupInset)
    expect(
      optionRow?.querySelector('[data-slot="multi-select-leading-visual"]')
    ).toHaveClass('size-5', '[&>svg]:size-5')
    expect(ethereum).toHaveClass(popupItemGeometry.rowCheckboxCompensation)
    expect(optionRow?.lastElementChild).toBe(ethereum)
    expect(popup).toHaveClass('w-72', 'rounded-lg')
    expect(actionGroup).toHaveClass(
      'gap-2',
      'justify-end',
      'px-5',
      'pb-5',
      'pt-2'
    )
    expect(actionGroup).not.toHaveClass('border-t')
    expect(actionGroup.firstElementChild).toHaveTextContent('Clear')
    expect(actionGroup.lastElementChild).toHaveTextContent('Apply')
    expect(actionGroup.firstElementChild).toHaveAttribute(
      'data-tone',
      'secondary'
    )
    expect(actionGroup.lastElementChild).toHaveAttribute('data-tone', 'primary')

    fireEvent.click(ethereum)
    expect(onApply).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: 'Apply' }))
    expect(onApply).toHaveBeenCalledWith(['8453', '1'])
  })

  it('supports clearing when empty selection means all options', async () => {
    const onApply = vi.fn()

    render(
      <MultiSelectFilter
        accessibleLabel="Filter by network"
        options={OPTIONS}
        selected={['8453', '56']}
        onApply={onApply}
        triggerContent="2 networks"
      />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Filter by network' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Clear' }))
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }))

    expect(onApply).toHaveBeenCalledWith([])
  })

  it('protects an evidenced minimum-selection requirement', async () => {
    render(
      <MultiSelectFilter
        accessibleLabel="Filter by network"
        minSelected={1}
        options={OPTIONS}
        selected={['8453']}
        onApply={vi.fn()}
        triggerContent="1 network"
      />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Filter by network' }))

    expect(await screen.findByRole('checkbox', { name: 'Base' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Clear' })).toBeDisabled()
  })
})
