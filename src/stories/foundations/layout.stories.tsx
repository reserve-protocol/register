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
  title: 'Explorations/Layout studies',
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
  name: 'Frames and regions',
  render: () => <LayoutFoundationStudy />,
}
export const BrowseAndInspect: Story = {
  name: 'Browse and inspect',
  render: () => <AuctionsStudy />,
}
export const Governance: Story = { render: () => <GovernanceStudy /> }
export const ProgressiveWorkflow: Story = {
  name: 'Progressive workflow',
  render: () => <ProgressiveWorkflowStudy />,
}
export const FullWidthContext: Story = {
  name: 'Full width context',
  render: () => <FullWidthContextStudy />,
}
export const ContainedFormRows: Story = {
  name: 'Contained form rows',
  render: () => <ContainedFormRowReview />,
}
