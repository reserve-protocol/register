import { useGlobals } from 'storybook/preview-api'
import { useMemo } from 'react'
import { I18nProvider } from '@lingui/react'
import { setupI18n } from '@lingui/core'
import { messages as en } from '@/locales/en.po'
import { messages as es } from '@/locales/es.po'
import { messages as ko } from '@/locales/ko.po'
import { messages as zh } from '@/locales/zh.po'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { StorySurface } from './shared/story-surface'
import {
  DesktopShell,
  MobileGlobalNavigationSpecimen,
  MobileProductNavigationSpecimen,
} from './navigation/design-reference'

const meta = {
  title: 'Patterns/Navigation',
  parameters: {
    layout: 'fullscreen',
    controls: { disable: true },
    docs: {
      description: {
        component: 'Desktop and mobile navigation, including DTF switching.',
      },
    },
  },
} satisfies Meta
export default meta
type Story = StoryObj<typeof meta>
export const Desktop: Story = {
  render: (_args, context) => (
    <StorySurface fullHeight={context.viewMode !== 'docs'}>
      <DesktopShell showProductNavigation />
    </StorySurface>
  ),
}
export const GlobalOnly: Story = {
  name: 'Global only',
  render: (_args, context) => (
    <StorySurface fullHeight={context.viewMode !== 'docs'}>
      <DesktopShell showProductNavigation={false} />
    </StorySurface>
  ),
}
export const MobileGlobal: Story = {
  name: 'Mobile global',
  globals: { viewport: { value: 'mobile2', isRotated: false } },
  render: function Render() {
    const [globals, updateGlobals] = useGlobals()
    return (
      <MobileGlobalNavigationSpecimen
        theme={globals.theme === 'dark' ? 'dark' : 'light'}
        onThemeChange={(theme) => updateGlobals({ theme })}
      />
    )
  },
}
export const MobileProduct: Story = {
  name: 'Mobile product',
  globals: { viewport: { value: 'mobile2', isRotated: false } },
  render: () => <MobileProductNavigationSpecimen />,
}

export const MobileProduct44: StoryObj<{
  language: 'en' | 'es' | 'ko' | 'zh'
}> = {
  name: 'Mobile product, 44px controls',
  args: { language: 'en' },
  argTypes: {
    language: { control: 'select', options: ['en', 'es', 'ko', 'zh'] },
  },
  parameters: {
    controls: { disable: false },
    docs: {
      description: {
        story:
          'Native 44px floating controls with 14px text and matching 60px frames. When space runs out, the action shortens before chat hides. Language controls pressure-test the action labels; other fixture copy stays English.',
      },
    },
  },
  render: function Render(args) {
    const language =
      args.language === 'es' || args.language === 'ko' || args.language === 'zh'
        ? args.language
        : 'en'
    const i18n = useMemo(
      () =>
        setupI18n({
          locale: language,
          messages: { [language]: { en, es, ko, zh }[language] },
        }),
      [language]
    )
    return (
      <I18nProvider i18n={i18n}>
        <div lang={language}>
          <MobileProductNavigationSpecimen controlsSize="default" />
        </div>
      </I18nProvider>
    )
  },
}

export const Home: Story = {
  render: (_args, context) => (
    <StorySurface fullHeight={context.viewMode !== 'docs'}>
      <DesktopShell showProductNavigation={false} home />
    </StorySurface>
  ),
}
