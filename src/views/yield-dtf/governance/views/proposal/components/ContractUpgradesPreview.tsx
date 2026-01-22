import { t } from '@lingui/macro'
import { Button } from '@/components/ui/button'
import { useAtom } from 'jotai'
import { cn } from '@/lib/utils'
import { shortenAddress } from 'utils'
import { capitalize } from 'utils/constants'
import { contractUpgradesAtom } from '../atoms'
import PreviewBox from './PreviewBox'

interface Props {
  className?: string
}

const ContractUpgradesPreview = ({ className }: Props) => {
  const [upgrades, setUpgrades] = useAtom(contractUpgradesAtom)
  const contracts = Object.keys(upgrades)

  const handleRevert = (contract: string) => {
    setUpgrades((prev) => {
      const next = { ...prev }
      delete next[contract]
      return next
    })
  }

  if (!contracts.length) {
    return null
  }

  return (
    <PreviewBox
      className={cn('border border-border rounded-xl p-6', className)}
      count={contracts.length}
      title={t`Contract upgrades`}
    >
      {contracts.map((contract) => (
        <div key={contract} className="flex items-center mt-4">
          <div>
            <span className="font-bold">{capitalize(contract)}</span>
            <span className="text-legend block">{shortenAddress(upgrades[contract])}</span>
          </div>
          <Button
            className="ml-auto"
            variant="muted"
            size="sm"
            onClick={() => handleRevert(contract)}
          >
            Revert
          </Button>
        </div>
      ))}
    </PreviewBox>
  )
}

export default ContractUpgradesPreview
