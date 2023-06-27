import { atom } from 'jotai'
import { accountRTokensAtom, chainIdAtom } from 'state/atoms'
import { DEFAULT_TOKENS } from 'utils/addresses'
import rtokens from 'utils/rtokens'

export interface TokenDisplay {
  address: string
  symbol: string
  logo: string
}

// require(`@lc-labs/rtokens/images/${token.logo}`)

export const DEFAULT_LOGO = '/svgs/default.svg'

const availableTokensAtom = atom((get) => {
  const chainId = get(chainIdAtom)
  const defaultTokens = DEFAULT_TOKENS[chainId]
  const owned = get(accountRTokensAtom)
  const tokenList: {
    [x: string]: TokenDisplay
  } = {}

  for (const tokenAddress of defaultTokens) {
    const token = rtokens[tokenAddress]

    if (token) {
      tokenList[tokenAddress] = {
        address: tokenAddress,
        symbol: token.symbol,
        logo: token.logo
          ? `/node_modules/@lc-labs/rtokens/images/${token.logo}`
          : DEFAULT_LOGO,
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
