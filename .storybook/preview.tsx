import { I18nProvider } from '@lingui/react'
import { setupI18n } from '@lingui/core'
import type { Preview } from '@storybook/react-vite'
import { useEffect, type ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'

import { TooltipProvider } from '../src/components/ui/tooltip'
import { ConnectedDocs } from '../src/stories/shared/connected-docs'
import { messages } from '../src/locales/en.po'
import '../src/app.css'
import './preview.css'

const storyI18n = setupI18n({
  locale: 'en',
  messages: { en: messages },
})

const StoryEnvironment = ({
  children,
  theme,
}: {
  children: ReactNode
  theme: 'light' | 'dark'
}) => {
  useEffect(() => {
    document.documentElement.lang = 'en'
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  return (
    <I18nProvider i18n={storyI18n}>
      <MemoryRouter>
        <TooltipProvider delayDuration={200}>
          <div className={theme === 'dark' ? 'dark' : undefined}>
            {children}
          </div>
        </TooltipProvider>
      </MemoryRouter>
    </I18nProvider>
  )
}

const preview: Preview = {
  tags: ['autodocs'],
  decorators: [
    (Story, context) => (
      <StoryEnvironment theme={context.globals.theme as 'light' | 'dark'}>
        <Story />
      </StoryEnvironment>
    ),
  ],
  globalTypes: {
    theme: {
      description: 'Component theme',
      toolbar: {
        icon: 'circlehollow',
        items: ['light', 'dark'],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    theme: 'light',
  },
  parameters: {
    docs: { codePanel: true, page: ConnectedDocs },
    controls: {
      expanded: true,
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    layout: 'centered',
    options: {
      storySort: {
        method: 'alphabetical',
        order: [
          'Introduction',
          'Foundations',
          ['Principles', 'Organic brand', '*'],
          'Components',
          [
            'Actions',
            ['Button', 'Icon button', 'Action group', 'Link', 'Menu'],
            'Fields and selection',
            [
              'Checkbox',
              'Text input',
              'Textarea',
              'Select',
              'Search',
              'Switch',
              'Single choice',
              'Multi select filter',
              'Preset or custom',
              'Slider',
            ],
            'Navigation and disclosure',
            [
              'Tabs',
              'Segmented control',
              'Pagination',
              'Accordion',
              'Collapsible',
            ],
            'Feedback and overlays',
            [
              'Dialog',
              'Drawer',
              'Popover',
              'Inline message',
              'Help tooltip',
              'Empty state',
              'Loading',
              'Progress indicator',
              'Toast',
            ],
            'Data display',
            [
              'Metric',
              'Performance value',
              'Lifecycle status',
              'Entity identity',
              'Copyable value',
            ],
          ],
          'Patterns',
          ['Navigation', 'Market', 'Transactions (In progress)', '*'],
          'Dashboard (unreviewed)',
          ['Overview', 'Activity chart', 'eUSD activity layout', '*'],
          'Explorations',
          [
            'Screen layouts',
            'Screen pilots',
            'Auctions',
            'Foundation studies',
            'Layout studies',
            'Transactions',
            '*',
          ],
        ],
      },
    },
  },
}

export default preview
