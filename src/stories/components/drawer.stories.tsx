import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from '@/components/button'
import {
  Drawer,
  DrawerBody,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/design-system-v1/drawer'
const meta = {
  title: 'Components/Drawer',
  component: DrawerContent,
  args: { dismissible: true },
  argTypes: { dismissible: { control: 'boolean' } },
  parameters: {
    docs: {
      description: {
        component: '`@/components/design-system-v1/drawer`',
      },
    },
  },
  render: (args) => (
    <Drawer>
      <DrawerTrigger asChild>
        <Button>Open details</Button>
      </DrawerTrigger>
      <DrawerContent {...args}>
        <DrawerHeader>
          <DrawerTitle>Transaction details</DrawerTitle>
          <DrawerDescription>
            Review the assets in this transaction.
          </DrawerDescription>
        </DrawerHeader>
        <DrawerBody className="px-4 py-4">
          <p>USDC · 1,250.00</p>
          <p>ETH · 0.42</p>
        </DrawerBody>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button className="w-full">Done</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
} satisfies Meta<typeof DrawerContent>
export default meta
type Story = StoryObj<typeof meta>
export const Playground: Story = {}
export const Mobile: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
}
export const LongContent: Story = {
  render: (args) => (
    <Drawer>
      <DrawerTrigger asChild>
        <Button>Open basket</Button>
      </DrawerTrigger>
      <DrawerContent {...args}>
        <DrawerHeader>
          <DrawerTitle>Current basket</DrawerTitle>
          <DrawerDescription>Assets used by this portfolio.</DrawerDescription>
        </DrawerHeader>
        <DrawerBody className="px-4">
          {[
            'Bitcoin',
            'Ether',
            'Solana',
            'BNB',
            'XRP',
            'Dogecoin',
            'Cardano',
            'Chainlink',
            'Avalanche',
            'Sui',
            'Stellar',
            'Hedera',
            'Litecoin',
            'Polkadot',
            'Uniswap',
            'Aave',
            'Near',
            'Aptos',
            'Internet Computer',
            'USD Coin',
          ].map((name) => (
            <div key={name} className="border-b border-border py-4">
              {name}
            </div>
          ))}
        </DrawerBody>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button className="w-full">Done</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
}
