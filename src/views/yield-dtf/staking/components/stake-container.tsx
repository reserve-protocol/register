import { useLingui } from '@lingui/react/macro'
import TabMenu from 'components/tab-menu'
import { useMemo, useState } from 'react'
import { Minus, Plus } from 'lucide-react'
import { Card } from '@/components/ui/card'
import Stake from './stake'
import Unstake from './unstake'

const Header = ({
  isStaking,
  onChange,
  isDeprecated,
}: {
  onChange(isStaking: boolean): void
  isStaking: boolean
  isDeprecated: boolean
}) => {
  const { t } = useLingui()
  const menuOptions = useMemo(() => {
    const allOptions = [
      { key: 1, label: t`Stake`, icon: <Plus size={16} /> },
      { key: 0, label: t`Unstake`, icon: <Minus size={16} /> },
    ]
    return isDeprecated ? allOptions.filter((o) => o.key === 0) : allOptions
  }, [isDeprecated, t])

  return (
    <div className="flex items-center border-b border-border p-6">
      <TabMenu
        active={+isStaking}
        items={menuOptions}
        onMenuChange={(key) => onChange(!!key)}
      />
    </div>
  )
}

const StakeContainer = ({ isDeprecated = false }: { isDeprecated?: boolean }) => {
  const [isStaking, setIsStaking] = useState(!isDeprecated)

  return (
    <Card className="rounded-3xl bg-card shadow-lg">
      <Header isStaking={isStaking} onChange={setIsStaking} isDeprecated={isDeprecated} />
      {isStaking ? <Stake /> : <Unstake />}
    </Card>
  )
}

export default StakeContainer
