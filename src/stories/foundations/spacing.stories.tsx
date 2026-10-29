import type { Meta, StoryObj } from '@storybook/react-vite'
import { FoundationPrimaryResult } from './reference/foundation-documentation-results'
import {
  foundationDecorators,
  foundationParameters,
} from './reference/foundation-story'

const meta = {
  title: 'Foundations/Spacing',
  tags: ['!autodocs'],
  parameters: foundationParameters,
  decorators: foundationDecorators,
} satisfies Meta
export default meta

export const Spacing: StoryObj<typeof meta> = {
  render: () => <FoundationPrimaryResult foundationId="spacing" />,
}
