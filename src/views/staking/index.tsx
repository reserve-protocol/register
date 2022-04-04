import { useAtomValue } from 'jotai'
import { Navigate } from 'react-router-dom'
import { rTokenAtom } from 'state/atoms'
import { ReserveToken } from 'types'
import StakePage from './Staking'

export default () => {
  const RToken = useAtomValue(rTokenAtom) as ReserveToken

  if (RToken.isRSV) {
    return <Navigate to="/" />
  }

  return <StakePage />
}
