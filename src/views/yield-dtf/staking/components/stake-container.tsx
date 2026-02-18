import TabMenu from 'components/tab-menu'
import { useState } from 'react'
import { Minus, Plus } from 'lucide-react'
import { Card } from '@/components/ui/card'
import Stake from './stake'
import Unstake from './unstake'

const MenuOptions = [
  { key: 1, label: 'Stake', icon: <Plus size={16} /> },
  { key: 0, label: 'Unstake', icon: <Minus size={16} /> },
]

const Header = ({
  isStaking,
  onChange,
}: {
  onChange(isStaking: boolean): void
  isStaking: boolean
}) => {
  return (
    <div className="flex items-center border-b border-border p-6">
      <TabMenu
        active={+isStaking}
        items={MenuOptions}
        onMenuChange={(key) => onChange(!!key)}
      />
    </div>
  )
}

const StakeContainer = () => {
  const [isStaking, setIsStaking] = useState(true)

  return (
    <Card className="rounded-3xl bg-card shadow-lg">
      <Header isStaking={isStaking} onChange={setIsStaking} />
      {isStaking ? <Stake /> : <Unstake />}
    </Card>
  )
}

export default StakeContainer
