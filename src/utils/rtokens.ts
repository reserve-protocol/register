import { ChainId } from './chains'
import { CHAIN_ID } from 'utils/chains'
import rtokens from '@lc-labs/rtokens'

let tokenList = rtokens

if (CHAIN_ID === ChainId.Goerli) {
  tokenList = {}
}

export default tokenList
