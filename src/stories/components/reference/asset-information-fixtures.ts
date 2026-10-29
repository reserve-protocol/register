import discover from '../../patterns/market/reference/table-family/discover-snapshot.json'
import {
  BRIDGES,
  HOLDINGS,
} from '../../patterns/market/reference/table-family/holdings-fixtures'
import { getTokenName } from '@/utils'
import { ChainId } from '@/utils/chains'

const stock = discover.rows
  .flatMap((row) => row.basket)
  .find((asset) => asset.symbol === 'NVDAon')!
const bitcoin = HOLDINGS.cmc20.find((asset) => asset.symbol === 'BTCB')!

export const ASSET_INFORMATION_EXAMPLES = {
  nvidia: {
    title: getTokenName(stock.name),
    asset: stock,
    chain: ChainId.BSC,
    nativeName: getTokenName(stock.name),
    nativeSupporting: `NASDAQ: $${stock.symbol.replace(/on$/, '')}`,
    nativeUrl: `https://app.ondo.finance/assets/${stock.symbol.toLowerCase()}`,
    heldLabel: 'Tokenized Asset (held in basket)',
    provider: BRIDGES.ondo,
  },
  bitcoin: {
    title: getTokenName(bitcoin.name),
    asset: bitcoin,
    chain: ChainId.BSC,
    nativeName: `${bitcoin.native.name} (${bitcoin.native.symbol})`,
    nativeSupporting: 'Native L1 Asset',
    nativeUrl: bitcoin.native.url!,
    heldLabel: 'Bridged asset (held in basket)',
    provider: BRIDGES.bsc_bridge,
  },
} as const

export type AssetInformationExample =
  (typeof ASSET_INFORMATION_EXAMPLES)[keyof typeof ASSET_INFORMATION_EXAMPLES]
