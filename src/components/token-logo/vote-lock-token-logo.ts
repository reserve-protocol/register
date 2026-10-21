const VOTE_LOCK_RSR_LOGO = '/svgs/vlrsr.svg'

export const getVoteLockTokenLogo = (symbol?: string) =>
  symbol?.toLowerCase().startsWith('vlrsr') ? VOTE_LOCK_RSR_LOGO : ''

// Vote-lock vaults have no logo of their own (vlSQUILL, vlALTT-ABX), so callers that pass the underlying show its logo.
export const getVoteLockUnderlyingSymbol = (symbol?: string) => {
  if (!symbol || getVoteLockTokenLogo(symbol)) return ''
  return symbol.match(/^vl([A-Za-z0-9]+)(?:-.+)?$/)?.[1] ?? ''
}
