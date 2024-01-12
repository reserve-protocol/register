import { t } from '@lingui/macro'
import CollapsableBox from 'components/boxes/CollapsableBox'
import SelectableBox from 'components/boxes/SelectableBox'
import EmissionsIcon from 'components/icons/EmissionsIcon'
import TokenLogo from 'components/icons/TokenLogo'
import { Info } from 'components/info-box'
import { useAtomValue } from 'jotai'
import { Box, BoxProps, Divider, Text } from 'theme-ui'
import { formatCurrency } from 'utils'
import { Claimable, auctionsOverviewAtom } from '../atoms'
import RevenueBoxContainer from './RevenueBoxContainer'
import { Button } from 'components'

interface ClaimProps extends BoxProps {
  data: Claimable
}

const ConfirmEmissionClaim = () => {
  return <Button fullWidth>Claim emissions from 1 position</Button>
}

const ClaimItem = ({ data, ...props }: ClaimProps) => {
  return (
    <CollapsableBox
      header={
        <SelectableBox onSelect={() => {}}>
          <Info
            title="Rewards"
            icon={<TokenLogo symbol={data.asset.token.symbol} />}
            subtitle={
              <Box variant="layout.verticalAlign">
                <Text>
                  {formatCurrency(data.amount)} {data.asset.token.symbol}
                </Text>
                <Text ml={2} sx={{ fontSize: 0 }}>
                  (${formatCurrency(data.amountUsd)})
                </Text>
              </Box>
            }
          />
        </SelectableBox>
      }
      mt={3}
    >
      <Box ml="5" mr="20px">
        <SelectableBox mb={2} onSelect={() => {}}>
          <Box sx={{ width: '100%' }} mr={3} variant="layout.verticalAlign">
            <Text>Backing Manager</Text>
            <Text ml="auto" variant="strong" sx={{ fontSize: 1 }}>
              ${formatCurrency(data.backingManager * data.asset.priceUsd)}
            </Text>
          </Box>
        </SelectableBox>
        <SelectableBox mb={2} onSelect={() => {}}>
          <Box sx={{ width: '100%' }} mr={3} variant="layout.verticalAlign">
            <Text>RSR Trader</Text>
            <Text ml="auto" variant="strong" sx={{ fontSize: 1 }}>
              ${formatCurrency(data.rsrTrader * data.asset.priceUsd)}
            </Text>
          </Box>
        </SelectableBox>
        <SelectableBox mb={2} onSelect={() => {}}>
          <Box sx={{ width: '100%' }} mr={3} variant="layout.verticalAlign">
            <Text>RToken Trader</Text>
            <Text ml="auto" variant="strong" sx={{ fontSize: 1 }}>
              ${formatCurrency(data.rTokenTrader * data.asset.priceUsd)}
            </Text>
          </Box>
        </SelectableBox>
      </Box>
    </CollapsableBox>
  )
}

const ClaimRewards = () => {
  const data = useAtomValue(auctionsOverviewAtom)

  if (!data || !data.pendingEmissions) {
    return null
  }

  return (
    <RevenueBoxContainer
      title={t`Claimable emissions`}
      icon={<EmissionsIcon />}
      subtitle={`$${formatCurrency(data.pendingEmissions)}`}
    >
      {data.claimableEmissions.map((claimable, index) => (
        <Box key={claimable.asset.address}>
          {!!index && (
            <Divider mx={-4} mt={3} sx={{ borderColor: 'darkBorder' }} />
          )}
          <ClaimItem data={claimable} />
        </Box>
      ))}
      <Divider my={4} mx={-4} />
      <ConfirmEmissionClaim />
    </RevenueBoxContainer>
  )
}

export default ClaimRewards
