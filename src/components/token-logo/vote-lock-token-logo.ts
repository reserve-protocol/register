const VOTE_LOCK_RSR_LOGO = '/svgs/vlrsr.svg'

export const getVoteLockTokenLogo = (symbol?: string) =>
  symbol?.toLowerCase().startsWith('vlrsr') ? VOTE_LOCK_RSR_LOGO : ''
