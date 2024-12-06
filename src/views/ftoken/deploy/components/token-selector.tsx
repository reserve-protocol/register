import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PlusIcon, XIcon } from 'lucide-react'

const OpenButton = () => (
  <DrawerTrigger asChild>
    <Button
      variant="outline-primary"
      className="flex gap-2 text-base pl-3 pr-4 py-5 rounded-xl"
    >
      <PlusIcon size={16} />
      Add collateral
    </Button>
  </DrawerTrigger>
)

const CloseButton = () => (
  <DrawerTrigger asChild className="w-max rounded-xl px-2 h-9">
    <Button variant="outline">
      <XIcon size={20} strokeWidth={1.5} />
    </Button>
  </DrawerTrigger>
)

const TokenSelector = () => {
  return (
    <div className="flex items-center justify-center h-80 border-t border-b border-border mb-2">
      <Drawer direction="right">
        <OpenButton />
        <DrawerContent className="fixed left-auto right-2 top-2 bottom-2 outline-none w-[500px] flex bg-transparent border-none mt-0">
          <div className="bg-card h-full w-full grow p-2 flex flex-col rounded-[16px]">
            <DrawerTitle className="flex gap-2">
              <CloseButton />
              <Tabs defaultValue="all">
                <TabsList className="h-9">
                  <TabsTrigger value="all" className="w-max h-7">
                    All
                  </TabsTrigger>
                  <TabsTrigger value="selected" className="w-max h-7">
                    Selected
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </DrawerTitle>
            <div>{/* content */}</div>
            <DrawerFooter className="p-0">Button</DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  )
}

export default TokenSelector
