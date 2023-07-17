import { t, Trans } from '@lingui/macro'
import { InfoItem } from 'components/info-box'
import useRToken from 'hooks/useRToken'
import { useAtomValue } from 'jotai'
import { chainIdAtom, rTokenAssetsAtom, rTokenContractsAtom } from 'state/atoms'
import { ContractKey } from 'state/rtoken/atoms/rTokenContractsAtom'
import { BoxProps, Card, Divider, Text } from 'theme-ui'
import { shortenAddress } from 'utils'
import { RSR_ADDRESS } from 'utils/addresses'

/**
 * View: Settings > Display RToken related contracts
 */
const ContractsInfo = (props: BoxProps) => {
  const contracts = useAtomValue(rTokenContractsAtom)
  const assets = useAtomValue(rTokenAssetsAtom) ?? {}
  const rToken = useRToken()
  const chainId = useAtomValue(chainIdAtom)
  const contractList: [string, ContractKey][] = [
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
  ]

  return (
    <Card p={4} {...props}>
      <Text variant="title">
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
        title="RToken asset"
        subtitle={
          rToken?.address && assets[rToken.address]
            ? shortenAddress(assets[rToken.address].address)
            : 'Loading...'
        }
        address={RSR_ADDRESS[chainId] || ''}
        mt={3}
      />
      <InfoItem
        title="RSR Token"
        subtitle={shortenAddress(RSR_ADDRESS[chainId] || '')}
        address={RSR_ADDRESS[chainId] || ''}
        mt={3}
      />
    </Card>
  )
}

export default ContractsInfo
