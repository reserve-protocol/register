import { t, Trans } from '@lingui/macro'
import { InfoItem } from 'components/info-box'
import { useAtomValue } from 'jotai'
import { rTokenContractsAtom } from 'state/atoms'
import { BoxProps, Card, Text } from 'theme-ui'
import { shortenAddress } from 'utils'

/**
 * View: Settings > Display RToken related contracts
 */
const ContractsInfo = (props: BoxProps) => {
  const contracts = useAtomValue(rTokenContractsAtom)
  const contractList = [
    [t`Main`, 'main'],
    [t`Backing Manager`, 'backingManager'],
    [t`RToken Trader`, 'rTokenTrader'],
    [t`Broker`, 'broker'],
    [t`Asset Registry`, 'assetRegistry'],
    [t`Staking token`, 'stRSR'],
    [t`Furnace`, 'furnace'],
    [t`Distributor`, 'distributor'],
    [t`RToken Asset`, 'rTokenAsset'],
  ]

  return (
    <Card p={4} {...props}>
      <Text variant="sectionTitle" mb={5}>
        <Trans>Related contracts</Trans>
      </Text>
      {contractList.map(([label, prop], index) => (
        <InfoItem
          key={label}
          title={label}
          subtitle={shortenAddress(contracts[prop])}
          address={contracts[prop]}
          mt={index ? 3 : 0}
        />
      ))}
    </Card>
  )
}

export default ContractsInfo
