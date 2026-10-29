import { PlaygroundDocs } from '../shared/playground-docs'
import { Button } from '@/components/button'
import type { Meta, StoryObj } from '@storybook/react-vite'

import {
  InlineMessage,
  InlineMessageActions,
  InlineMessageDescription,
  InlineMessageTitle,
} from '@/components/design-system-v1/inline-message'

const meta = {
  title: 'Components/Feedback and overlays/Inline message',
  parameters: {
    docs: {
      page: () => <PlaygroundDocs interactive={Playground} />,
      description: {
        component:
          '`@/components/design-system-v1/inline-message` · Keep feedback beside the content or action it explains. Use Toast for brief, detached results; feedback requiring action or sustained attention stays inline.',
      },
    },
  },
  component: InlineMessage,
  args: {
    density: 'default',
    iconPresentation: 'plain',
    presentation: 'default',
    tone: 'information',
  },
  argTypes: {
    children: { control: false },
    className: { control: false },
    density: { control: 'inline-radio', options: ['default', 'compact'] },
    icon: { control: false },
    iconPresentation: {
      control: 'inline-radio',
      options: ['plain', 'contained'],
      if: { arg: 'presentation', eq: 'summary' },
    },
    presentation: {
      control: 'inline-radio',
      options: ['default', 'summary'],
    },
    tone: {
      control: 'inline-radio',
      options: ['information', 'success', 'warning', 'danger'],
    },
  },
  render: (args) => (
    <InlineMessage {...args} className="max-w-lg">
      <InlineMessageTitle>Proposal is ready for review</InlineMessageTitle>
      <InlineMessageDescription>
        Check the basket and governance settings before submitting.
      </InlineMessageDescription>
    </InlineMessage>
  ),
} satisfies Meta<typeof InlineMessage>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  tags: ['!dev'],
}

export const Error: Story = {
  name: 'Danger',
  args: { tone: 'danger' },
  render: (args) => (
    <InlineMessage {...args} className="max-w-lg">
      <InlineMessageTitle>Transaction failed</InlineMessageTitle>
      <InlineMessageDescription>
        Review the transaction details and try again.
      </InlineMessageDescription>
    </InlineMessage>
  ),
}

export const WithAction: Story = {
  name: 'With action',
  args: { tone: 'warning' },
  render: (args) => (
    <InlineMessage {...args} className="max-w-lg">
      <InlineMessageTitle>Holdings unavailable</InlineMessageTitle>
      <InlineMessageDescription>
        Basket data could not be loaded. Try again in a moment.
      </InlineMessageDescription>
      <InlineMessageActions>
        <Button tone="secondary" size="compact">
          Try again
        </Button>
      </InlineMessageActions>
    </InlineMessage>
  ),
}
