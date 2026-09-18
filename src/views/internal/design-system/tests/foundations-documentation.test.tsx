import { readFileSync } from 'node:fs'
import { cleanup, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'

import { FOUNDATION_ITEMS } from '../foundation-catalog'
import { FOUNDATION_COLOR_GROUPS } from '../foundation-documentation-color'
import { FoundationsOverview } from '../foundations-pages'

afterEach(cleanup)

const renderOverview = () =>
  render(
    <MemoryRouter initialEntries={['/internal/design-system/foundations']}>
      <FoundationsOverview />
    </MemoryRouter>
  )

describe('foundation documentation overview', () => {
  it('renders every foundation as one continuous anchored reference', () => {
    renderOverview()

    const sections = screen.getAllByTestId('foundation-reference-section')
    expect(sections).toHaveLength(FOUNDATION_ITEMS.length)
    expect(sections.map((section) => section.id)).toEqual(
      FOUNDATION_ITEMS.map(({ id }) => id)
    )

    for (const item of FOUNDATION_ITEMS) {
      expect(
        within(document.getElementById(item.id)!).getByRole('heading', {
          name: item.name,
        })
      ).toBeVisible()
    }

    expect(
      screen.queryByRole('navigation', { name: 'Foundation sections' })
    ).toBeNull()
    expect(screen.queryByTestId('foundation-visual-overview')).toBeNull()
  })

  it('puts current system results before closed secondary documentation', () => {
    renderOverview()

    const color = document.getElementById('color')!
    const result = within(color).getByTestId('foundation-primary-result')
    const secondary = within(color).getByTestId('foundation-secondary-details')

    expect(result.compareDocumentPosition(secondary)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
    )
    expect(secondary).not.toHaveAttribute('open')
    expect(screen.queryByTestId('typography-review-contexts')).toBeNull()
    expect(screen.queryByTestId('color-contrast-review')).toBeNull()
  })

  it('makes Color a primary semantic reference with theme values and boundaries', () => {
    renderOverview()

    const color = within(document.getElementById('color')!)
    expect(color.getByTestId('color-semantic-reference')).toBeVisible()
    expect(color.getByText('Accepted')).toBeVisible()
    expect(color.getByText('Page canvas')).toBeVisible()
    expect(color.getByText('--background')).toBeVisible()
    expect(color.getByText('24 71% 99%')).toBeVisible()
    expect(color.getByText('212 20% 6%')).toBeVisible()
    expect(
      color.getByText('Task success is not price appreciation.')
    ).toBeVisible()
    expect(color.getByText('Feedback semantic families')).toBeVisible()
    expect(color.getByText('Performance data')).toBeVisible()
  })

  it('keeps the complete Color definition readable before the wide table fits', () => {
    renderOverview()

    const color = within(document.getElementById('color')!)
    const header = color.getAllByText('Semantic role')[0].parentElement
    const firstRole = color.getByText('--background').closest('article')
    const performanceRole = color
      .getByText('performance.positive')
      .closest('article')

    expect(header).toHaveClass('xl:grid')
    expect(header).not.toHaveClass('lg:grid')
    expect(firstRole).toHaveClass(
      'xl:grid-cols-[minmax(10rem,1fr)_8rem_9rem_9rem_minmax(14rem,1.5fr)]'
    )
    expect(firstRole).not.toHaveClass(
      'lg:grid-cols-[minmax(10rem,1fr)_8rem_9rem_9rem_minmax(14rem,1.5fr)]'
    )
    expect(within(firstRole!).getByText('Light')).toHaveClass('xl:hidden')
    expect(performanceRole).toHaveClass(
      'xl:grid-cols-[minmax(9rem,1fr)_9rem_10rem_10rem_minmax(12rem,1.5fr)]'
    )
  })

  it('includes every owned foreground alias in the primary Color reference', () => {
    renderOverview()

    const color = within(document.getElementById('color')!)
    const foregroundAliases = [
      '--card-foreground',
      '--popover-foreground',
      '--primary-foreground',
      '--secondary-foreground',
      '--muted-foreground',
      '--accent-foreground',
      '--destructive-foreground',
      '--success-foreground',
    ]

    for (const alias of foregroundAliases) {
      expect(color.getByText(alias)).toBeVisible()
    }
  })

  it('keeps Layout role-led without presenting unresolved proportions', () => {
    renderOverview()

    const layout = within(document.getElementById('layout')!)
    expect(layout.getByText('Exploring')).toBeVisible()
    expect(layout.getByText('Table-led content + support')).toBeVisible()
    expect(
      layout.getByText(/Exact outer width, gutters, support-rail width/)
    ).toBeVisible()
    expect(layout.queryByText(/3fr|28rem/)).toBeNull()
  })

  it('keeps concrete Color values aligned with the light and dark theme owners', () => {
    const appCss = readFileSync('src/app.css', 'utf8')
    const lightTheme = appCss.slice(0, appCss.indexOf('  .dark {'))
    const darkTheme = appCss.slice(appCss.indexOf('  .dark {'))

    for (const group of FOUNDATION_COLOR_GROUPS) {
      for (const role of group.roles as readonly ColorRole[]) {
        if (!/^--[a-z-]+$/.test(role.variable)) continue
        if (/^\d/.test(role.light)) {
          expect(readCssValue(lightTheme, role.variable)).toBe(role.light)
        }
        if (/^\d/.test(role.dark)) {
          expect(readCssValue(darkTheme, role.variable)).toBe(role.dark)
        }
      }
    }
  })
})

type ColorRole = {
  variable: string
  light: string
  dark: string
}

const readCssValue = (source: string, variable: string) => {
  const escapedVariable = variable.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return source.match(new RegExp(`${escapedVariable}:\\s*([^;]+);`))?.[1]
}
