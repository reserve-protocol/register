import { Button } from '@/components/ui/button'
import { PlusIcon } from 'lucide-react'
import { useState } from 'react'
import FTokenModal from './ftoken-modal'

const FTokenSelector = () => {
  const [openModal, setOpenModal] = useState(false)

  return (
    <div className="flex items-center justify-center h-80 border-t border-b border-border mb-2">
      <Button
        variant="outline-primary"
        className="flex gap-2 text-base pl-3 pr-4 py-5 rounded-xl"
      >
        <PlusIcon size={16} />
        Add collateral
      </Button>
      <FTokenModal />
    </div>
  )
}

export default FTokenSelector
