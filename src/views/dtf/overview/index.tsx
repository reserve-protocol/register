import { Box } from '@/components/ui/box'
import { Card, CardHeader } from '@/components/ui/card'
import { Link } from '@/components/ui/link'
import {
  ArrowUpRight,
  Fingerprint,
  Link as LinkIcon,
  X,
  XIcon,
} from 'lucide-react'
import LandingMint from './components/landing-mint'
import PriceChart from './components/price-chart'
import { useAtomValue } from 'jotai'
import {
  fTokenAtom,
  fTokenConfigurationAtom,
  fTokenGovernanceAtom,
  fTokenMetaAtom,
} from '@/state/dtf/atoms'
import { Skeleton } from '@/components/ui/skeleton'

const DEFAULT_LOGO = 'https://storage.reserve.org/dtf-default.png'

const TokenSocials = () => {
  const data = useAtomValue(fTokenMetaAtom)

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

const TokenDetails = () => {
  const data = useAtomValue(fTokenAtom)
  const meta = useAtomValue(fTokenMetaAtom)
  const governance = useAtomValue(fTokenGovernanceAtom)

  return (
    <Card className="p-6">
      <div className="flex items-center mb-24">
        <div className="mr-auto">
          <img
            src={meta?.logo || DEFAULT_LOGO}
            alt={data?.symbol ?? 'dtf token logo'}
            className="h-8 w-8 rounded-full"
          />
        </div>
        <TokenSocials />
      </div>
      {!data ? (
        <TokenNameSkeleton />
      ) : (
        <>
          <h4>${data.symbol}</h4>
          <h1 className="mt-4 text-4xl font-medium">{data.name}</h1>
        </>
      )}
      <div className="flex items-center gap-1 mt-4">
        <span className="text-legend">Owner</span>
        {!governance ? (
          <Skeleton className="w-30 h-5" />
        ) : (
          <Link>
            <span className="font-bold">{governance.deployer}</span>
            <Box variant="circle">
              <ArrowUpRight size={12} />
            </Box>
          </Link>
        )}
      </div>
    </Card>
  )
}

const TokenAbout = () => {
  const data = useAtomValue(fTokenMetaAtom)
  const config = useAtomValue(fTokenConfigurationAtom)

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2  mb-24">
        <div className="rounded-full border border-foreground p-2 mr-auto">
          <Fingerprint size={20} />
        </div>

        {!config ? (
          <Skeleton className="w-60 h-6" />
        ) : (
          <div className="flex gap-4">
            <div className="flex gap-1">
              <Box variant="circle">
                <ArrowUpRight size={12} />
              </Box>
              <span className="font-medium">
                {config.IsManaged ? 'Managed' : 'Volatile'}
              </span>
            </div>
            <div className="flex gap-1">
              <Box variant="circle">
                <ArrowUpRight size={12} />
              </Box>
              <span className="text-legend">TVL Fee:</span>
              <span className="font-bold">{config.fee}%</span>
            </div>
          </div>
        )}
      </div>
      <div>
        <h2 className="text-4xl font-medium mb-2">About this token</h2>
        {!data ? (
          <div>
            <Skeleton className="w-full h-20" />
          </div>
        ) : (
          <p className="text-legend">{data.description}</p>
        )}
      </div>
    </Card>
  )
}

const Content = () => {
  return (
    <div className="rounded-2xl bg-secondary flex-1">
      <PriceChart />
      <div className="flex flex-col gap-1 m-1 -mt-20">
        <TokenDetails />
        <TokenAbout />
      </div>
    </div>
  )
}

const DTFOverview = () => {
  return (
    <div className="flex gap-2">
      <Content />
      <div>
        <div className="sticky top-0">
          <LandingMint className="hidden xl:block" />
        </div>
      </div>
    </div>
  )
}

export default DTFOverview
