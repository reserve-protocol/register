import type { Meta, StoryObj } from '@storybook/react-vite'
import { useArgs } from 'storybook/preview-api'

import { Switch } from '@/components/design-system-v1/switch'

const meta = {
  title: 'Components/Switch',
  parameters: {
    docs: {
      description: {
        component:
          'Import Switch from @/components/design-system-v1/switch. Use for an immediate binary setting and provide an accessible name.',
      },
    },
  },
  component: Switch,
  args: {
    'aria-label': 'Show balances',
    checked: false,
    disabled: false,
  },
  argTypes: {
    onCheckedChange: { control: false },
  },
  render: function Render(args) {
    const [, updateArgs] = useArgs()
    return (
      <Switch
        {...args}
        onCheckedChange={(checked) => updateArgs({ checked })}
      />
    )
  },
} satisfies Meta<typeof Switch>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const Disabled: Story = {
  args: { checked: true, disabled: true },
}
