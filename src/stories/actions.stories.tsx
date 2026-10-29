import { v1Typography } from '@/components/design-system-v1/typography'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Heading, Markdown } from '@storybook/addon-docs/blocks'
import { ArrowRight, Pencil, Plus, Trash2 } from 'lucide-react'
import type { ReactNode } from 'react'

import { Button, type ButtonSize, type ButtonTone } from '@/components/button'

import { OverviewDocs } from './shared/overview-docs'

const examples: {
  label: string
  tone: ButtonTone
  text: string
  icon?: ReactNode
}[] = [
  {
    label: 'Primary',
    tone: 'primary',
    text: 'Create',
    icon: <Plus aria-hidden="true" />,
  },
  {
    label: 'Secondary',
    tone: 'secondary',
    text: 'Edit',
    icon: <Pencil aria-hidden="true" />,
  },
  { label: 'Quiet', tone: 'quiet', text: 'Details' },
  {
    label: 'Destructive',
    tone: 'destructive',
    text: 'Delete',
    icon: <Trash2 aria-hidden="true" />,
  },
]

const sizes: { label: string; value: ButtonSize }[] = [
  { label: 'Micro', value: 'micro' },
  { label: 'Compact', value: 'compact' },
  { label: 'Default', value: 'default' },
]

const meta = {
  title: 'Components/Actions/Button',
  tags: ['autodocs', '!dev'],
  parameters: {
    docs: {
      page: () => (
        <OverviewDocs
          overview={System}
          interactive={InteractiveExample}
          details={<ButtonDetails />}
        />
      ),
      description: {
        component:
          '`@/components/button` · Tones are primary, secondary, quiet and destructive; sizes are micro (28px), compact (32px) and default (44px). Buttons are intrinsic width; do not stretch compact actions to fill a container. Loading keeps hierarchy, tone and height and shows a leading spinner. A destructive confirmation pairs with an explicit safe exit.',
      },
    },
  },
  component: Button,
  args: {
    children: 'Continue',
    disabled: false,
    loading: false,
    size: 'default',
    tone: 'primary',
  },
  argTypes: {
    disabled: { control: 'boolean' },
    loading: { control: 'boolean' },
    size: { control: 'inline-radio', options: ['micro', 'compact', 'default'] },
    tone: {
      control: 'inline-radio',
      options: ['primary', 'secondary', 'quiet', 'destructive'],
    },
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

const ButtonDetails = () => (
  <>
    <Heading>Size and spacing</Heading>
    <Markdown>{`| Size | Minimum height | Side padding | Icon gap |
| --- | ---: | ---: | ---: |
| Micro | 28px | 10px | 6px |
| Compact | 32px | 14px | 8px |
| Default | 44px | 24px | 8px |

- Buttons keep their natural width. Padding at an icon edge is 2px smaller than the table value.
- Disabled blocks activation. Loading also sets \`aria-busy\`, shows a leading spinner (replacing a leading icon when there is one), and blocks repeat activation. Height and tone stay fixed; width follows the loading label.
- Use action-specific loading text. Destructive confirmations need an explicit safe exit.`}</Markdown>
  </>
)

export const System: Story = {
  parameters: { controls: { disable: true }, layout: 'padded' },
  render: () => (
    <div className="space-y-8 bg-background p-4 text-foreground">
      <div className="w-full overflow-x-auto">
        <table className="w-auto min-w-[680px] border-collapse text-left">
          <thead>
            <tr className="border-b border-border">
              <th className="w-28 px-3 py-3 text-xs font-medium text-muted-foreground">
                Size
              </th>
              {examples.map((example) => (
                <th
                  key={example.tone}
                  className="px-3 py-3 text-xs font-medium text-muted-foreground"
                  scope="col"
                >
                  {example.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sizes.map((size) => (
              <tr key={size.value} className="border-b border-border">
                <th className="px-3 py-4 text-sm font-medium" scope="row">
                  {size.label}
                </th>
                {examples.map((example) => (
                  <td key={example.tone} className="px-3 py-4">
                    <Button
                      leadingIcon={example.icon}
                      size={size.value}
                      tone={example.tone}
                    >
                      {example.text}
                    </Button>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="space-y-3">
        <h2 className={v1Typography.label}>States · default size</h2>
        <div className="flex flex-wrap gap-8">
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Disabled</p>
            <Button disabled leadingIcon={<Plus aria-hidden="true" />}>
              Create
            </Button>
          </div>
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Quiet disabled</p>
            <Button tone="quiet" disabled>
              Cancel
            </Button>
          </div>
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Loading</p>
            <Button loading>Creating</Button>
          </div>
        </div>
      </div>
      <div className="space-y-3">
        <h2 className={v1Typography.label}>Icon placement</h2>
        <div className="flex flex-wrap items-center gap-4">
          <Button leadingIcon={<Plus aria-hidden="true" />}>Create</Button>
          <Button trailingIcon={<ArrowRight aria-hidden="true" />}>
            Continue
          </Button>
        </div>
      </div>
    </div>
  ),
}

export const InteractiveExample: Story = { name: 'Interactive example' }
