import { PlaygroundDocs } from './shared/playground-docs'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { useArgs } from 'storybook/preview-api'

import { Checkbox } from '@/components/checkbox'
import { v1Typography } from '@/components/design-system-v1/typography'
import { cn } from '@/lib/utils'

const meta = {
  title: 'Components/Fields and selection/Checkbox',
  parameters: {
    docs: {
      page: () => <PlaygroundDocs interactive={CheckboxPlayground} />,
      description: {
        component:
          '`@/components/checkbox` · An independent yes/no choice, usually submitted with a form. Wrap the box and its label in one label element so both toggle it. The label sits 12px from the 28px target; for a single-line label, center them. A label that wraps aligns the box with its first line: start-align the row and pad the 16px/24px label by 2px. Disabled boxes keep their label and state visible. For an immediate on/off setting, use Switch.',
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

export const CheckboxPlayground: Story = {
  name: 'Playground',
  tags: ['!dev'],
}

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
          <Checkbox disabled />
          <span className={v1Typography.label}>Unavailable setting</span>
        </label>
        <label className="flex items-center gap-3 text-muted-foreground">
          <Checkbox disabled defaultChecked />
          <span className={v1Typography.label}>Required setting</span>
        </label>
      </div>
      <label className="flex max-w-sm items-start gap-3">
        <Checkbox defaultChecked />
        <span className={cn(v1Typography.body, 'pt-0.5')}>
          Notify me when this proposal reaches quorum and again when voting
          closes.
        </span>
      </label>
    </div>
  )
}

export const States: Story = {
  parameters: { controls: { disable: true }, layout: 'padded' },
  render: () => <SelectionStates />,
}
