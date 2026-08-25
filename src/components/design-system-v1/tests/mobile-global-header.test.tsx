import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { Button } from '@/components/button'
import { IconButton } from '@/components/icon-button'
import {
  MobileGlobalHeader,
  MobileUtilityPanel,
  type MobileUtilityPanelMessages,
} from '../mobile-global-header'

const messages: MobileUtilityPanelMessages = {
  triggerLabel: 'Search, theme, and language',
  panelLabel: 'Application utilities',
  searchSectionLabel: 'Search',
  searchActionLabel: 'Search DTFs',
  themeSectionLabel: 'Theme',
  themeControlLabel: 'Theme',
  lightThemeLabel: 'Light',
  lightThemeActionLabel: 'Use light theme',
  darkThemeLabel: 'Dark',
  darkThemeActionLabel: 'Use dark theme',
  languageSectionLabel: 'Language',
  languageOptionsLabel: 'Language options',
  languageSummaryLabel: (languageName) => `Language, ${languageName}`,
  languageActionLabel: (languageName) => `Switch language to ${languageName}`,
  languageLabels: {
    en: 'English',
    es: 'Español',
    ko: '한국어',
    zh: '中文',
  },
  languageAccessibleNames: {
    en: 'English',
    es: 'Spanish',
    ko: 'Korean',
    zh: 'Chinese',
  },
}

const Header = ({
  surface = 'default',
}: {
  surface?: 'default' | 'transparent'
}) => (
  <MobileGlobalHeader
    account={<Button size="compact">Connect</Button>}
    brand={<a href="/">Reserve</a>}
    navigation={
      <IconButton
        icon={<svg aria-hidden="true" />}
        label="Open global navigation"
        size="compact"
      />
    }
    surface={surface}
    utilities={<MobileUtilityPanel messages={messages} />}
  />
)

describe('mobile global header candidate', () => {
  it('keeps the shell at the accepted mobile-bar height while using compact navigation controls', () => {
    render(<Header />)

    const header = screen.getByRole('banner')
    expect(header).toHaveClass('h-14', 'px-4', 'bg-card')
    expect(header).toHaveAttribute('data-surface', 'default')
    expect(screen.getByRole('button', { name: 'Connect' })).toHaveAttribute(
      'data-size',
      'compact'
    )
    expect(
      screen.getByRole('button', { name: 'Open global navigation' })
    ).toHaveAttribute('data-size', 'compact')
    const utilityTrigger = screen.getByRole('button', {
      name: 'Search, theme, and language',
    })
    expect(utilityTrigger).toHaveAttribute('data-size', 'compact')
    expect(utilityTrigger).toHaveClass('gap-1', '[&>svg]:size-3.5')
  })

  it('supports a transparent landing-page surface without changing its control contract', () => {
    render(<Header surface="transparent" />)

    const header = screen.getByRole('banner')
    expect(header).toHaveAttribute('data-surface', 'transparent')
    expect(header).toHaveClass('bg-transparent')
    expect(header).not.toHaveClass('bg-card')
  })

  it('composes the accepted search, theme, and language controls in one utility panel', () => {
    render(
      <MobileUtilityPanel
        defaultOpen
        language="ko"
        messages={messages}
        theme="dark"
      />
    )

    const utilityPanel = screen.getByRole('region', {
      name: 'Application utilities',
    })
    expect(utilityPanel).toHaveClass(
      'absolute',
      'inset-x-0',
      'top-full',
      'bg-card',
      'text-card-foreground'
    )
    expect(utilityPanel).not.toHaveClass('bg-popover')
    expect(screen.getByRole('button', { name: 'Search DTFs' })).toHaveAttribute(
      'data-testid',
      'canonical-search-field-launcher'
    )
    expect(
      screen.getByRole('radio', { name: 'Use light theme' })
    ).toHaveAttribute('data-state', 'off')
    expect(
      screen.getByRole('radio', { name: 'Use dark theme' })
    ).toHaveAttribute('data-state', 'on')
    expect(screen.getByRole('group', { name: 'Theme' })).toHaveAttribute(
      'data-size',
      'default'
    )
    expect(
      screen.getByRole('button', { name: 'Language, Korean' })
    ).toHaveAttribute('data-size', 'default')
    expect(
      screen.queryByRole('group', { name: 'Language options' })
    ).not.toBeInTheDocument()
  })

  it('expands language choices inside the utility panel and collapses after selection', () => {
    render(<MobileUtilityPanel defaultOpen messages={messages} />)

    fireEvent.click(screen.getByRole('button', { name: 'Language, English' }))

    const languageOptions = screen.getByRole('group', {
      name: 'Language options',
    })
    expect(languageOptions).toBeVisible()
    for (const option of within(languageOptions).getAllByRole('button')) {
      expect(option).toHaveClass('min-h-11')
    }
    expect(
      within(languageOptions).queryByRole('button', {
        name: 'Switch language to English',
      })
    ).not.toBeInTheDocument()
    fireEvent.click(
      within(languageOptions).getByRole('button', {
        name: 'Switch language to Spanish',
      })
    )

    expect(
      screen.queryByRole('group', { name: 'Language options' })
    ).not.toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Language, Spanish' })
    ).toHaveAttribute('aria-expanded', 'false')

    fireEvent.click(screen.getByRole('button', { name: 'Language, Spanish' }))
    const reopenedOptions = screen.getByRole('group', {
      name: 'Language options',
    })
    expect(
      within(reopenedOptions).queryByRole('button', {
        name: 'Switch language to Spanish',
      })
    ).not.toBeInTheDocument()
    expect(
      within(reopenedOptions).getByRole('button', {
        name: 'Switch language to English',
      })
    ).toBeVisible()
    fireEvent.click(
      screen.getByRole('button', { name: 'Search, theme, and language' })
    )
    fireEvent.click(
      screen.getByRole('button', { name: 'Search, theme, and language' })
    )
    expect(
      screen.queryByRole('group', { name: 'Language options' })
    ).not.toBeInTheDocument()
  })

  it('closes before handing focus to the separate search dialog', () => {
    vi.useFakeTimers()
    const onSearch = vi.fn()
    render(
      <MobileUtilityPanel defaultOpen messages={messages} onSearch={onSearch} />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Search DTFs' }))

    expect(
      screen.queryByRole('region', { name: 'Application utilities' })
    ).not.toBeInTheDocument()
    vi.runAllTimers()
    expect(onSearch).toHaveBeenCalledOnce()
    vi.useRealTimers()
  })
})
