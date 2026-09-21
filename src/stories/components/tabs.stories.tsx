import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/design-system-v1/tabs'
const meta = {
  title: 'Components/Tabs',
  component: TabsList,
  args: { size: 'default', width: 'intrinsic' },
  argTypes: {
    size: { control: 'inline-radio', options: ['compact', 'default'] },
    width: { control: 'inline-radio', options: ['intrinsic', 'full'] },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Import Tabs, TabsList, TabsTrigger and TabsContent from @/components/design-system-v1/tabs. Arrow keys move between available panels; disabled tabs are skipped.',
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
      <TabsContent value="exposure" className="pt-6">
        Portfolio exposure
      </TabsContent>
      <TabsContent value="collateral" className="pt-6">
        Underlying collateral
      </TabsContent>
    </Tabs>
  ),
} satisfies Meta<typeof TabsList>
export default meta
type Story = StoryObj<typeof meta>
export const Playground: Story = {}
export const Compact: Story = { args: { size: 'compact' } }
export const FullWidth: Story = { args: { width: 'full' } }
