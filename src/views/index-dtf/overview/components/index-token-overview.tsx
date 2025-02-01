import { Box } from '@/components/ui/box'
import { Card } from '@/components/ui/card'
import { Link } from '@/components/ui/link'
import { Skeleton } from '@/components/ui/skeleton'
import { indexDTFAtom, iTokenMetaAtom } from '@/state/dtf/atoms'
import { useAtomValue } from 'jotai'
import { ArrowUpRight, Link as LinkIcon, X } from 'lucide-react'

const DEFAULT_LOGO = 'https://storage.reserve.org/dtf-default.png'

const TokenSocials = () => {
  const data = useAtomValue(iTokenMetaAtom)

  if (!data) {
    return <Skeleton className="w-60 h-6" />
  }

  return (
    <div className="flex gap-3">
      {data.website && (
        <Link>
          <Box variant="circle">
            <LinkIcon size={12} />
          </Box>
          Website
        </Link>
      )}
      {data.telegram && (
        <Link>
          <Box variant="circle">
            <LinkIcon size={12} />
          </Box>
          Telegram
        </Link>
      )}
      {data.twitter && (
        <Link>
          <Box variant="circle">
            <X size={12} />
          </Box>
          Twitter
        </Link>
      )}
    </div>
  )
}

const TokenNameSkeleton = () => (
  <div className="flex flex-col gap-4">
    <Skeleton className="w-24 h-5" />
    <Skeleton className="h-12 w-52 max-w-full" />
  </div>
)

const IndexTokenOverview = () => {
  const dtf = useAtomValue(indexDTFAtom)
  const meta = useAtomValue(iTokenMetaAtom)

  return (
    <Card className="p-6">
      <div className="flex items-center mb-24">
        <div className="mr-auto">
          <img
            src={meta?.logo || DEFAULT_LOGO}
            alt={dtf?.token.symbol ?? 'dtf token logo'}
            className="h-8 w-8 rounded-full"
          />
        </div>
        <TokenSocials />
      </div>
      {!dtf ? (
        <TokenNameSkeleton />
      ) : (
        <>
          <h4>${dtf.token.symbol}</h4>
          <h1 className="mt-4 text-2xl md:text-5xl font-medium">
            {dtf.token.name}
          </h1>
        </>
      )}
      <div className="flex items-center gap-1 mt-4">
        <span className="text-legend">Owner</span>
        {!dtf?.deployer ? (
          <Skeleton className="w-30 h-5" />
        ) : (
          <Link>
            <span className="font-bold break-all">{dtf?.deployer}</span>
            <Box variant="circle">
              <ArrowUpRight size={12} />
            </Box>
          </Link>
        )}
      </div>
    </Card>
  )
}

export default IndexTokenOverview
