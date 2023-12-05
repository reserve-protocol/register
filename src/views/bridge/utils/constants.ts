import { EUSD_ADDRESS, RSR_ADDRESS } from 'utils/addresses'
import { ChainId } from 'utils/chains'

export const L1_BRIDGE_ADDRESS = '0x49048044D57e1C92A77f79988d21Fa8fAF74E97e' // deposit eth
export const L1_BRIDGE_TOKEN_ADDRESS =
  '0x3154Cf16ccdb4C6d922629664174b904d80F2C35' // deposit erc20
export const L2_L1_MESSAGER_ADDRESS =
  '0x4200000000000000000000000000000000000016' // L2 withdraw native eth
export const L2_BRIDGE_ADDRESS = '0x4200000000000000000000000000000000000010' // L2 withdraw erc20 token

export const BRIDGEABLE_TOKENS = [
  { symbol: 'ETH', address: '', bridgedAddress: '' },
  {
    symbol: 'RSR',
    address: RSR_ADDRESS[ChainId.Mainnet],
    bridgedAddress: RSR_ADDRESS[ChainId.Base],
  },
  {
    symbol: 'eUSD',
    address: EUSD_ADDRESS[ChainId.Mainnet],
    bridgedAddress: EUSD_ADDRESS[ChainId.Base],
  },
]

export const L2_OUTPUT_ORACLE_PROXY_ADDRESS =
  '0x56315b90c40730925ec5485cf004d835058518A0'

export const L2_L1_MESSAGE_PASSER_ADDRESS =
  '0x4200000000000000000000000000000000000016'

export const OP_PORTAL = '0x49048044D57e1C92A77f79988d21Fa8fAF74E97e'
