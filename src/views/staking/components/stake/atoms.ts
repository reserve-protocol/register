import StRSR from 'abis/StRSR'
import StRSRVotes from 'abis/StRSRVotes'
import { atom } from 'jotai'
import {
  accountDelegateAtom,
  chainIdAtom,
  geolocationAtom,
  isModuleLegacyAtom,
  rTokenContractsAtom,
  rsrBalanceAtom,
  rsrPriceAtom,
} from 'state/atoms'
import { isAmountValid, safeParseEther } from 'utils'
import { RSR_ADDRESS } from 'utils/addresses'
import { Address } from 'viem'
import { rateAtom } from 'views/staking/atoms'

const BLOCKED_COUNTRIES = [
  'RU', // Russia
  'VE', // Venezuela
  'UA', // Ukraine
  'CU', // Cuba
  'IR', // Iran
  'KP', // North Korea
  'SY', // Syria
  'US', // United States
]

export const customDelegateAtom = atom('')

export const isStakingEnabledAtom = atom((get) => {
  const loc = get(geolocationAtom)

  if (!loc) {
    return { loading: true, value: false }
  }

  if (BLOCKED_COUNTRIES.indexOf(loc) !== -1) {
    return { loading: false, value: false }
  }

  return { loading: false, value: true }
})

export const stakeAmountAtom = atom('')
export const stakeAmountUsdAtom = atom((get) => {
  const amount = get(stakeAmountAtom)
  const price = get(rsrPriceAtom)

  return amount ? price * Number(amount) : 0
})
export const stakeOutputAtom = atom((get) => {
  const amount = get(stakeAmountAtom)
  const rate = get(rateAtom)

  return amount && rate ? Number(amount) / rate : 0
})

export const isValidStakeAmountAtom = atom((get) => {
  return isAmountValid(
    safeParseEther(get(stakeAmountAtom) || '0'),
    get(rsrBalanceAtom).value
  )
})

export const stakeTransactionAtom = atom((get) => {
  const currentDelegate = get(accountDelegateAtom)
  const amount = get(stakeAmountAtom)
  const contracts = get(rTokenContractsAtom)
  const delegate = get(customDelegateAtom)
  const { staking: isLegacy } = get(isModuleLegacyAtom)
  const isValid = get(isValidStakeAmountAtom)

  if (!contracts || !isValid || !delegate) {
    return undefined
  }

  const parsedAmount = safeParseEther(amount)

  if (!isLegacy && delegate !== currentDelegate) {
    return {
      abi: StRSRVotes,
      address: contracts.stRSR.address,
      functionName: 'stakeAndDelegate',
      args: [parsedAmount, delegate] as [bigint, Address],
    }
  }

  return {
    abi: StRSR,
    address: contracts.stRSR.address,
    functionName: 'stake',
    args: [parsedAmount] as [bigint],
  }
})

export const stakeAllowanceAtom = atom((get) => {
  const tx = get(stakeTransactionAtom)
  const chainId = get(chainIdAtom)

  if (!tx) {
    return undefined
  }

  return {
    token: RSR_ADDRESS[chainId],
    spender: tx.address,
    amount: tx.args[0],
    decimals: 18,
    symbol: 'RSR',
  }
})
