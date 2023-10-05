import { atom } from 'jotai'
import { accountRTokensAtom, rTokenListAtom } from 'state/atoms'

export interface TokenDisplay {
  address: string
  symbol: string
  logo: string
}

export const DEFAULT_LOGO = '/svgs/defaultLogo.svg'

const availableTokensAtom = atom((get) => {
  const defaultTokens = get(rTokenListAtom)
  const owned = get(accountRTokensAtom)
  const tokenList: {
    [x: string]: TokenDisplay
  } = {}

  for (const token of Object.values(defaultTokens)) {
    if (token) {
      tokenList[token.address] = {
        address: token.address,
        symbol: token.symbol,
        logo: token.logo ? `/svgs/${token.logo}` : DEFAULT_LOGO,
      }
    }
  }

  for (const token of owned) {
    if (!tokenList[token.address]) {
      tokenList[token.address] = {
        address: token.address,
        symbol: token.symbol,
        logo: DEFAULT_LOGO,
      }
    }
  }

  return tokenList
})

export default availableTokensAtom
