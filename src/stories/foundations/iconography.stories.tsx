import type { Meta, StoryObj } from '@storybook/react-vite'
import IconographyStudy from './reference/iconography-study'
import {
  foundationDecorators,
  foundationParameters,
} from './reference/foundation-story'

const meta = {
  title: 'Foundations/Iconography',
  tags: ['!autodocs'],
  parameters: foundationParameters,
  decorators: foundationDecorators,
} satisfies Meta
export default meta

export const Iconography: StoryObj<typeof meta> = {
  render: () => <IconographyStudy />,
}
