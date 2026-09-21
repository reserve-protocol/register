import type { Meta, StoryObj } from '@storybook/react-vite'
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
        component: 'Colors, typography, spacing, shape and motion.',
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
  render: () => <FoundationPrimaryResult foundationId="color" />,
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
