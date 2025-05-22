import { t } from '@lingui/macro'
import { CellContext } from '@tanstack/react-table'
import ERC20 from 'abis/ERC20'
import humanizeDuration from 'humanize-duration'
import { BigNumberMap } from 'types'
import { Address, formatEther, getAddress, parseEther, parseUnits } from 'viem'
import { CHAIN_TO_NETWORK, RESERVE_STORAGE, ROUTES } from './constants'
import dayjs from 'dayjs'

export const decimalPattern = /^[0-9]*[.]?[0-9]*$/i
export const numberPattern = /^\d+$/
export const addressPattern = /^0x[a-fA-F0-9]{40}$/

export function getAssetURI(key: string) {
  return `${RESERVE_STORAGE}/${key}`
}

export const cutDecimals = (value: string, min = 2, max = 9) => {
  // Extract potential postfix
  const lastChar = value[value.length - 1]
  const postfix = isNaN(Number(lastChar)) ? lastChar : ''
  const numberPart = postfix ? value.slice(0, -1) : value

  const [integer, decimals] = numberPart.split('.')
  if (!decimals) return value
  if (min === 0) return integer + (postfix || '')
  if (decimals.length <= min) return value

  // Find first non-zero digit
  const firstNonZeroIndex = decimals.split('').findIndex((d) => d !== '0')

  let result
  if (firstNonZeroIndex === -1) {
    // All zeros after decimal, return min digits
    result = `${integer}.${decimals.slice(0, min)}`
  } else if (firstNonZeroIndex >= min) {
    // For very small numbers (many leading zeros), keep up to the first non-zero + 2 digits
    result = `${integer}.${decimals.slice(0, Math.min(firstNonZeroIndex + 1, decimals.length))}`
  } else {
    // Normal case - return min digits
    result = `${integer}.${decimals.slice(0, min)}`
  }

  // Add back postfix if it existed
  return postfix ? result + postfix : result
}

// returns the checksummed address if the address is valid, otherwise returns false
export function isAddress(value: string) {
  try {
    return getAddress(value)
  } catch {
    return null
  }
}

export function getPrice([lowPrice, highPrice]: [bigint, bigint]) {
  return Number(formatEther((lowPrice + highPrice) / 2n))
}

export const getTokenRoute = (
  token: string,
  chainId: number,
  route: string = ROUTES.OVERVIEW
) => `/${CHAIN_TO_NETWORK[chainId]}/token/${token.toLowerCase()}/${route}`

export const getFolioRoute = (
  token: string,
  chainId: number,
  route: string = ROUTES.OVERVIEW
) => `/${CHAIN_TO_NETWORK[chainId]}/index-dtf/${token.toLowerCase()}/${route}`

// multiplier 200 -> 2
export const getSafeGasLimit = (gas: bigint, multiplier = 200n) =>
  (gas * multiplier) / 100n

export function getCurrentTime() {
  return Math.floor(new Date().getTime() / 1000)
}

export function getTokenReadCalls(address: string) {
  const call = { address: address as Address, abi: ERC20, args: [] }

  return [
    {
      ...call,
      functionName: 'name',
    },
    {
      ...call,
      functionName: 'symbol',
    },
    {
      ...call,
      functionName: 'decimals',
    },
  ]
}

export const isAmountValid = (value: bigint, max: bigint) =>
  value > 0n && value <= max

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

  if (delta < 0) {
    delta = timeUnits.minute
  }

  if (delta >= timeUnits.year) {
    return t`A year ago`
  } else if (delta >= timeUnits.month) {
    return `${Math.floor(delta / timeUnits.month)}` + t`mth`
  } else if (delta >= timeUnits.day) {
    return `${Math.floor(delta / timeUnits.day)}d`
  } else if (delta >= timeUnits.hour) {
    return `${Math.floor(delta / timeUnits.hour)}h`
  } else if (delta >= timeUnits.minute) {
    return `${Math.floor(delta / timeUnits.minute)}m`
  } else {
    return `${delta}s`
  }
}

export const dateToUnix = (str: string): number => {
  const date = new Date(str)
  const time = date.getTime() - 50000 - date.getTimezoneOffset() * 60000
  return Math.floor(time / 1000)
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

export function shortenString(str: string) {
  return `${str.substring(0, 6)}...${str.substring(str.length - 4)}`
}

export function shortenStringN(str: string, chars = 5) {
  return `${str.substring(0, chars)}...${str.substring(str.length - chars)}`
}

export function hasAllowance(
  allowances: BigNumberMap,
  requiredAllowances: BigNumberMap
) {
  return Object.keys(requiredAllowances).every(
    (address) => (allowances[address] || 0n) >= requiredAllowances[address]
  )
}

// Prevents more than 18 decimals
export function safeParseEther(value: string, decimals = 18): bigint {
  let safeValue = ''

  if (value[0] === '.') {
    safeValue = `0.${value.substring(1, decimals + 1) || 0}`
  } else {
    const split = value.split('.')
    safeValue = `${split[0]}.${split[1]?.substring(0, decimals) ?? '0'}`
  }

  return parseUnits(safeValue, decimals)
}

export function formatCurrency(
  value: number,
  decimals = 2,
  options: Intl.NumberFormatOptions = {}
): string {
  return Intl.NumberFormat('en-US', {
    maximumFractionDigits: decimals,
    minimumFractionDigits: Math.min(2, decimals),
    ...options,
  }).format(value)
}

export function formatTokenAmount(value: number) {
  return value < 1
    ? formatCurrency(value, 0, {
        maximumSignificantDigits: 4,
        notation: 'compact',
        compactDisplay: 'short',
      })
    : formatCurrency(value, 2, {
        minimumFractionDigits: 0,
        notation: 'compact',
        compactDisplay: 'short',
      })
}

export const formatPercentage = (value: number, decimals = 2): string =>
  (value / 100).toLocaleString('en-US', {
    style: 'percent',
    maximumFractionDigits: decimals,
  })

// Utils for rable parsing
export const formatCurrencyCell = (data: CellContext<any, number>) =>
  formatCurrency(+data.getValue())

export const formatUsdCurrencyCell = (data: CellContext<any, number>) =>
  `$${formatCurrency(+data.getValue())}`

// shorten the checksummed version of the input address to have 0x + 4 characters at start and end
export function shortenAddress(address: string, chars = 4): string {
  const parsed = isAddress(address)
  if (!parsed) {
    return shortenString(address)
  }
  return `${parsed.substring(0, chars + 2)}...${parsed.substring(42 - chars)}`
}

export function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // $& means the whole matched string
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

export const parsePercent = (n: string): bigint => {
  return parseEther((Number(n) / 100).toString())
}

// TODO: More robust title parsing?
export const getProposalTitle = (description: string) => {
  return description.split(/\r?\n/)[0].replaceAll('#', '').trim()
}

const shortEnglishHumanizer = humanizeDuration.humanizer({
  language: 'shortEn',
  languages: {
    shortEn: {
      y: () => 'y',
      mo: () => 'mo',
      w: () => 'w',
      d: () => 'd',
      h: () => 'h',
      m: () => 'm',
      s: () => 's',
      ms: () => 'ms',
    },
  },
})

export const parseDuration = (
  duration: number,
  options?: humanizeDuration.Options
) => {
  return humanizeDuration(duration * 1000, options)
}

export const parseDurationShort = (
  duration: number,
  options?: humanizeDuration.Options
) => {
  return shortEnglishHumanizer(duration * 1000, options)
}

export const getUTCStartOfDay = (timestamp: number) => {
  const date = new Date(timestamp * 1000)
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
}

// Thu May 18, 03:16 pm
export const formatDate = (timestamp?: string | number) => {
  const date = dayjs(timestamp)
  const currentYear = dayjs().year()
  const formatString =
    date.year() === currentYear
      ? 'ddd MMM DD, hh:mm a'
      : 'ddd MMM DD, YYYY, hh:mm a'
  return date.format(formatString)
}

export const humanizeMinutes = (minutes: number) => {
  if (minutes <= 60) {
    return `${minutes}m`
  }
  return humanizeDuration(minutes * 60 * 1000, {
    language: 'en',
  })
}

export const humanizeTimeFromHours = (hours: number) => {
  return humanizeDuration(hours * 60 * 60 * 1000, {
    language: 'en',
  })
}

export const humanizeTimeFromDays = (days: number) => {
  return humanizeDuration(days * 24 * 60 * 60 * 1000, {
    language: 'en',
  })
}

export const getTokenName = (name: string) => {
  if (name.startsWith('Moo ')) {
    return name.replace('Moo ', 'Beefy ')
  }

  return name
}

export const max = (...args: bigint[]): bigint => {
  if (args.length === 0) {
    throw new Error('empty arguments')
  }

  return args.reduce((max, curr) => (curr > max ? curr : max), 0n)
}

export function getTimerFormat(seconds: number) {
  const timeUnits = {
    days: 'd',
    day: 'd',
    hours: 'h',
    hour: 'h',
    minutes: 'm',
    minute: 'm',
    seconds: 's',
    second: 's',
  }

  let str = humanizeDuration(seconds * 1000, {
    units: ['h', 'm', 's'],
    round: true,
    spacer: '',
    delimiter: ' ',
  })

  // Replace all time unit words with their shortened versions
  for (const [word, short] of Object.entries(timeUnits)) {
    str = str.replace(word, short)
  }

  // Ensure seconds are always shown
  if (!str.includes('s')) {
    str += ' 0s'
  }

  return str
}

export const uuidv4 = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c == 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}
