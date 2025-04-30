import Decimal from 'decimal.js-light'

export const D27n: bigint = 10n ** 27n
export const D18n: bigint = 10n ** 18n
export const D9n: bigint = 10n ** 9n

export const D27d: Decimal = new Decimal('1e27')
export const D18d: Decimal = new Decimal('1e18')
export const D9d: Decimal = new Decimal('1e9')

export const ZERO = new Decimal('0')
export const ONE = new Decimal('1')
export const TWO = new Decimal('2')

export const bn = (str: string | Decimal): bigint => {
  return BigInt(new Decimal(str).toFixed(0))
}
