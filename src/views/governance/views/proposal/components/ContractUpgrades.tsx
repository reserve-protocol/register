import { Trans } from '@lingui/macro'
import { Button, Input } from 'components'
import { useAtom, useAtomValue } from 'jotai'
import { useState } from 'react'
import Skeleton from 'react-loading-skeleton'
import { rTokenContractsAtom } from 'state/atoms'
import { ContractKey } from 'state/rtoken/atoms/rTokenContractsAtom'
import { Box, BoxProps, Card, Divider, Text } from 'theme-ui'
import { capitalize } from 'utils/constants'
import { contractUpgradesAtom } from '../atoms'
import { isAddress } from 'utils'
import { Address } from 'viem'

interface IUpgradeContract extends BoxProps {
  contract: string
  version: string
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
    <Box mt={2}>
      <Input
        placeholder="Upgrade to"
        value={newContract}
        onChange={setContract}
      />
      <Button
        mr={2}
        mt={2}
        small
        disabled={!formattedAddress}
        onClick={() => formattedAddress && onSave(formattedAddress)}
      >
        Save
      </Button>
      <Button variant="danger" mt={2} small onClick={onDiscard}>
        Discard
      </Button>
    </Box>
  )
}

const UpgradeContract = ({ contract, version, ...props }: IUpgradeContract) => {
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
    <Box {...props}>
      <Box variant="layout.verticalAlign">
        <Text mr={2} variant="bold">
          {capitalize(contract)}
        </Text>
        <Text variant="legend" sx={{ fontSize: 1 }}>
          (v{version})
        </Text>
      </Box>
      {!upgrade && (
        <>
          <Text>{currentUpgrade}</Text>
          <Box>
            <Button
              variant="accentAction"
              mt={2}
              small
              onClick={() => setUpgrade(true)}
            >
              {currentUpgrade ? 'Edit' : 'Upgrade'}
            </Button>
            {currentUpgrade && (
              <Button
                ml={2}
                variant="danger"
                mt={2}
                small
                onClick={handleDiscard}
              >
                Discard
              </Button>
            )}
          </Box>
        </>
      )}
      {upgrade && (
        <EditContract
          value={currentUpgrade}
          onSave={handleUpgrade}
          onDiscard={() => setUpgrade(false)}
        />
      )}
    </Box>
  )
}

const ContractUpgrades = (props: BoxProps) => {
  const contracts = useAtomValue(rTokenContractsAtom)
  const contractKeys = Object.keys(contracts || {})

  return (
    <Card {...props} p={4}>
      <Text variant="sectionTitle">
        <Trans>Upgrade contracts</Trans>
      </Text>
      <Divider my={4} mx={-4} />
      {!contractKeys.length && <Skeleton count={5} height={60} />}
      {!!contracts &&
        contractKeys.map((contractKey) => (
          <UpgradeContract
            mb={3}
            key={contractKey}
            contract={contractKey}
            version={contracts[contractKey as ContractKey].version}
          />
        ))}
      <Divider my={4} mx={-4} sx={{ borderColor: 'darkBorder' }} />
      <Text variant="legend" as="p" sx={{ fontSize: 1 }} mb={1} mr={2}>
        <Trans>
          Upgrade contract implementations to a newer version. This is usually
          performed for a protocol update or bugfix.
        </Trans>
      </Text>
    </Card>
  )
}

export default ContractUpgrades
