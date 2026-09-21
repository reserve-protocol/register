import { useGlobals } from 'storybook/preview-api'
import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  DesktopShell,
  MobileGlobalNavigationSpecimen,
  MobileProductNavigationSpecimen,
} from './navigation/design-reference'

const meta = {
  title: 'Patterns/Navigation',
  parameters: {
    layout: 'padded',
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
  render: () => <DesktopShell showProductNavigation />,
}
export const GlobalOnly: Story = {
  render: () => <DesktopShell showProductNavigation={false} />,
}
export const MobileGlobal: Story = {
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
  globals: { viewport: { value: 'mobile2', isRotated: false } },
  render: () => <MobileProductNavigationSpecimen />,
}

export const Home: Story = {
  render: () => <DesktopShell showProductNavigation={false} home />,
}
