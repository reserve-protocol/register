import { getFolioRoute } from '@/utils'
import { ChainId } from '@/utils/chains'
import { Address } from 'viem'

export type FeaturedIdentity = {
  key: string
  address: Address
  chainId: number
  symbol: string
  name: string
  logo: string
}

// Static identity for the hero's featured DTFs so the cards paint their
// name/logo/symbol and a working link on first render, before the (slower)
// featured endpoint resolves the chart/price/exposure. The list is
// marketing-curated and non-dynamic; logos are the hosted brand icons the
// featured API serves. When the endpoint lands, the live cards replace these.
// Keep the length in sync with HIGHLIGHTED_LIMIT — these drive the hero's
// loading cards. Order mirrors reserve-api FEATURED_TOKENS so the skeletons
// don't reshuffle when the live cards land.
export const FEATURED_DTFS: FeaturedIdentity[] = [
  {
    key: 'buildout',
    address: '0xD7cE7a841310982AcD976D1a6fe7BB6063c5689D',
    chainId: ChainId.BSC,
    symbol: 'BUILDOUT',
    name: 'Reserve AI Infrastructure DTF',
    logo: 'https://l5394zf57b.ufs.sh/f/mupND8QUUvXxyHeh2QrX3EJomHD1USwYFd2GKiBg5a8eIx7n',
  },
  {
    key: 'power',
    address: '0x290bCc0Fd5096cC3261AE2021841c7BC67Cb0f51',
    chainId: ChainId.BSC,
    symbol: 'POWER',
    name: 'Reserve AI Power DTF',
    logo: 'https://l5394zf57b.ufs.sh/f/mupND8QUUvXxZKOsPr8JmlcRC50zSbLNDr2MEexXdkwT78ah',
  },
  {
    key: 'photon',
    address: '0xa0Fe4e0aEca5479705ce996615B2EACB6b6a10Fb',
    chainId: ChainId.BSC,
    symbol: 'PHOTON',
    name: 'Reserve Photonics DTF',
    logo: 'https://l5394zf57b.ufs.sh/f/mupND8QUUvXxYmQhYtkGhrj2ScsDNeUp3lRftPgCi0ZM65Vz',
  },
  {
    key: 'neocloud',
    address: '0xf571Fe3F0d74521Bc7310B111Faea931C748f27B',
    chainId: ChainId.BSC,
    symbol: 'NEOCLOUD',
    name: 'Reserve AI NeoCloud DTF',
    logo: 'https://l5394zf57b.ufs.sh/f/mupND8QUUvXxSLxvYczdsT15PwoUNnDvJ3hXEatCMQxeHuGm',
  },
  {
    key: 'robots',
    address: '0x75617e7653f86f074Cc30b9Fd4eBf52bA9b62247',
    chainId: ChainId.BSC,
    symbol: 'ROBOTS',
    name: 'Reserve Robotics DTF',
    logo: 'https://l5394zf57b.ufs.sh/f/mupND8QUUvXxmEIFouUUvXxgOp9n53Rqlys7HtMJG1oZVT6a',
  },
]

// Featured DTFs resolve by their symbol alias (e.g. /bsc/index-dtf/photon),
// matching the live card's getHighlightedDtfRoute so first-paint links line up.
export const getFeaturedRoute = (dtf: FeaturedIdentity) =>
  getFolioRoute(dtf.symbol, dtf.chainId)
