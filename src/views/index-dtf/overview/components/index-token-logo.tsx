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
    <TokenLogo
      src={brand?.dtf?.icon || undefined}
      alt={dtf?.token.symbol ?? 'dtf token logo'}
      size="xl"
    />
  )
}

export default IndexTokenLogo
