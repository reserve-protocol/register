const VOTE_LOCK_RSR_LOGO = '/svgs/vlrsr.svg'

export const getVoteLockTokenLogo = (symbol?: string) =>
  symbol?.toLowerCase().startsWith('vlrsr') ? VOTE_LOCK_RSR_LOGO : ''

// vlSQUILL and vlSQUILL-OPEN have no logo of their own, so they show their underlying's.
export const getVoteLockUnderlyingSymbol = (symbol?: string) => {
  if (!symbol || getVoteLockTokenLogo(symbol)) return ''
  return symbol.match(/^vl([A-Za-z0-9]+)(?:-.+)?$/)?.[1] ?? ''
}
