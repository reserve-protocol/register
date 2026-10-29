import { useState } from 'react'
import { PlaygroundDocs } from '../shared/playground-docs'
import { TokenAddresses } from '../navigation/design-reference'
import { DTF_FIXTURES } from '../navigation/navigation-review-fixtures'
import { MobileProductNavigationPanel } from '../navigation/product-navigation-patterns'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from '@/components/button'
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
  type DrawerContentProps,
} from '@/components/design-system-v1/drawer'

const product = DTF_FIXTURES[0]

const PhoneDrawer = ({
  dismissible,
  switcher,
}: Pick<DrawerContentProps, 'dismissible'> & { switcher: boolean }) => {
  const [open, setOpen] = useState(false)
  const [container, setContainer] = useState<HTMLDivElement | null>(null)
  const label = switcher ? 'Switch DTF' : `${product.symbol} pages`

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <div
        ref={setContainer}
        className="relative mx-auto h-[560px] w-[390px] max-w-full overflow-hidden border border-border bg-secondary"
      >
        <div className="absolute inset-x-5 bottom-5 flex justify-center">
          <DrawerTrigger asChild>
            <Button>{label}</Button>
          </DrawerTrigger>
        </div>
      </div>
      <DrawerContent
        aria-describedby={undefined}
        aria-label={label}
        dismissible={dismissible}
        placement="contained-bottom"
        portalContainer={container}
      >
        <MobileProductNavigationPanel
          product={product}
          isSwitcherOpen={switcher}
          onDtfSelect={() => setOpen(false)}
          onPageSelect={() => setOpen(false)}
          supplementary={<TokenAddresses product={product} />}
        />
      </DrawerContent>
    </Drawer>
  )
}

const meta = {
  title: 'Components/Feedback and overlays/Drawer',
  component: DrawerContent,
  args: { dismissible: true },
  argTypes: { dismissible: { control: 'boolean' } },
  parameters: {
    docs: {
      page: () => <PlaygroundDocs interactive={Playground} />,
      description: {
        component:
          '`@/components/design-system-v1/drawer` · Only for the mobile navigation panels: the global menu, DTF switcher and page navigation. Callers close it at the 1024px desktop breakpoint. Below 640px it is a bottom sheet; from 640px it becomes, like Dialog, a centered 432px modal at most 640px tall, with long menus scrolling under the overflow fade. There is no desktop Drawer or slide-out in V1: a modal task uses Dialog. These examples render in a phone frame, so they always show the bottom sheet.',
      },
    },
  },
  render: (args) => (
    <PhoneDrawer dismissible={args.dismissible} switcher={false} />
  ),
} satisfies Meta<typeof DrawerContent>
export default meta
type Story = StoryObj<typeof meta>
export const Playground: Story = {
  tags: ['!dev'],
}
export const LongContent: Story = {
  name: 'Long list: DTF switcher',
  render: (args) => <PhoneDrawer dismissible={args.dismissible} switcher />,
}
