import { PlaygroundDocs } from '../shared/playground-docs'
import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/design-system-v1/tabs'
import { v1SemanticRoles as roles } from '@/components/design-system-v1/semantic-roles'
import { v1Typography } from '@/components/design-system-v1/typography'
import { cn } from '@/lib/utils'

const panel = cn(
  'mt-4 p-6',
  roles.surface.content,
  roles.text.supporting,
  v1Typography.supporting
)
const meta = {
  title: 'Components/Navigation and disclosure/Tabs',
  component: TabsList,
  args: { size: 'default', width: 'intrinsic' },
  argTypes: {
    size: {
      control: 'inline-radio',
      options: ['compact', 'default'],
      description: 'Compact is 32px high; default is 44px high.',
      table: { defaultValue: { summary: 'default' } },
    },
    width: {
      control: 'inline-radio',
      options: ['intrinsic', 'full'],
      description:
        'Intrinsic wraps its labels; full gives peer tabs equal width.',
      table: { defaultValue: { summary: 'intrinsic' } },
    },
  },
  parameters: {
    docs: {
      page: () => <PlaygroundDocs interactive={Playground} />,
      description: {
        component:
          '`@/components/design-system-v1/tabs` · Use Tabs to switch content panels. For an immediate choice that does not switch panels, use Segmented control.',
      },
    },
  },
  render: (args) => (
    <Tabs defaultValue="exposure" className="w-[min(32rem,90vw)]">
      <TabsList {...args} aria-label="Holdings view">
        <TabsTrigger value="exposure">Exposure</TabsTrigger>
        <TabsTrigger value="collateral">Collateral</TabsTrigger>
        <TabsTrigger value="history" disabled>
          History
        </TabsTrigger>
      </TabsList>
      <TabsContent value="exposure" className={panel}>
        Exposure panel
      </TabsContent>
      <TabsContent value="collateral" className={panel}>
        Collateral panel
      </TabsContent>
    </Tabs>
  ),
} satisfies Meta<typeof TabsList>
export default meta
type Story = StoryObj<typeof meta>
export const Playground: Story = {
  tags: ['!dev'],
}
export const Compact: Story = { args: { size: 'compact' } }
export const FullWidth: Story = {
  name: 'Full width',
  args: { width: 'full' },
}
