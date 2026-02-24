import type { Meta, StoryObj } from '@storybook/react'
import { Textarea } from './textarea'

const meta: Meta<typeof Textarea> = {
  title: 'UI/Textarea',
  component: Textarea,

}

export default meta
type Story = StoryObj<typeof Textarea>

export const Default: Story = {
  args: { placeholder: 'Type your message here.' },
}

export const Disabled: Story = {
  args: { placeholder: 'Disabled textarea', disabled: true },
}

export const WithValue: Story = {
  args: {
    defaultValue:
      'This RToken aims to provide a stable, yield-bearing digital dollar backed by a diversified basket of collateral.',
  },
}
