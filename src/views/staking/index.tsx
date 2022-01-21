import { Navigate } from 'react-router-dom'
import { useAppSelector } from 'state/hooks'
import { selectCurrentRToken } from 'state/reserve-tokens/reducer'
import { ReserveToken } from 'types'
import StakePage from './Staking'

export default () => {
  const RToken = useAppSelector(selectCurrentRToken) as ReserveToken

  if (RToken.isRSV) {
    return <Navigate to="/" />
  }

  return <StakePage />
}
