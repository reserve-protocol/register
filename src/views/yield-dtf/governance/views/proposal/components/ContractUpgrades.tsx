import { Trans } from '@lingui/macro'
import { Button } from '@/components/ui/button'
import { Input } from 'components'
import { useAtom, useAtomValue } from 'jotai'
import { useState } from 'react'
import Skeleton from 'react-loading-skeleton'
import { rTokenContractsAtom } from 'state/atoms'
import { ContractKey } from 'state/rtoken/atoms/rTokenContractsAtom'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { capitalize } from 'utils/constants'
import { contractUpgradesAtom } from '../atoms'
import { isAddress } from 'utils'
import { Address } from 'viem'

interface IUpgradeContract {
  contract: string
  version: string
  className?: string
}

const EditContract = ({
  value,
  onSave,
  onDiscard,
}: {
  value: string
  onSave(value: Address): void
  onDiscard(): void
}) => {
  const [newContract, setContract] = useState(value)
  const formattedAddress = isAddress(newContract)

  return (
    <div className="mt-2">
      <Input
        placeholder="Upgrade to"
        value={newContract}
        onChange={(e) => setContract(e.target.value)}
      />
      <Button
        size="sm"
        className="mr-2 mt-2"
        disabled={!formattedAddress}
        onClick={() => formattedAddress && onSave(formattedAddress)}
      >
        Save
      </Button>
      <Button variant="destructive" size="sm" className="mt-2" onClick={onDiscard}>
        Discard
      </Button>
    </div>
  )
}

const UpgradeContract = ({ contract, version, className }: IUpgradeContract) => {
  const [upgrade, setUpgrade] = useState(false)
  const [upgrades, setUpgrades] = useAtom(contractUpgradesAtom)
  const currentUpgrade = upgrades[contract] ?? ''

  const handleUpgrade = (addr: Address) => {
    setUpgrades({ ...upgrades, [contract]: addr })
    setUpgrade(false)
  }

  const handleDiscard = () => {
    if (currentUpgrade) {
      delete upgrades[contract]
      setUpgrades({ ...upgrades })
    }
  }

  return (
    <div className={className}>
      <div className="flex items-center">
        <span className="mr-2 font-bold">
          {capitalize(contract)}
        </span>
        <span className="text-legend text-xs">
          (v{version})
        </span>
      </div>
      {!upgrade && (
        <>
          <span>{currentUpgrade}</span>
          <div>
            <Button
              variant="accent"
              size="sm"
              className="mt-2"
              onClick={() => setUpgrade(true)}
            >
              {currentUpgrade ? 'Edit' : 'Upgrade'}
            </Button>
            {currentUpgrade && (
              <Button
                variant="destructive"
                size="sm"
                className="ml-2 mt-2"
                onClick={handleDiscard}
              >
                Discard
              </Button>
            )}
          </div>
        </>
      )}
      {upgrade && (
        <EditContract
          value={currentUpgrade}
          onSave={handleUpgrade}
          onDiscard={() => setUpgrade(false)}
        />
      )}
    </div>
  )
}

const ContractUpgrades = ({ className }: { className?: string }) => {
  const contracts = useAtomValue(rTokenContractsAtom)
  const contractKeys = Object.keys(contracts || {})

  return (
    <Card className={`p-6 ${className ?? ''}`}>
      <span className="text-lg font-semibold">
        <Trans>Upgrade contracts</Trans>
      </span>
      <Separator className="my-6 -mx-6 w-[calc(100%+3rem)]" />
      {!contractKeys.length && <Skeleton count={5} height={60} />}
      {!!contracts &&
        contractKeys.map((contractKey) => (
          <UpgradeContract
            className="mb-4"
            key={contractKey}
            contract={contractKey}
            version={contracts[contractKey as ContractKey].version}
          />
        ))}
      <Separator className="my-6 -mx-6 w-[calc(100%+3rem)] border-muted-foreground/30" />
      <p className="text-legend text-xs mb-1 mr-2">
        <Trans>
          Upgrade contract implementations to a newer version. This is usually
          performed for a protocol update or bugfix.
        </Trans>
      </p>
    </Card>
  )
}

export default ContractUpgrades
