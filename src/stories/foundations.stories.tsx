import type { Meta, StoryObj } from '@storybook/react-vite'
import { v1Typography } from '@/components/design-system-v1/typography'
import { v1LayoutRecipes } from '@/components/ui/v1-layout-recipes'
import { FoundationPrimaryResult } from './foundations/reference/foundation-documentation-results'
import MotionStudy from './foundations/reference/motion-study'
import IconographyStudy from './foundations/reference/iconography-study'

const meta = {
  title: 'Foundations/Principles',
  parameters: {
    layout: 'padded',
    controls: { disable: true },
    docs: {
      description: {
        component:
          'Color, typography, spacing, radius, layout, elevation, motion, iconography and accessibility.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="mx-auto max-w-6xl">
        <Story />
      </div>
    ),
  ],
} satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

export const Color: Story = {
  render: () => (
    <div className={v1LayoutRecipes.stack.internalRegions}>
      <h2 className={v1Typography.sectionTitle}>Color</h2>
      <FoundationPrimaryResult foundationId="color" />
    </div>
  ),
}
export const Typography: Story = {
  render: () => <FoundationPrimaryResult foundationId="typography" />,
}
export const Spacing: Story = {
  render: () => <FoundationPrimaryResult foundationId="spacing" />,
}
export const Radius: Story = {
  render: () => <FoundationPrimaryResult foundationId="radius" />,
}
export const Layout: Story = {
  render: () => <FoundationPrimaryResult foundationId="layout" />,
}
export const Elevation: Story = {
  render: () => <FoundationPrimaryResult foundationId="elevation" />,
}
export const Motion: Story = { render: () => <MotionStudy /> }
export const Iconography: Story = { render: () => <IconographyStudy /> }
export const Accessibility: Story = {
  render: () => <FoundationPrimaryResult foundationId="accessibility" />,
}
