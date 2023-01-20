import { t, Trans } from '@lingui/macro'
import { InfoHeading } from 'components/info-box'
import useRToken from 'hooks/useRToken'
import { useAtomValue } from 'jotai'
import { rTokenContractsAtom } from 'state/atoms'
import { BoxProps, Card, Divider, Text } from 'theme-ui'

const ContractsInfo = (props: BoxProps) => {
  const rToken = useRToken()
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
      <Text variant="sectionTitle">
        <Trans>Related contracts</Trans>
      </Text>
      <Divider my={4} mx={-4} sx={{ borderColor: 'darkBorder' }} />

      <InfoHeading title="RToken" subtitle={rToken?.address} mb={3} />

      {contractList.map(([label, prop]) => (
        <InfoHeading
          key={label}
          title={label}
          subtitle={contracts[prop]}
          mb={3}
        />
      ))}
    </Card>
  )
}

export default ContractsInfo
