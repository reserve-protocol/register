import { t } from '@lingui/macro'
import EmissionsIcon from 'components/icons/EmissionsIcon'
import { useAtomValue } from 'jotai'
import { formatCurrency } from 'utils'
import { TRADERS } from 'utils/constants'
import { auctionsOverviewAtom } from '../../atoms'
import RevenueBoxContainer from '../RevenueBoxContainer'
import TraderEmissions from './components/TraderEmissions'

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
      {TRADERS.map((trader) => (
        <TraderEmissions key={trader} trader={trader} />
      ))}
    </RevenueBoxContainer>
  )
}

export default ClaimRewards
