import type { Meta, StoryObj } from '@storybook/react-vite'
import MotionStudy from './reference/motion-study'
import {
  foundationDecorators,
  foundationParameters,
} from './reference/foundation-story'

const meta = {
  title: 'Foundations/Motion',
  tags: ['!autodocs'],
  parameters: foundationParameters,
  decorators: foundationDecorators,
} satisfies Meta
export default meta

export const Motion: StoryObj<typeof meta> = {
  render: () => <MotionStudy />,
}
