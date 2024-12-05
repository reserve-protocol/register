import * as React from 'react'
import { Minus, Plus } from 'lucide-react'
import { Bar, BarChart, ResponsiveContainer } from 'recharts'

import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'

const FTokenModal = () => {
  return (
    <Drawer direction="right">
      <DrawerTrigger asChild>
        <Button variant="outline">Open Drawer</Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="bg-zinc-50 h-full w-full grow p-5 flex flex-col rounded-[16px]">
          <div className="max-w-md mx-auto">
            <DrawerTitle className="font-medium mb-2 text-zinc-900">
              It supports all directions.
            </DrawerTitle>
            <DrawerDescription className="text-zinc-600 mb-2">
              This one specifically is not touching the edge of the screen, but
              that&apos;s not required for a side drawer.
            </DrawerDescription>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

export default FTokenModal
