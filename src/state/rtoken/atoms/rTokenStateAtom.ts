import { atomWithReset } from 'jotai/utils'

export const rTokenStateAtom = atomWithReset({
  tokenSupply: 0,
  stTokenSupply: 0,
  exchangeRate: 0,
  issuanceAvailable: 0,
  redemptionAvailable: 0,
  basketNonce: 0,
  isCollaterized: true,
  tradingPaused: false,
  issuancePaused: false,
  frozen: false,
})
