import { parseEther } from '@ethersproject/units'

export { default as ROUTES } from './routes'

export const TRANSACTION_STATUS = {
  PENDING: 'PENDING',
  SUBMITTED: 'SUBMITTED',
  CONFIRMED: 'CONFIRMED',
  REJECTED: 'REJECTED',
}

export const ONE_ETH = parseEther('1')
