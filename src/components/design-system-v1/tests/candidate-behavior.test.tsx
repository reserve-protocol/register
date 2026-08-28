import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { act, useState } from 'react'
import { MemoryRouter, Link as RouterLink, useLocation } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { Button } from '@/components/button'
import { EmptyState } from '@/components/empty-state'
import { LifecycleStatusPill } from '@/components/lifecycle-status'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../accordion'
import { CopyableValue } from '../copyable-value'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../collapsible'
import { disclosurePresentation } from '../disclosure-presentation'
import { FieldDescription, FieldLabel, FieldMessage, TextArea } from '../field'
import {
  InlineMessage,
  InlineMessageActions,
  InlineMessageDescription,
  InlineMessageTitle,
} from '../inline-message'
import { Link } from '../link'
import { Skeleton, Spinner } from '../loading'
import { Pagination } from '../pagination'
import { SegmentedControl, SegmentedControlItem } from '../segmented-control'
import { Switch } from '../switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../tabs'
import { tooltipSurfaceRecipe } from '../tooltip-surface'
import { v1Typography } from '../typography'

afterEach(() => {
  vi.useRealTimers()
})

describe('provisional design-system candidates', () => {
  it('keeps accepted typography roles consumable by shared candidates', () => {
    expect(v1Typography).toEqual({
      body: 'text-base font-light leading-6',
      itemTitle: 'text-base font-medium leading-6',
      supporting: 'text-sm font-light leading-5',
      label: 'text-sm font-medium leading-5',
    })

    render(
      <>
        <FieldLabel>Label</FieldLabel>
        <FieldDescription>Supporting copy</FieldDescription>
        <FieldMessage>Validation copy</FieldMessage>
      </>
    )

    expect(screen.getByText('Label')).toHaveClass(
      ...v1Typography.label.split(' ')
    )
    expect(screen.getByText('Supporting copy')).toHaveClass(
      ...v1Typography.supporting.split(' ')
    )
    expect(screen.getByText('Validation copy')).toHaveClass(
      ...v1Typography.supporting.split(' ')
    )
    expect(tooltipSurfaceRecipe).toContain(v1Typography.supporting)
  })

  it('applies the compact Button inset and icon-side optical correction at the shared owner', () => {
    render(
      <>
        <Button size="compact">Compact text</Button>
        <Button size="compact" leadingIcon={<span aria-hidden="true" />}>
          Compact icon
        </Button>
        <Button>Default text</Button>
        <Button trailingIcon={<span aria-hidden="true" />}>Default icon</Button>
        <Button tone="destructive">Destructive</Button>
      </>
    )

    expect(screen.getByRole('button', { name: 'Compact text' })).toHaveClass(
      'px-3.5',
      'hover:bg-primary-hover',
      'active:bg-primary-pressed',
      'motion-safe:active:scale-[0.98]'
    )
    expect(screen.getByRole('button', { name: 'Compact icon' })).toHaveClass(
      'px-3.5',
      'pl-3'
    )
    expect(screen.getByRole('button', { name: 'Default text' })).toHaveClass(
      'px-6'
    )
    expect(screen.getByRole('button', { name: 'Default icon' })).toHaveClass(
      'px-6',
      'pr-[22px]'
    )
    expect(screen.getByRole('button', { name: 'Destructive' })).toHaveClass(
      'bg-destructive-action',
      'hover:bg-destructive-action-hover',
      'active:bg-destructive-action-pressed'
    )
  })

  it('keeps EmptyState hierarchy and action layout owned by the reusable composition', () => {
    const { rerender } = render(
      <EmptyState
        mode="actionable"
        icon={<span data-testid="empty-state-icon" />}
        title="No tokens found"
        description="Request support for this token."
        actions={
          <>
            <Button>Request support</Button>
            <Button tone="secondary">Contact us</Button>
          </>
        }
      />
    )

    expect(screen.getByText('No tokens found')).toHaveClass(
      'text-base',
      'font-medium',
      'leading-6'
    )
    expect(screen.getByText('Request support for this token.')).toHaveClass(
      'mt-1',
      'max-w-sm',
      'text-sm',
      'font-light'
    )
    expect(screen.getByTestId('canonical-action-group')).toHaveClass(
      'mt-4',
      'w-fit',
      'justify-center'
    )
    expect(screen.getByTestId('canonical-action-group')).toHaveAttribute(
      'data-direction',
      'horizontal'
    )
    expect(screen.getByTestId('canonical-action-group')).not.toHaveClass(
      '[&>*]:w-full'
    )
    expect(screen.getByTestId('empty-state-icon').parentElement).toHaveClass(
      'mb-2',
      'size-6',
      '[&>svg]:size-5',
      'text-foreground'
    )
    expect(
      screen.getByTestId('empty-state-icon').parentElement
    ).toHaveAttribute('aria-hidden', 'true')

    rerender(<EmptyState title="No proposals found" />)
    expect(screen.getByText('No proposals found')).toHaveClass(
      'font-light',
      'text-supporting-foreground'
    )
  })

  it('connects Radix tabs to their panels and supports keyboard selection', async () => {
    const user = userEvent.setup()

    render(
      <Tabs defaultValue="overview">
        <TabsList aria-label="Account sections">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">Overview panel</TabsContent>
        <TabsContent value="activity">Activity panel</TabsContent>
      </Tabs>
    )

    expect(screen.getByText('Overview panel')).toBeVisible()
    await user.click(screen.getByRole('tab', { name: 'Overview' }))
    await user.keyboard('{ArrowRight}')

    expect(screen.getByRole('tab', { name: 'Activity' })).toHaveAttribute(
      'data-state',
      'active'
    )
    expect(screen.getByText('Activity panel')).toBeVisible()
  })

  it('keeps a controlled segmented mode selected when the active item is pressed', async () => {
    const user = userEvent.setup()

    const Example = () => {
      const [value, setValue] = useState('chart')
      return (
        <SegmentedControl
          aria-label="View mode"
          presentation="contained"
          value={value}
          onValueChange={setValue}
        >
          <SegmentedControlItem value="chart">Chart</SegmentedControlItem>
          <SegmentedControlItem value="table">Table</SegmentedControlItem>
        </SegmentedControl>
      )
    }

    render(<Example />)
    const chart = screen.getByRole('radio', { name: 'Chart' })

    await user.click(chart)
    expect(chart).toHaveAttribute('data-state', 'on')
    await user.click(screen.getByRole('radio', { name: 'Table' }))
    expect(screen.getByRole('radio', { name: 'Table' })).toHaveAttribute(
      'data-state',
      'on'
    )
  })

  it('exposes checked and disabled Switch behavior', async () => {
    const user = userEvent.setup()
    const onCheckedChange = vi.fn()
    const { rerender } = render(
      <Switch
        aria-label="Governance alerts"
        checked={false}
        onCheckedChange={onCheckedChange}
      />
    )

    await user.click(screen.getByRole('switch', { name: 'Governance alerts' }))
    expect(onCheckedChange).toHaveBeenCalledWith(true)

    rerender(
      <Switch
        aria-label="Governance alerts"
        checked
        disabled
        onCheckedChange={onCheckedChange}
      />
    )
    const disabledSwitch = screen.getByRole('switch', {
      name: 'Governance alerts',
    })
    expect(disabledSwitch).toBeDisabled()
    expect(disabledSwitch).toHaveClass(
      'cursor-not-allowed',
      'data-[state=unchecked]:!bg-muted',
      'data-[state=checked]:!bg-[var(--disabled-structure)]'
    )
    expect(disabledSwitch).not.toHaveClass('border')
    expect(disabledSwitch.firstElementChild).toHaveClass(
      'shadow-none',
      'data-[state=unchecked]:bg-[var(--disabled-structure)]',
      'data-[state=checked]:bg-card'
    )
  })

  it('uses 1-based Pagination callbacks and disables boundary actions', async () => {
    const user = userEvent.setup()
    const onPageChange = vi.fn()

    const { rerender } = render(
      <Pagination
        currentPage={1}
        pageCount={12}
        visibleCount={10}
        totalCount={112}
        onPageChange={onPageChange}
      />
    )

    const previous = screen.getByRole('button', { name: 'Previous page' })
    const next = screen.getByRole('button', { name: 'Next page' })

    expect(previous).toBeDisabled()
    expect(previous).toHaveAttribute('data-size', 'compact')
    expect(previous).not.toHaveClass('flex-1')
    expect(previous).toHaveClass('bg-transparent', 'text-muted-foreground/50')
    expect(previous).not.toHaveClass('border', 'bg-border/20')
    expect(previous.parentElement).toHaveClass(
      'grid',
      'grid-cols-[2rem_minmax(0,1fr)_2rem]'
    )
    expect(previous.closest('nav')).not.toHaveClass(
      'px-5',
      'pb-3',
      'pt-4',
      'sm:px-6'
    )
    expect(next).toHaveAttribute('data-size', 'compact')
    expect(next).toHaveClass('bg-transparent', 'text-foreground')
    expect(screen.getByLabelText('Page 1, current page')).toHaveClass(
      'bg-muted',
      'text-foreground'
    )
    expect(
      screen.queryByRole('button', { name: 'Page 1' })
    ).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Page 3' }))
    expect(onPageChange).toHaveBeenCalledWith(3)
    await user.click(next)
    expect(onPageChange).toHaveBeenCalledWith(2)

    rerender(
      <Pagination
        currentPage={12}
        pageCount={12}
        visibleCount={2}
        totalCount={112}
        onPageChange={onPageChange}
      />
    )
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled()
  })

  it('copies the normalized full value, isolates the event, and owns transient feedback', async () => {
    vi.useFakeTimers()
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    })
    const parentClick = vi.fn()
    const address = '0x0000000000000000000000000000000000000000'

    render(
      <div onClick={parentClick}>
        <CopyableValue value={address} />
      </div>
    )

    expect(
      screen.getByRole('button', { name: 'Copy to clipboard' })
    ).toHaveAttribute('data-tone', 'quiet')
    expect(screen.getByText(address)).toHaveClass('sr-only')
    expect(screen.getByText('0x0000...0000')).toHaveClass('whitespace-nowrap')
    expect(screen.getByText('0x0000...0000')).not.toHaveClass('truncate')
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Copy to clipboard' }))
    })

    expect(writeText).toHaveBeenCalledWith(address)
    expect(parentClick).not.toHaveBeenCalled()
    expect(screen.getByRole('tooltip')).toHaveTextContent(
      'Copied to clipboard!'
    )
    expect(screen.getByRole('status')).toHaveTextContent('Copied to clipboard!')
    const feedbackSurface = screen
      .getAllByText('Copied to clipboard!')
      .map((element) => element.closest('.rounded-lg'))
      .find(Boolean) as HTMLElement
    expect(feedbackSurface).toHaveClass(
      'rounded-lg',
      'font-light',
      'shadow-sm',
      'animate-none',
      'duration-120',
      'bg-[var(--feedback-success-surface)]',
      'text-foreground',
      'ring-[var(--feedback-success-border)]'
    )
    expect(feedbackSurface.querySelector('svg')).toHaveClass('text-success')

    act(() => vi.advanceTimersByTime(2000))
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  })

  it('does not claim clipboard success on failure and allows Escape dismissal', async () => {
    vi.useFakeTimers()
    const writeText = vi
      .fn()
      .mockRejectedValueOnce(new Error('Clipboard unavailable'))
      .mockResolvedValueOnce(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    })

    render(<CopyableValue value="proposal-42" />)
    const copyButton = screen.getByRole('button', {
      name: 'Copy to clipboard',
    })

    await act(async () => {
      fireEvent.click(copyButton)
    })
    expect(screen.queryByText('Copied to clipboard!')).not.toBeInTheDocument()

    await act(async () => {
      fireEvent.click(copyButton)
    })
    const feedbackSurface = screen
      .getAllByText('Copied to clipboard!')
      .map((element) => element.closest('.rounded-lg'))
      .find(Boolean) as HTMLElement
    fireEvent.keyDown(feedbackSurface, { key: 'Escape' })

    expect(screen.queryByText('Copied to clipboard!')).not.toBeInTheDocument()
  })

  it('keeps labels intrinsic while exposing only momentary pressed treatment', () => {
    render(<Button>A deliberately long governance action label</Button>)
    const button = screen.getByRole('button')

    expect(button).toHaveClass('min-h-11')
    expect(button).toHaveClass('whitespace-nowrap')
    expect(button).toHaveClass(
      'hover:bg-primary-hover',
      'active:bg-primary-pressed',
      'motion-safe:active:scale-[0.98]'
    )
    expect(button.className).not.toContain('aria-[pressed=true]:')
  })

  it('keeps inline and external Link behavior recognizable and secure', () => {
    render(
      <p>
        Review the <Link href="/terms">terms</Link> and{' '}
        <Link
          href="https://docs.reserve.org"
          external
          externalAnnouncement=", opens in a new tab"
          rel="external"
        >
          protocol documentation
        </Link>
        .
      </p>
    )

    const terms = screen.getByRole('link', { name: 'terms' })
    expect(terms).toHaveAttribute('href', '/terms')
    expect(terms).not.toHaveAttribute('target')
    expect(terms).toHaveClass(
      'underline',
      'underline-offset-2',
      'focus-visible:ring-2'
    )

    const documentation = screen.getByRole('link', {
      name: 'protocol documentation, opens in a new tab',
    })
    expect(documentation).toHaveAttribute('target', '_blank')
    expect(documentation).toHaveAttribute('rel', 'external noopener noreferrer')
    expect(documentation.querySelector('svg')).toHaveAttribute(
      'aria-hidden',
      'true'
    )
  })

  it('composes standalone, return, and button-shaped links without changing navigation semantics', () => {
    render(
      <MemoryRouter>
        <Link asChild treatment="standalone">
          <RouterLink to="/governance">Governance</RouterLink>
        </Link>
        <Link asChild treatment="return">
          <RouterLink to="/governance">Back to governance</RouterLink>
        </Link>
        <Button asChild>
          <RouterLink to="/discover">Explore DTFs</RouterLink>
        </Button>
      </MemoryRouter>
    )

    expect(screen.getByRole('link', { name: 'Governance' })).toHaveAttribute(
      'href',
      '/governance'
    )
    expect(screen.getByRole('link', { name: 'Governance' })).toHaveClass(
      'inline-flex',
      'text-sm',
      'font-medium'
    )
    expect(
      screen.getByRole('link', { name: 'Back to governance' })
    ).toHaveClass(
      'gap-1',
      'text-sm',
      'font-light',
      'text-muted-foreground',
      'hover:text-primary',
      'hover:underline'
    )
    expect(screen.getByRole('link', { name: 'Explore DTFs' })).toHaveClass(
      'bg-primary',
      'rounded-full'
    )
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('suppresses unavailable asChild Button navigation', () => {
    render(
      <MemoryRouter initialEntries={['/current']}>
        <Button asChild disabled>
          <RouterLink to="/disabled">Disabled route</RouterLink>
        </Button>
        <Button asChild loading>
          <RouterLink to="/loading">Loading route</RouterLink>
        </Button>
        <LocationProbe />
      </MemoryRouter>
    )

    const disabledRoute = screen.getByRole('link', {
      name: 'Disabled route',
    })
    const loadingRoute = screen.getByRole('link', { name: 'Loading route' })

    for (const route of [disabledRoute, loadingRoute]) {
      expect(route).toHaveAttribute('aria-disabled', 'true')
      expect(route).toHaveAttribute('tabindex', '-1')
      fireEvent.click(route)
      expect(screen.getByTestId('router-location')).toHaveTextContent(
        '/current'
      )
    }
  })

  it('retains Accordion expansion and keyboard behavior in the informational anatomy', async () => {
    const user = userEvent.setup()

    render(
      <Accordion type="multiple">
        <AccordionItem
          value="governance"
          data-testid="accordion-governance-item"
        >
          <AccordionTrigger>
            How does governance work for an Index DTF with a deliberately long
            explanatory label?
          </AccordionTrigger>
          <AccordionContent>
            Governors vote on proposals that update the DTF mandate.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="risk">
          <AccordionTrigger>What risks should I review?</AccordionTrigger>
          <AccordionContent>
            Review market, liquidity, governance, and smart-contract risk.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="unavailable">
          <AccordionTrigger disabled>Unavailable disclosure</AccordionTrigger>
          <AccordionContent>Unavailable detail</AccordionContent>
        </AccordionItem>
      </Accordion>
    )

    const governance = screen.getByRole('button', {
      name: /How does governance work/,
    })
    const risk = screen.getByRole('button', {
      name: 'What risks should I review?',
    })
    expect(screen.getByTestId('accordion-governance-item')).not.toHaveClass(
      'border-b',
      'border-border'
    )
    expect(governance).toHaveClass(
      'min-h-12',
      'px-4',
      'py-3',
      'text-left',
      'duration-180'
    )
    expect(governance).toHaveClass(...v1Typography.itemTitle.split(' '))
    expect(governance).not.toHaveClass('hover:bg-foreground/5')
    expect(governance).toHaveClass('hover:text-primary')
    expect(governance).toHaveClass('focus-visible:ring-inset')
    expect(governance.querySelector('svg')).toHaveClass(
      'text-muted-foreground',
      'group-hover:text-primary'
    )
    expect(governance).not.toHaveClass('data-[state=open]:pb-2')
    expect(governance.querySelector('svg')).toHaveAttribute(
      'aria-hidden',
      'true'
    )
    expect(
      screen.getByRole('button', { name: 'Unavailable disclosure' })
    ).toHaveClass('disabled:cursor-not-allowed')
    expect(
      screen.getByRole('button', { name: 'Unavailable disclosure' })
    ).toBeDisabled()

    await user.click(governance)
    expect(
      screen.getByText(
        'Governors vote on proposals that update the DTF mandate.'
      )
    ).toBeVisible()
    expect(
      screen.getByText(
        'Governors vote on proposals that update the DTF mandate.'
      )
    ).toHaveClass('-mt-1', 'pb-2', 'leading-5')
    expect(
      screen.getByText(
        'Governors vote on proposals that update the DTF mandate.'
      ).parentElement
    ).toHaveClass('data-[state=open]:animate-accordion-down-v1')

    await user.keyboard('{ArrowDown}')
    expect(risk).toHaveFocus()
    await user.keyboard('{Enter}')
    expect(
      screen.getByText(
        'Review market, liquidity, governance, and smart-contract risk.'
      )
    ).toBeVisible()
    expect(
      screen.getByText(
        'Governors vote on proposals that update the DTF mandate.'
      )
    ).toBeVisible()
  })

  it('retains one-region Collapsible behavior while consuming the accepted disclosure presentation', async () => {
    const user = userEvent.setup()

    render(
      <Collapsible>
        <CollapsibleTrigger cue={{ closed: 'Show code', open: 'Hide code' }}>
          Executable code
        </CollapsibleTrigger>
        <CollapsibleContent>
          The proposal preview owns the hosted call data.
        </CollapsibleContent>
      </Collapsible>
    )

    const trigger = screen.getByRole('button', {
      name: 'Executable code',
    })
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(trigger).toHaveClass(
      ...disclosurePresentation.trigger.split(' '),
      ...v1Typography.itemTitle.split(' ')
    )
    expect(trigger).toHaveClass('focus-visible:ring-inset')
    const chevron = trigger.querySelector('svg')
    expect(chevron).toHaveClass(
      'size-4',
      'duration-180',
      'text-muted-foreground',
      'group-hover:text-primary',
      'group-focus-visible:text-primary'
    )
    expect(screen.getByText('Show code')).toHaveAttribute('aria-hidden', 'true')
    expect(screen.getByText('Show code')).toHaveClass(
      ...v1Typography.label.split(' '),
      'hidden',
      'text-muted-foreground',
      'sm:inline',
      'sm:group-data-[state=open]:hidden'
    )
    expect(screen.getByText('Hide code')).toHaveClass(
      'hidden',
      'text-muted-foreground',
      'group-hover:text-primary',
      'sm:group-data-[state=open]:inline'
    )

    await user.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(trigger).toHaveAttribute('data-state', 'open')
    expect(
      screen.getByText('The proposal preview owns the hosted call data.')
    ).toBeVisible()
    expect(
      screen.getByText('The proposal preview owns the hosted call data.')
        .parentElement
    ).toHaveClass(...disclosurePresentation.contentMotion.split(' '))
  })

  it('keeps persistent message tone separate from announcement urgency and owns its shared anatomy', () => {
    const { rerender } = render(
      <InlineMessage tone="warning">
        <InlineMessageTitle>Trading paused</InlineMessageTitle>
        <InlineMessageDescription>
          Trading resumes when the affected markets reopen.
        </InlineMessageDescription>
      </InlineMessage>
    )

    const message = screen.getByTestId('canonical-inline-message')
    expect(message).not.toHaveAttribute('role')
    expect(message).toHaveClass(
      'gap-2',
      'rounded-lg',
      'p-4',
      'ring-1',
      'ring-inset',
      'bg-[var(--feedback-warning-surface)]',
      'ring-[var(--feedback-warning-border)]'
    )
    expect(message.querySelector('svg')?.parentElement).toHaveClass(
      'size-4',
      '[&>svg]:size-4',
      '[&>svg]:stroke-[1.5]'
    )
    expect(screen.getByText('Trading paused')).toHaveClass(
      ...v1Typography.label.split(' '),
      'text-foreground'
    )
    expect(
      screen.getByText('Trading resumes when the affected markets reopen.')
    ).toHaveClass(
      ...v1Typography.supporting.split(' '),
      'text-supporting-foreground'
    )

    rerender(
      <InlineMessage density="compact" icon={false} role="alert" tone="danger">
        <InlineMessageDescription>Approval failed.</InlineMessageDescription>
        <InlineMessageActions>
          <Button size="compact">Retry</Button>
        </InlineMessageActions>
      </InlineMessage>
    )

    expect(message).toHaveAttribute('role', 'alert')
    expect(message).toHaveClass(
      'p-3',
      'bg-[var(--feedback-danger-surface)]',
      'ring-[var(--feedback-danger-border)]'
    )
    expect(message.querySelector('svg')).toBeNull()
    expect(screen.getByText('Approval failed.').parentElement).toHaveClass(
      'col-span-2'
    )
    expect(screen.getByTestId('inline-message-actions')).toHaveClass(
      'mt-3',
      'gap-2',
      '[&>*]:focus-visible:ring-offset-[var(--inline-message-surface)]'
    )
  })

  it('keeps Textarea and loading semantics bounded', () => {
    render(
      <>
        <TextArea aria-label="Rationale" readOnly invalid value="Submitted" />
        <Skeleton className="h-8 w-full rounded-full" />
        <Spinner label="Refreshing quote" size={24} />
        <LifecycleStatusPill role="processing">Processing</LifecycleStatusPill>
      </>
    )

    const textarea = screen.getByRole('textbox', { name: 'Rationale' })
    expect(textarea).toHaveAttribute('readonly')
    expect(textarea).toHaveAttribute('aria-invalid', 'true')
    expect(textarea).toHaveClass('resize-y', 'rounded-lg', 'px-5', 'py-4')
    expect(screen.getByTestId('v1-skeleton')).toHaveClass(
      'bg-border',
      'motion-reduce:animate-none'
    )
    const spinner = screen.getByRole('status', { name: 'Refreshing quote' })
    expect(spinner).toHaveClass('motion-reduce:animate-none')
    expect(spinner).toHaveAttribute('width', '24')
    expect(spinner).not.toHaveClass('text-foreground')

    const statusSpinner = screen
      .getByTestId('lifecycle-status-pill')
      .querySelector('[data-status-icon="spinner"]')
    expect(statusSpinner).toHaveAttribute('width', '14')
    expect(statusSpinner).toHaveAttribute('aria-hidden', 'true')
  })
})

const LocationProbe = () => {
  const location = useLocation()

  return <output data-testid="router-location">{location.pathname}</output>
}
