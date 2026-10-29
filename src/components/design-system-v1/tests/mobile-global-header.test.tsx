import { fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import {
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
  languageLabels: { en: 'English', es: 'Español', ko: '한국어', zh: '中文' },
  languageAccessibleNames: {
    en: 'English',
    es: 'Spanish',
    ko: 'Korean',
    zh: 'Chinese',
  },
}

afterEach(() => vi.useRealTimers())

describe('MobileUtilityPanel', () => {
  it('exposes the current theme and language with accessible controls', () => {
    render(
      <MobileUtilityPanel
        defaultOpen
        language="ko"
        messages={messages}
        theme="dark"
      />
    )

    expect(
      screen.getByRole('region', { name: 'Application utilities' })
    ).toBeVisible()
    expect(
      screen.getByRole('radio', { name: 'Use dark theme' })
    ).toHaveAttribute('data-state', 'on')
    expect(
      screen.getByRole('button', { name: 'Language, Korean' })
    ).toHaveAttribute('aria-expanded', 'false')
  })

  it('reports a selected theme', () => {
    const onThemeChange = vi.fn()
    render(
      <MobileUtilityPanel
        defaultOpen
        messages={messages}
        onThemeChange={onThemeChange}
      />
    )

    fireEvent.click(screen.getByRole('radio', { name: 'Use dark theme' }))
    expect(onThemeChange).toHaveBeenCalledWith('dark')
    expect(
      screen.getByRole('radio', { name: 'Use dark theme' })
    ).toHaveAttribute('data-state', 'on')
  })

  it('expands language choices, reports selection, and collapses the choices', () => {
    const onLanguageChange = vi.fn()
    render(
      <MobileUtilityPanel
        defaultOpen
        messages={messages}
        onLanguageChange={onLanguageChange}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Language, English' }))
    const options = screen.getByRole('group', { name: 'Language options' })
    expect(
      within(options).queryByRole('button', {
        name: 'Switch language to English',
      })
    ).not.toBeInTheDocument()
    fireEvent.click(
      within(options).getByRole('button', {
        name: 'Switch language to Spanish',
      })
    )

    expect(onLanguageChange).toHaveBeenCalledWith('es')
    expect(
      screen.queryByRole('group', { name: 'Language options' })
    ).not.toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Language, Spanish' })
    ).toHaveAttribute('aria-expanded', 'false')
  })

  it('closes before opening search on the next task', () => {
    vi.useFakeTimers()
    const onSearch = vi.fn()
    render(
      <MobileUtilityPanel defaultOpen messages={messages} onSearch={onSearch} />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Search DTFs' }))
    expect(
      screen.queryByRole('region', { name: 'Application utilities' })
    ).not.toBeInTheDocument()
    expect(onSearch).not.toHaveBeenCalled()
    vi.runAllTimers()
    expect(onSearch).toHaveBeenCalledOnce()
  })

  it('returns focus to the utility trigger after Escape', () => {
    render(<MobileUtilityPanel defaultOpen messages={messages} />)
    fireEvent.keyDown(document, { key: 'Escape' })

    const trigger = screen.getByRole('button', {
      name: 'Search, theme, and language',
    })
    expect(trigger).toHaveFocus()
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })
})
