import type { Meta, StoryObj } from '@storybook/react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs'

const meta: Meta<typeof Tabs> = {
  title: 'UI/Tabs',
  component: Tabs,

}

export default meta
type Story = StoryObj<typeof Tabs>

export const Default: Story = {
  render: () => (
    <Tabs defaultValue="overview" className="w-96">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="staking">Staking</TabsTrigger>
        <TabsTrigger value="governance">Governance</TabsTrigger>
      </TabsList>
      <TabsContent value="overview" className="p-4">
        <p className="text-sm">Overview content goes here.</p>
      </TabsContent>
      <TabsContent value="staking" className="p-4">
        <p className="text-sm">Staking content goes here.</p>
      </TabsContent>
      <TabsContent value="governance" className="p-4">
        <p className="text-sm">Governance content goes here.</p>
      </TabsContent>
    </Tabs>
  ),
}

export const TwoTabs: Story = {
  render: () => (
    <Tabs defaultValue="mint" className="w-64">
      <TabsList>
        <TabsTrigger value="mint">Mint</TabsTrigger>
        <TabsTrigger value="redeem">Redeem</TabsTrigger>
      </TabsList>
      <TabsContent value="mint" className="p-4">
        <p className="text-sm">Mint your tokens here.</p>
      </TabsContent>
      <TabsContent value="redeem" className="p-4">
        <p className="text-sm">Redeem your tokens here.</p>
      </TabsContent>
    </Tabs>
  ),
}

export const WithDisabledTab: Story = {
  render: () => (
    <Tabs defaultValue="overview" className="w-96">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="staking">Staking</TabsTrigger>
        <TabsTrigger value="governance" disabled>
          Governance
        </TabsTrigger>
      </TabsList>
      <TabsContent value="overview" className="p-4">
        <p className="text-sm">Overview content.</p>
      </TabsContent>
      <TabsContent value="staking" className="p-4">
        <p className="text-sm">Staking content.</p>
      </TabsContent>
    </Tabs>
  ),
}

export const ManyTabs: Story = {
  render: () => (
    <Tabs defaultValue="basket" className="w-[500px]">
      <TabsList>
        <TabsTrigger value="basket">Basket</TabsTrigger>
        <TabsTrigger value="backing">Backing</TabsTrigger>
        <TabsTrigger value="revenue">Revenue</TabsTrigger>
        <TabsTrigger value="staking">Staking</TabsTrigger>
        <TabsTrigger value="governance">Governance</TabsTrigger>
      </TabsList>
      <TabsContent value="basket" className="p-4">
        <p className="text-sm">Basket composition</p>
      </TabsContent>
    </Tabs>
  ),
}
