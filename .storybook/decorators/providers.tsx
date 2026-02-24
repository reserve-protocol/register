import type { Decorator } from '@storybook/react'
import { I18nProvider } from '@lingui/react'
import { i18n } from '@lingui/core'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Provider as JotaiProvider, createStore } from 'jotai'

// Minimal lingui setup for storybook - just English with no messages needed
i18n.load('en', {})
i18n.activate('en')

export const withBaseProviders: Decorator = (Story) => (
  <I18nProvider i18n={i18n}>
    <TooltipProvider>
      <Story />
    </TooltipProvider>
  </I18nProvider>
)

export const withJotai: Decorator = (Story) => (
  <JotaiProvider store={createStore()}>
    <Story />
  </JotaiProvider>
)
