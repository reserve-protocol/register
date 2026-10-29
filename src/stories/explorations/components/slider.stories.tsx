import { useArgs } from 'storybook/preview-api'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useEffect, useState } from 'react'
import { fireEvent, within } from 'storybook/test'

import { PlaygroundDocs } from '../../shared/playground-docs'
import { centeredStoryDecorator } from '../../shared/story-surface'
import { SliderExample, type SliderExampleProps } from './slider-example'

function InteractiveSliderExample({
  onValueChange,
  ...args
}: SliderExampleProps) {
  const [value, setValue] = useState(args.value)
  // Docs examples pin initial args, so the mounted specimen owns live interaction.
  useEffect(() => setValue(args.value), [args.value])
  return (
    <SliderExample
      {...args}
      value={value}
      onValueChange={(next) => {
        setValue(next)
        onValueChange?.(next)
      }}
    />
  )
}

const meta = {
  title: 'Explorations/Component proposals/Slider',
  id: 'explorations-components-slider',
  component: SliderExample,
  tags: ['autodocs'],
  args: { value: 50, disabled: false, exactEntry: false, step: 1 },
  argTypes: {
    value: { control: { type: 'number', min: 0, max: 100 } },
    step: { control: { type: 'number', min: 0.1, step: 0.1 } },
    exactEntry: {
      options: [false, true],
      control: {
        type: 'inline-radio',
        labels: { false: 'Value readout', true: 'Exact entry' },
      },
    },
    onValueChange: { control: false },
  },
  render: function Render(args) {
    const [, updateArgs] = useArgs()
    return (
      <InteractiveSliderExample
        {...args}
        onValueChange={(value) => updateArgs({ value })}
      />
    )
  },
  decorators: [centeredStoryDecorator],
  parameters: {
    layout: 'fullscreen',
    controls: { include: ['value', 'step', 'disabled', 'exactEntry'] },
    docs: {
      page: () => <PlaygroundDocs interactive={Playground} />,
      description: {
        component:
          '**Proposal for review.**\n\n- Use the slider for approximate adjustment; enable exact entry when a precise value matters.\n- Step defaults to 1. Set a positive step for another increment; the slider and input share the same bounds and step.\n- Invalid drafts retain the last valid value, with connected feedback below the control. A task where any in-range value is acceptable may instead clamp to the bounds on blur without a message, as the liquidity Dialog does.\n- The visible label names the number field and the slider; do not repeat it with `aria-label`.\n\nThe 0–100% bounds, label and white surface are example context.',
      },
    },
  },
} satisfies Meta<typeof SliderExample>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = { tags: ['!dev'] }
export const ExactEntry: Story = {
  name: 'Exact entry',
  args: { exactEntry: true },
}
export const Stepped: Story = { args: { exactEntry: true, step: 5 } }
export const InvalidEntry: Story = {
  name: 'Invalid entry',
  args: { exactEntry: true },
  parameters: { docs: { story: { autoplay: true } } },
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole('spinbutton', {
      name: 'Rebalance Percent',
    })
    await fireEvent.change(input, { target: { value: '101' } })
  },
}
export const Disabled: Story = { args: { exactEntry: true, disabled: true } }
