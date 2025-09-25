import ChainLogo from '@/components/icons/ChainLogo'
import TokenLogo from '@/components/token-logo'
import { Skeleton } from '@/components/ui/skeleton'
import { indexDTFAtom, indexDTFBrandAtom } from '@/state/dtf/atoms'
import { useAtomValue } from 'jotai'

const IndexTokenLogo = () => {
  const dtf = useAtomValue(indexDTFAtom)
  const brand = useAtomValue(indexDTFBrandAtom)

  if (!brand) {
    return <Skeleton className="h-8 w-8 rounded-full" />
  }
  return (
    <div className="relative">
      <TokenLogo
        src={brand?.dtf?.icon || undefined}
        alt={dtf?.token.symbol ?? 'dtf token logo'}
        size="xl"
      />
      {dtf?.chainId && (
        <ChainLogo
          chain={dtf?.chainId}
          className="absolute -bottom-1 -right-1"
        />
      )}
    </div>
  )
}

export default IndexTokenLogo
