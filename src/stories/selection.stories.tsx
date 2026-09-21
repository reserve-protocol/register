import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { useArgs } from 'storybook/preview-api'

import { Checkbox } from '@/components/checkbox'
import { v1Typography } from '@/components/design-system-v1/typography'

const meta = {
  title: 'Components/Checkbox',
  parameters: {
    docs: {
      description: {
        component: '`@/components/checkbox`',
      },
    },
  },
  component: Checkbox,
  args: {
    'aria-label': 'Include governance assets',
    checked: false,
    disabled: false,
  },
  argTypes: {
    checked: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  render: function Render(args) {
    const [, updateArgs] = useArgs()
    return (
      <Checkbox
        {...args}
        onCheckedChange={(checked) => updateArgs({ checked })}
      />
    )
  },
} satisfies Meta<typeof Checkbox>

export default meta
type Story = StoryObj<typeof meta>

export const CheckboxPlayground: Story = {}

const SelectionStates = () => {
  const [checked, setChecked] = useState(true)

  return (
    <div className="space-y-8" data-testid="selection-story">
      <div className="flex flex-wrap gap-8">
        <label className="flex items-center gap-3">
          <Checkbox checked={checked} onCheckedChange={setChecked} />
          <span className={v1Typography.label}>Include governance assets</span>
        </label>
        <label className="flex items-center gap-3 text-muted-foreground">
          <Checkbox disabled defaultChecked />
          <span className={v1Typography.label}>Required setting</span>
        </label>
      </div>
    </div>
  )
}

export const States: Story = {
  parameters: { controls: { disable: true }, layout: 'padded' },
  render: () => <SelectionStates />,
}

export const DisabledOff: Story = { args: { disabled: true, checked: false } }
export const DisabledOn: Story = { args: { disabled: true, checked: true } }
