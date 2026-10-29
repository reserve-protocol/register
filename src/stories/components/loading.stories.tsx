import {
  IdentityCell,
  NumericCell,
  PerformanceCell,
} from '../patterns/market/reference/table-family/cells'
import { PlaygroundDocs } from '../shared/playground-docs'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Skeleton, Spinner } from '@/components/design-system-v1/loading'
import { v1LayoutRecipes as layout } from '@/components/ui/v1-layout-recipes'
import { ChainId } from '@/utils/chains'
import { cn } from '@/lib/utils'
const meta = {
  title: 'Components/Feedback and overlays/Loading',
  component: Spinner,
  args: { size: 16, label: 'Loading balances' },
  argTypes: { size: { control: 'inline-radio', options: [14, 16, 24] } },
  parameters: {
    docs: {
      page: () => <PlaygroundDocs interactive={SpinnerPlayground} />,
      description: {
        component:
          "`@/components/design-system-v1/loading` · Skeleton preserves the shape of unresolved content so nothing shifts when it arrives; Spinner signals an active operation. Size each bar to the line of text it replaces: a single-line value fills its line (24px for 16px text). When lines stack, or a bar shares its line with visible text, the bar takes the text size centered in its line (16px in 24px, 12px in 20px), so lines stay separate. Table loading reuses the table's own cells. A known percentage belongs to the proposed Progress indicator, which is still under review.",
      },
    },
  },
} satisfies Meta<typeof Spinner>
export default meta
type Story = StoryObj<typeof meta>
export const SpinnerPlayground: Story = {
  name: 'Spinner playground',
  tags: ['!dev'],
}
export const Text: Story = {
  render: () => (
    <div role="status" aria-label="Loading description" className="w-64">
      <div className="flex h-6 items-center">
        <Skeleton className="h-4 w-2/3" />
      </div>
      <div className="flex h-5 items-center">
        <Skeleton className="h-3 w-full" />
      </div>
      <div className="flex h-5 items-center">
        <Skeleton className="h-3 w-5/6" />
      </div>
    </div>
  ),
}
export const Record: Story = {
  render: () => (
    <div role="status" aria-label="Loading record" className="w-64">
      <IdentityCell name="" symbol="" chain={ChainId.Mainnet} loading />
    </div>
  ),
}
export const Table: Story = {
  render: () => (
    <div
      role="status"
      aria-label="Loading table"
      className={cn('w-[min(40rem,90vw)]', layout.stack.completeGroups)}
    >
      {Array.from({ length: 5 }, (_, i) => (
        <div
          key={i}
          className={cn('flex items-center', layout.cluster.completeGroups)}
        >
          <IdentityCell name="" symbol="" chain={ChainId.Mainnet} loading />
          <div className="w-20">
            <NumericCell value={null} loading />
          </div>
          <div className="w-16">
            <PerformanceCell value={null} loading />
          </div>
        </div>
      ))}
    </div>
  ),
}
