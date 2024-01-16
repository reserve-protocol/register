import { t } from '@lingui/macro'
import EmissionsIcon from 'components/icons/EmissionsIcon'
import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { Box, Divider } from 'theme-ui'
import { formatCurrency } from 'utils'
import { auctionsOverviewAtom } from '../../atoms'
import ConfirmClaimRewards from './components/ConfirmClaimRewards'
import ClaimItem from './components/ClaimItem'
import RevenueBoxContainer from '../RevenueBoxContainer'
import { selectedEmissionsAtom } from './atoms'

const ClaimRewards = () => {
  const data = useAtomValue(auctionsOverviewAtom)
  const setSelected = useSetAtom(selectedEmissionsAtom)

  useEffect(() => {
    return () => setSelected({})
  }, [])

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
      <ConfirmClaimRewards />
    </RevenueBoxContainer>
  )
}

export default ClaimRewards
