import { Trans } from '@lingui/macro'
import EarnIcon from 'components/icons/EarnIcon'
import useRToken from 'hooks/useRToken'
import { atom, useAtomValue } from 'jotai'
import { selectedRTokenAtom } from 'state/atoms'
import { poolsAtom } from 'state/pools/atoms'
import PoolsTable from 'views/earn/components/pools-table'

const rTokenPoolsAtom = atom((get) => {
  const pools = get(poolsAtom)
  const rToken = get(selectedRTokenAtom)

  if (!rToken) {
    return []
  }

  return pools.filter((pool) => {
    if (
      !pool.underlyingTokens.find(
        (token) => token.address.toLowerCase() === rToken.toLowerCase()
      )
    ) {
      return false
    }

    return true
  })
})

const RTokenEarn = () => {
  const data = useAtomValue(rTokenPoolsAtom)
  const rToken = useRToken()

  return (
    <div>
      <div className="flex items-center ml-6 mb-6 mt-10 text-primary">
        <EarnIcon fontSize={24} />
        <h2 className="ml-2 text-2xl font-semibold">
          <Trans>Explore yield opportunities for {rToken?.symbol ?? ''}</Trans>
        </h2>
      </div>
      <div className="overflow-auto">
        <PoolsTable compact data={data} />
      </div>
    </div>
  )
}

export default RTokenEarn
