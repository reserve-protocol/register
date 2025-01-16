import { t } from '@lingui/macro'
import { Button } from 'components'
import { useAtom } from 'jotai'
import { Box, BoxProps, Text } from 'theme-ui'
import { shortenAddress } from 'utils'
import { capitalize } from 'utils/constants'
import { contractUpgradesAtom } from '../atoms'
import PreviewBox from './PreviewBox'

const ContractUpgradesPreview = (props: BoxProps) => {
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
      variant="layout.borderBox"
      count={contracts.length}
      title={t`Contract upgrades`}
      {...props}
    >
      {contracts.map((contract) => (
        <Box key={contract} variant="layout.verticalAlign" mt={3}>
          <Box>
            <Text variant="bold">{capitalize(contract)}</Text>
            <Text variant="legend">{shortenAddress(upgrades[contract])}</Text>
          </Box>
          <Button
            ml="auto"
            variant="muted"
            small
            onClick={() => handleRevert(contract)}
          >
            Revert
          </Button>
        </Box>
      ))}
    </PreviewBox>
  )
}

export default ContractUpgradesPreview
