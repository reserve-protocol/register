import { Button } from '@/components/ui/button'
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer'
import { PlusIcon } from 'lucide-react'

const FTokenSelector = () => {
  return (
    <div className="flex items-center justify-center h-80 border-t border-b border-border mb-2">
      <Drawer direction="right">
        <DrawerTrigger asChild>
          <Button
            variant="outline-primary"
            className="flex gap-2 text-base pl-3 pr-4 py-5 rounded-xl"
          >
            <PlusIcon size={16} />
            Add collateral
          </Button>
        </DrawerTrigger>
        <DrawerContent className="fixed left-auto right-2 top-2 bottom-2 outline-none w-[310px] flex bg-transparent border-none mt-0">
          <div className="bg-card h-full w-full grow p-5 flex flex-col rounded-[16px]">
            FTokens
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  )
}

export default FTokenSelector
