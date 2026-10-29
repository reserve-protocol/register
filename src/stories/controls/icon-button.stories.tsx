import type { Meta, StoryObj } from '@storybook/react-vite'
import { MoreHorizontal } from 'lucide-react'

import type { ButtonSize, ButtonTone } from '@/components/button'
import { IconButton } from '@/components/icon-button'

import { StateMatrix } from '../shared/state-matrix'
import { OverviewDocs } from '../shared/overview-docs'

const tones: { label: string; value: ButtonTone }[] = [
  { label: 'Primary', value: 'primary' },
  { label: 'Secondary', value: 'secondary' },
  { label: 'Quiet', value: 'quiet' },
  { label: 'Destructive', value: 'destructive' },
]

const sizes: { label: string; value: ButtonSize }[] = [
  { label: 'Micro', value: 'micro' },
  { label: 'Compact', value: 'compact' },
  { label: 'Default', value: 'default' },
]

const meta = {
  title: 'Components/Actions/Icon button',
  tags: ['autodocs', '!dev'],
  parameters: {
    docs: {
      page: () => (
        <OverviewDocs overview={System} interactive={InteractiveExample} />
      ),
      description: {
        component:
          '`@/components/icon-button` · A square icon-only action in the same tones and sizes as Button (28, 32 and 44px). Every icon button needs an accessible `label`; a tooltip is supplementary, never the name. A close action matches its row: quiet beside a title or icon, bordered beside bordered controls. Use it instead of an icon-only Button with copied sizing.',
      },
    },
  },
  component: IconButton,
  args: {
    disabled: false,
    loading: false,
    icon: <MoreHorizontal aria-hidden="true" />,
    label: 'More actions',
    size: 'compact',
    tone: 'secondary',
  },
  argTypes: {
    icon: { control: false },
    size: { control: 'inline-radio', options: ['micro', 'compact', 'default'] },
    tone: {
      control: 'inline-radio',
      options: ['primary', 'secondary', 'quiet', 'destructive'],
    },
  },
} satisfies Meta<typeof IconButton>

export default meta
type Story = StoryObj<typeof meta>

export const System: Story = {
  parameters: { controls: { disable: true }, layout: 'padded' },
  render: () => (
    <StateMatrix
      columns={tones.map((tone) => tone.label)}
      groups={sizes.map((size) => ({
        label: size.label,
        rows: [
          {
            label: 'Default',
            cells: tones.map((tone) => (
              <IconButton
                key={tone.value}
                icon={<MoreHorizontal aria-hidden="true" />}
                label={`${tone.label} ${size.label} default`}
                size={size.value}
                tone={tone.value}
              />
            )),
          },
          {
            label: 'Disabled',
            cells: tones.map((tone) => (
              <IconButton
                key={tone.value}
                disabled
                icon={<MoreHorizontal aria-hidden="true" />}
                label={`${tone.label} ${size.label} disabled`}
                size={size.value}
                tone={tone.value}
              />
            )),
          },
          {
            label: 'Loading',
            cells: tones.map((tone) => (
              <IconButton
                key={tone.value}
                icon={<MoreHorizontal aria-hidden="true" />}
                label={`${tone.label} ${size.label} loading`}
                loading
                size={size.value}
                tone={tone.value}
              />
            )),
          },
        ],
      }))}
    />
  ),
}

export const InteractiveExample: Story = { name: 'Interactive example' }
