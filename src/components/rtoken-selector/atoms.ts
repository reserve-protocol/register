import { atom } from 'jotai'
import { accountRTokensAtom, allrTokenListAtom } from 'state/atoms'
export interface TokenDisplay {
  address: string
  symbol: string
  logo: string
  chainId: number
}

export const DEFAULT_LOGO = '/svgs/defaultLogo.svg'

const availableTokensAtom = atom((get) => {
  const defaultTokens = get(allrTokenListAtom)
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
        chainId: token.chainId
      }
    }
  }

  for (const token of owned) {
    if (tokenList[token.address] == null) {
      tokenList[token.address] = {
        address: token.address,
        symbol: token.symbol,
        logo: DEFAULT_LOGO,
        chainId: token.chainId
      }
    }
  }

  return tokenList
})

export default availableTokensAtom
