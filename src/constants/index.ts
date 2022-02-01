import { ChainId } from '@usedapp/core'
import { parseEther } from '@ethersproject/units'

export { default as ROUTES } from './routes'

export const CHAIN_ID =
  Number(process.env.REACT_APP_DEFAULT_CHAIN) || ChainId.Mainnet

export const TRANSACTION_STATUS = {
  PENDING: 'PENDING',
  SUBMITTED: 'SUBMITTED',
  CONFIRMED: 'CONFIRMED',
  REJECTED: 'REJECTED',
}

export const ONE_ETH = parseEther('1')
