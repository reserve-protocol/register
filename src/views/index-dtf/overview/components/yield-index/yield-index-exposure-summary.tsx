import StackTokenLogo from '@/components/token-logo/StackTokenLogo'
import { indexDTFExposureDataAtom } from '@/state/dtf/atoms'
import { PROJECT_ICONS } from '@/views/earn/hooks/useEarnTableColumns'
import { useAtomValue } from 'jotai'
import { ChevronRight } from 'lucide-react'
import {
  protocolSlugsAtom,
  underlyingTokensAtom,
  uniqueProjectsCountAtom,
} from './yield-index-exposure-atoms'

const scrollToComposition = () => {
  const el = document.getElementById('composition')
  if (el) el.scrollIntoView({ behavior: 'smooth' })
}

const AssetsSummary = () => {
  const underlyingTokens = useAtomValue(underlyingTokensAtom)

  return (
    <div className="flex items-center gap-1">
      {underlyingTokens.length > 0 && (
        <StackTokenLogo
          tokens={underlyingTokens}
          size={18}
          outsource
          reverseStack
        />
      )}
      <span className="font-semibold">{underlyingTokens.length} Assets</span>
    </div>
  )
}

const ProtocolsSummary = () => {
  const protocolSlugs = useAtomValue(protocolSlugsAtom)
  const uniqueProjects = useAtomValue(uniqueProjectsCountAtom)
  const protocolIcons = protocolSlugs.filter((p) => PROJECT_ICONS[p.project])

  return (
    <div className="flex items-center gap-1">
      {protocolIcons.length > 0 && (
        <div className="flex items-center -space-x-2">
          {protocolIcons.map((p, i) => (
            <div
              key={p.project}
              className="w-4 h-4 rounded-full overflow-hidden"
              style={{ zIndex: protocolIcons.length - i }}
            >
              {PROJECT_ICONS[p.project]}
            </div>
          ))}
        </div>
      )}
      <span className="font-semibold">{uniqueProjects} Protocols</span>
    </div>
  )
}

const ExposureSummary = () => {
  const exposureData = useAtomValue(indexDTFExposureDataAtom)
  const strategyCount = exposureData?.flatMap((g) => g.tokens).length ?? 0

  return (
    <button
      onClick={scrollToComposition}
      className="flex items-center justify-between w-full text-xs sm:text-base pt-4 border-t border-secondary mt-4 text-left hover:opacity-80 transition-opacity"
    >
      <div className="flex items-center gap-4">
        <span className="font-semibold">{strategyCount} Strategies</span>
        <AssetsSummary />
        <ProtocolsSummary />
      </div>
      <ChevronRight size={16} className="text-muted-foreground" />
    </button>
  )
}

export default ExposureSummary
