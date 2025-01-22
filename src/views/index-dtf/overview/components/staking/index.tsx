import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import Swap from '@/components/ui/swap'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Minus, Plus } from 'lucide-react'
import { ReactNode } from 'react'
import SubmitStakeButton from './submit-stake-button'

const TABS = [
  {
    key: 'lock',
    label: 'Vote lock',
    icon: <Plus size={16} />,
  },
  {
    key: 'unlock',
    label: 'Unlock',
    icon: <Minus size={16} />,
  },
]

const Staking = ({ children }: { children: ReactNode }) => {
  return (
    <Drawer>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent>
        <Tabs
          defaultValue="lock"
          className="flex flex-col flex-grow overflow-hidden relative"
        >
          <DrawerTitle className="flex gap-2 mt-2 px-2 mb-2">
            <TabsList className="h-9">
              {TABS.map(({ key, label, icon }) => (
                <TabsTrigger
                  key={key}
                  value={key}
                  className="flex gap-1 items-center pl-2 pr-3 data-[state=active]:text-primary"
                >
                  {icon}
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>
          </DrawerTitle>
          <TabsContent
            value="lock"
            className="flex-grow overflow-auto p-2 mt-0"
          >
            <Swap
              from={{
                title: 'You lock:',
                price: '$10000',
                balance: '1000',
                onMax: () => console.log('max'),
              }}
              to={{
                title: 'You receive:',
                price: '$10000',
              }}
            />
          </TabsContent>
          <TabsContent value="unlock" className="overflow-auto p-2 mt-0">
            unlock
          </TabsContent>
        </Tabs>
        <DrawerFooter>
          <SubmitStakeButton />
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

export default Staking
