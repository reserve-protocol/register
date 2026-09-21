import type { Meta, StoryObj } from '@storybook/react-vite'
import InformationRow from './reference/information-row'
const meta = {
  title: 'Patterns/Information row',
  component: InformationRow,
  parameters: {
    layout: 'padded',
    controls: { disable: true },
    docs: {
      description: {
        component: 'Holdings row with token identity and value.',
      },
    },
  },
} satisfies Meta<typeof InformationRow>
export default meta
type Story = StoryObj<typeof meta>
export const Holdings: Story = {}
export const Narrow: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
}
