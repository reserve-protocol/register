import { BigNumber } from '@ethersproject/bignumber'
import { BigNumberMap } from './../types/index'
import { getAddress } from '@ethersproject/address'
import { Contract } from '@ethersproject/contracts'
import { JsonRpcSigner, Web3Provider } from '@ethersproject/providers'
import { t } from '@lingui/macro'

export const decimalPattern = /^[0-9]*[.]?[0-9]*$/i
export const numberPattern = /^\d+$/
export const addressPattern = /^0x[a-fA-F0-9]{40}$/

// returns the checksummed address if the address is valid, otherwise returns false
export function isAddress(value: string): string | false {
  try {
    return getAddress(value)
  } catch {
    return false
  }
}

const timeUnits = {
  year: 24 * 60 * 60 * 365,
  month: (24 * 60 * 60 * 365) / 12,
  day: 24 * 60 * 60,
  hour: 60 * 60,
  minute: 60,
  second: 0,
}

export const relativeTime = (from: number, to: number) => {
  let delta = Math.abs(to - from)

  if (delta >= timeUnits.year) {
    return t`A year ago`
  } else if (delta >= timeUnits.month) {
    return `>${Math.floor(delta / timeUnits.month)}` + t`mth`
  } else if (delta >= timeUnits.day) {
    return `>${Math.floor(delta / timeUnits.day)}d`
  } else if (delta >= timeUnits.hour) {
    return `>${Math.floor(delta / timeUnits.hour)}h`
  } else if (delta >= timeUnits.minute) {
    return `>${Math.floor(delta / timeUnits.minute)}m`
  } else {
    return `>${delta}s`
  }
}

export const getTime = (seconds: number) => {
  const d = Math.floor(seconds / (3600 * 24))
  const h = Math.floor((seconds % (3600 * 24)) / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)

  const dDisplay = d > 0 ? `${d}d` : ''
  const hDisplay = h > 0 ? h + `${h}h` : ''
  const mDisplay = m > 0 ? m + `${m}m` : ''
  const sDisplay = s > 0 ? s + `${s}s` : ''
  return dDisplay + hDisplay + mDisplay + sDisplay
}

interface ApyRate {
  basketRate: number
  rsrExchangeRate: number
  timestamp: number
}

export function calculateApy(
  recentRate: ApyRate,
  lastRate: ApyRate
): [number, number] {
  let tokenApy = 0
  let stakingApy = 0

  const priceGrowth =
    ((recentRate.basketRate - lastRate.basketRate) / lastRate.basketRate) * 100
  const stGrowth =
    ((recentRate.rsrExchangeRate - lastRate.rsrExchangeRate) /
      lastRate.rsrExchangeRate) *
    100
  const range = 31536000 / (recentRate.timestamp - lastRate.timestamp)

  tokenApy = priceGrowth * range
  stakingApy = stGrowth * range

  return [tokenApy, stakingApy]
}

export function shortenString(str: string) {
  return `${str.substring(0, 6)}...${str.substring(str.length - 4)}`
}

export function hasAllowance(
  allowances: BigNumberMap,
  requiredAllowances: BigNumberMap
) {
  return Object.keys(requiredAllowances).every(
    (address) =>
      BigNumber.isBigNumber(allowances[address]) &&
      allowances[address].gte(requiredAllowances[address])
  )
}

export function addressEqual(
  firstAddress: string,
  secondAddress: string
): boolean {
  try {
    return getAddress(firstAddress) === getAddress(secondAddress)
  } catch {
    throw new TypeError("Invalid input, address can't be parsed")
  }
}

export function formatCurrency(value: number): string {
  return Intl.NumberFormat('en-US').format(value)
}

// Utils for rable parsing
export const formatCurrencyCell = ({ cell }: { cell: any }) =>
  formatCurrency(+cell.value)
export const formatUsdCurrencyCell = ({ cell }: { cell: any }) =>
  `$${formatCurrency(+cell.value)}`

// shorten the checksummed version of the input address to have 0x + 4 characters at start and end
export function shortenAddress(address: string, chars = 4): string {
  const parsed = isAddress(address)
  if (!parsed) {
    return shortenString(address)
  }
  return `${parsed.substring(0, chars + 2)}...${parsed.substring(42 - chars)}`
}

// account is not optional
function getSigner(library: Web3Provider, account: string): JsonRpcSigner {
  return library.getSigner(account).connectUnchecked()
}

// account is optional
function getProviderOrSigner(
  library: Web3Provider,
  account?: string
): Web3Provider | JsonRpcSigner {
  return account ? getSigner(library, account) : library
}

// account is optional
export function getContract(
  address: string,
  ABI: any,
  library: Web3Provider,
  account?: string
): Contract {
  // TODO: Allow contract with unknown address to be instanciated to change it later with the attach method
  // if (!isAddress(address) || address === AddressZero) {
  //   throw Error(`Invalid 'address' parameter '${address}'.`)
  // }

  return new Contract(
    address,
    ABI,
    getProviderOrSigner(library, account) as any
  )
}

export function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // $& means the whole matched string
}

export function formattedFeeAmount(feeAmount: number): number {
  return feeAmount / 10000
}

/**
 * Returns true if the string value is zero in hex
 * @param hexNumberString
 */
export function isZero(hexNumberString: string) {
  return /^0x0*$/.test(hexNumberString)
}

export const truncateDecimals = (number: number, digits = 3) => {
  const multiplier = Math.pow(10, digits),
    adjustedNum = number * multiplier,
    truncatedNum = Math[adjustedNum < 0 ? 'ceil' : 'floor'](adjustedNum)

  return truncatedNum / multiplier
}

export const stringToColor = (str: string) => {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  let color = '#'
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff
    color += `00${value.toString(16)}`.substr(-2)
  }
  return color
}
