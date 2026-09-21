import type { Meta, StoryObj } from '@storybook/react-vite'

import {
  InlineMessage,
  InlineMessageDescription,
  InlineMessageTitle,
} from '@/components/design-system-v1/inline-message'

const meta = {
  title: 'Components/Inline message',
  parameters: {
    docs: {
      description: {
        component: '`@/components/design-system-v1/inline-message`',
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

export const Playground: Story = {}

export const Error: Story = {
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
