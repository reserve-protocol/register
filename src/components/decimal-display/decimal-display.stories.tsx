import type { Meta, StoryObj } from '@storybook/react'
import { DecimalDisplay } from '.'

const meta: Meta<typeof DecimalDisplay> = {
  title: 'Components/DecimalDisplay',
  component: DecimalDisplay,
  parameters: { layout: 'padded' },
}

export default meta
type Story = StoryObj<typeof DecimalDisplay>

export const Default: Story = {
  args: { value: 1234.56 },
}

export const TinyDecimal: Story = {
  render: () => (
    <div className="space-y-2 text-sm">
      <div className="flex items-center gap-4">
        <span className="w-32 text-muted-foreground">0.00001234</span>
        <DecimalDisplay value={0.00001234} />
      </div>
      <div className="flex items-center gap-4">
        <span className="w-32 text-muted-foreground">0.000000567</span>
        <DecimalDisplay value={0.000000567} />
      </div>
      <div className="flex items-center gap-4">
        <span className="w-32 text-muted-foreground">0.00000000089</span>
        <DecimalDisplay value={0.00000000089} />
      </div>
    </div>
  ),
}

export const Compact: Story = {
  render: () => (
    <div className="space-y-2 text-sm">
      <div className="flex items-center gap-4">
        <span className="w-20 text-muted-foreground">1,500</span>
        <DecimalDisplay value={1500} compact />
      </div>
      <div className="flex items-center gap-4">
        <span className="w-20 text-muted-foreground">2.3M</span>
        <DecimalDisplay value={2300000} compact />
      </div>
      <div className="flex items-center gap-4">
        <span className="w-20 text-muted-foreground">1.2B</span>
        <DecimalDisplay value={1200000000} compact />
      </div>
    </div>
  ),
}

export const NoCurrency: Story = {
  args: { value: 1234567.89, currency: false },
}

export const HighPrecision: Story = {
  args: { value: 1.005, decimals: 6, trimZeros: false },
}

export const Zero: Story = {
  args: { value: 0 },
}

export const Negative: Story = {
  args: { value: -42.5 },
}
