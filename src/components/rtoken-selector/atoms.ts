import { atom } from 'jotai'
import { accountRTokensAtom, allrTokenListAtom } from 'state/atoms'

type ChainId = 1 | 8453 | null
export interface TokenDisplay {
  address: string
  symbol: string
  logo: string
  chainId: ChainId
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
        chainId: token.chainId as ChainId
      }
    }
  }

  for (const token of owned) {
    if (tokenList[token.address] == null) {
      tokenList[token.address] = {
        address: token.address,
        symbol: token.symbol,
        logo: DEFAULT_LOGO,
        chainId: token.chainId as ChainId
      }
    }
  }

  return tokenList
})

export default availableTokensAtom
