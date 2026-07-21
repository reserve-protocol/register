import { ChainId } from '@/utils/chains'

// The AI DTFs share a marketing launch date (July 9, 2026 UTC) that differs
// from their on-chain inception. The dotted reference line on the price /
// performance charts anchors to this date for these five DTFs instead of the
// inception timestamp. All other DTFs keep using their inception date.
const AI_DTF_REFERENCE_TIMESTAMP = Math.floor(Date.UTC(2026, 6, 9) / 1000)

// PHOTON, POWER, BUILDOUT, NEOCLOUD and ROBOTS (all on BSC).
const AI_DTFS: { address: string; chainId: number }[] = [
  { address: '0xa0fe4e0aeca5479705ce996615b2eacb6b6a10fb', chainId: ChainId.BSC },
  { address: '0x290bcc0fd5096cc3261ae2021841c7bc67cb0f51', chainId: ChainId.BSC },
  { address: '0xd7ce7a841310982acd976d1a6fe7bb6063c5689d', chainId: ChainId.BSC },
  { address: '0xf571fe3f0d74521bc7310b111faea931c748f27b', chainId: ChainId.BSC },
  { address: '0x75617e7653f86f074cc30b9fd4ebf52ba9b62247', chainId: ChainId.BSC },
]

// True for the five AI DTFs, which use the July 9, 2026 launch date as their
// chart reference and label the marker "DTF Launch" instead of "DTF Created".
export const isAIDTF = (
  address: string | undefined,
  chainId: number | undefined
): boolean => {
  if (!address || chainId === undefined) return false
  const lower = address.toLowerCase()
  return AI_DTFS.some(
    (dtf) => dtf.address.toLowerCase() === lower && dtf.chainId === chainId
  )
}

// Returns the timestamp (unix seconds) the chart's dotted reference line should
// anchor to: the AI launch date for the five AI DTFs, otherwise the DTF's
// inception timestamp.
export const getChartReferenceTimestamp = (
  address: string | undefined,
  chainId: number | undefined,
  inceptionTimestamp: number | undefined
): number | undefined => {
  return isAIDTF(address, chainId)
    ? AI_DTF_REFERENCE_TIMESTAMP
    : inceptionTimestamp
}
