import type { Meta, StoryObj } from '@storybook/react-vite'
import LayoutFoundationStudy from './reference/layout-foundation-study'
import {
  AuctionsStudy,
  GovernanceStudy,
} from './reference/layout-workspace-studies'
import {
  ProgressiveWorkflowStudy,
  FullWidthContextStudy,
} from './reference/layout-workflow-studies'
import ContainedFormRowReview from './reference/contained-form-row-review'

const meta = {
  title: 'Explorations/Layout',
  parameters: {
    layout: 'padded',
    controls: { disable: true },
    docs: {
      description: {
        component: 'Page and workflow layout studies.',
      },
    },
  },
} satisfies Meta
export default meta
type Story = StoryObj<typeof meta>
export const FramesAndRegions: Story = {
  render: () => <LayoutFoundationStudy />,
}
export const BrowseAndInspect: Story = { render: () => <AuctionsStudy /> }
export const Governance: Story = { render: () => <GovernanceStudy /> }
export const ProgressiveWorkflow: Story = {
  render: () => <ProgressiveWorkflowStudy />,
}
export const FullWidthContext: Story = {
  render: () => <FullWidthContextStudy />,
}
export const ContainedFormRows: Story = {
  render: () => <ContainedFormRowReview />,
}
