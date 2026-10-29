import { PlaygroundDocs } from '../shared/playground-docs'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useArgs } from 'storybook/preview-api'

import { Switch } from '@/components/design-system-v1/switch'

const meta = {
  title: 'Components/Fields and selection/Switch',
  parameters: {
    docs: {
      page: () => <PlaygroundDocs interactive={Playground} />,
      description: {
        component:
          '`@/components/design-system-v1/switch` · An immediate on/off setting: a 36×20px track with a 16px thumb. A labelled row owns the 44px target and the 8px switch-to-label gap. Disabled keeps its on/off value through thumb position, not colour or opacity. Use Checkbox for a value submitted with a form.',
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

export const Playground: Story = {
  tags: ['!dev'],
}

export const Disabled: Story = {
  name: 'Disabled on',
  args: { checked: true, disabled: true },
}

export const DisabledOff: Story = {
  name: 'Disabled off',
  args: { checked: false, disabled: true },
}
