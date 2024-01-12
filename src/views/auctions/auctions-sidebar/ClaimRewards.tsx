import { t } from '@lingui/macro'
import EmissionsIcon from 'components/icons/EmissionsIcon'
import { useAtomValue } from 'jotai'
import { Box, Divider } from 'theme-ui'
import { formatCurrency } from 'utils'
import { auctionsOverviewAtom } from '../atoms'
import ClaimEmissionsButton from './ClaimEmissionsButton'
import ClaimItem from './ClaimItem'
import RevenueBoxContainer from './RevenueBoxContainer'

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
      <ClaimEmissionsButton />
    </RevenueBoxContainer>
  )
}

export default ClaimRewards
