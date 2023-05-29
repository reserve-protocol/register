import { t, Trans } from '@lingui/macro'
import { InfoItem } from 'components/info-box'
import useRToken from 'hooks/useRToken'
import { useAtomValue } from 'jotai'
import { rTokenContractsAtom } from 'state/atoms'
import { BoxProps, Card, Text, Divider } from 'theme-ui'
import { shortenAddress } from 'utils'
import { RSR_ADDRESS } from 'utils/addresses'
import { CHAIN_ID } from 'utils/chains'

/**
 * View: Settings > Display RToken related contracts
 */
const ContractsInfo = (props: BoxProps) => {
  const contracts = useAtomValue(rTokenContractsAtom)
  const rToken = useRToken()
  const contractList = [
    [t`Main`, 'main'],
    [t`Backing Manager`, 'backingManager'],
    [t`Basket Handler`, 'basketHandler'],
    [t`RToken Trader`, 'rTokenTrader'],
    [t`RSR Trader`, 'rsrTrader'],
    [t`Broker`, 'broker'],
    [t`Asset Registry`, 'assetRegistry'],
    [rToken?.stToken?.name ?? t`stRSR Token`, 'stRSR'],
    [t`Furnace`, 'furnace'],
    [t`Distributor`, 'distributor'],
    [t`RToken Asset`, 'rTokenAsset'],
  ]

  return (
    <Card p={4} {...props}>
      <Text variant="sectionTitle">
        <Trans>Related Contracts</Trans>
      </Text>
      <Divider mx={-4} my={4} sx={{ borderColor: 'darkBorder' }} />
      {contractList.map(([label, prop], index) => (
        <InfoItem
          key={label}
          title={label}
          subtitle={shortenAddress(
            contracts ? contracts[prop]?.address ?? '' : 'Loading...'
          )}
          address={contracts ? contracts[prop]?.address : 'Loading...'}
          mt={index ? 3 : 0}
        />
      ))}
      <InfoItem
        title="RSR Token"
        subtitle={shortenAddress(RSR_ADDRESS[CHAIN_ID] || '')}
        address={RSR_ADDRESS[CHAIN_ID] || ''}
        mt={3}
      />
    </Card>
  )
}

export default ContractsInfo
