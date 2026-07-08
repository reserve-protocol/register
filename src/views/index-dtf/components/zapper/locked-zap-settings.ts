import { ChainId } from '@/utils/chains'

// Featured DTFs (api /discover/featured) where deep liquidity search and
// force mint stay locked off in the zapper settings.
const LOCKED_ZAP_SETTINGS_DTFS: { address: string; chainId: number }[] = [
  // PHOTON
  { address: '0xa0fe4e0aeca5479705ce996615b2eacb6b6a10fb', chainId: ChainId.BSC },
  // BUILDOUT
  { address: '0xd7ce7a841310982acd976d1a6fe7bb6063c5689d', chainId: ChainId.BSC },
  // ROBOTS
  { address: '0x75617e7653f86f074cc30b9fd4ebf52ba9b62247', chainId: ChainId.BSC },
  // POWER
  { address: '0x290bcc0fd5096cc3261ae2021841c7bc67cb0f51', chainId: ChainId.BSC },
  // NEOCLOUD
  { address: '0xf571fe3f0d74521bc7310b111faea931c748f27b', chainId: ChainId.BSC },
]

export const hasLockedZapSettings = (address: string, chainId: number) => {
  const lower = address.toLowerCase()
  return LOCKED_ZAP_SETTINGS_DTFS.some(
    (dtf) => dtf.address.toLowerCase() === lower && dtf.chainId === chainId
  )
}
