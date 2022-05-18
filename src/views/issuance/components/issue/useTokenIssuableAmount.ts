import { formatEther } from '@ethersproject/units'
import { useWeb3React } from '@web3-react/core'
import { useFacadeContract } from 'hooks/useContract'
import { useAtomValue } from 'jotai'
import { useEffect, useMemo, useState } from 'react'
import { balancesAtom } from 'state/atoms'
import { ReserveToken } from 'types'
import { getIssuable } from 'utils/rsv'

const getCollateralBalance = (
  rToken: ReserveToken,
  balances: { [x: string]: number }
) => {
  return rToken.basket.collaterals.reduce((sum, collateral) => {
    return sum + (balances[collateral.token.address] || 0)
  }, 0)
}

// const canIssue = async () => {
//   // Check for MaxSupply hit
//   const maxSupply = drizzle.web3.utils.toBN(
//     drizzleState.contracts.Reserve.maxSupply[this.state.rsv.maxSupply].value
//   )
//   const totalSupply = drizzle.web3.utils.toBN(
//     drizzleState.contracts.Reserve.totalSupply[this.state.rsv.totalSupply].value
//   )
//   const cur = drizzle.web3.utils
//     .toBN(this.state.generate.cur)
//     .mul(util.EIGHTEEN)
//   if (totalSupply.add(cur).gt(maxSupply)) {
//     alert('Sorry, RSV is at max supply')
//     return
//   }
// }

const useTokenIssuableAmount = (data: ReserveToken) => {
  const [amount, setAmount] = useState(0)
  const tokenBalances = useAtomValue(balancesAtom)
  const balance = useMemo(
    () => getCollateralBalance(data, tokenBalances),
    [tokenBalances, data]
  )
  const { account } = useWeb3React()
  const facadeContract = useFacadeContract(data.facade ?? '')

  const setMaxIssuable = async (
    address: string,
    mounted: { value: boolean }
  ) => {
    try {
      const maxIssuable = await facadeContract!.callStatic.maxIssuable(address)
      if (mounted.value) {
        setAmount(maxIssuable ? Number(formatEther(maxIssuable)) : 0)
      }
    } catch (e) {
      console.error('error with max issuable', e)
    }
  }

  useEffect(() => {
    const mounted = { value: true }

    if (data.isRSV) {
      setAmount(getIssuable(data, tokenBalances))
    } else if (account && facadeContract) {
      setMaxIssuable(account, mounted)
    } else {
      setAmount(0)
    }

    return () => {
      mounted.value = false
    }
  }, [balance, data.id])

  return amount
}

export default useTokenIssuableAmount
