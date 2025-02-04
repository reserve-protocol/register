import ChainLogo from '@/components/icons/ChainLogo'
import CopyValue from '@/components/old/button/CopyValue'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { chainIdAtom } from '@/state/atoms'
import {
  indexDTFAtom,
  iTokenAddressAtom,
  iTokenMetaAtom,
} from '@/state/dtf/atoms'
import { shortenAddress } from '@/utils'
import { ExplorerDataType, getExplorerLink } from '@/utils/getExplorerLink'
import { useAtomValue } from 'jotai'
import { ArrowUpRight, MousePointerClick, ScrollText } from 'lucide-react'
import { Link } from 'react-router-dom'

const DEFAULT_LOGO = 'https://storage.reserve.org/dtf-default.png'

// const TokenSocials = () => {
//   const data = useAtomValue(iTokenMetaAtom)

//   if (!data) {
//     return <Skeleton className="w-60 h-6" />
//   }

//   return (
//     <div className="flex gap-3">
//       {data.website && (
//         <Link>
//           <Box variant="circle">
//             <LinkIcon size={12} />
//           </Box>
//           Website
//         </Link>
//       )}
//       {data.telegram && (
//         <Link>
//           <Box variant="circle">
//             <LinkIcon size={12} />
//           </Box>
//           Telegram
//         </Link>
//       )}
//       {data.twitter && (
//         <Link>
//           <Box variant="circle">
//             <X size={12} />
//           </Box>
//           Twitter
//         </Link>
//       )}
//     </div>
//   )
// }

const TokenNameSkeleton = () => (
  <div className="flex flex-col gap-4">
    <Skeleton className="w-24 h-5" />
    <Skeleton className="h-12 w-52 max-w-full" />
  </div>
)

const TokenAddresses = () => {
  const chainId = useAtomValue(chainIdAtom)
  const address = useAtomValue(iTokenAddressAtom)

  if (!address) {
    return null
  }

  return (
    <div className="flex items-center gap-2">
      <ChainLogo chain={chainId} />
      <span>{shortenAddress(address)}</span>
      <div className="p-1 bg-muted rounded-full">
        <CopyValue value={address} />
      </div>
      <Link
        to={getExplorerLink(address, chainId, ExplorerDataType.TOKEN)}
        target="_blank"
      >
        <ArrowUpRight size={16} />
      </Link>
    </div>
  )
}

const RolesOverview = () => {
  const dtf = useAtomValue(indexDTFAtom)
  const chainId = useAtomValue(chainIdAtom)

  return (
    <div className="grid grid-cols-2 border-t px-2 sm:pt-2">
      <div className="flex items-center border-r gap-2 sm:p-2">
        <div className="hidden sm:block p-1.5 border border-foreground rounded-full">
          <ScrollText size={16} />
        </div>
        <div>
          <span className="text-legend text-sm">Creator:</span>
          {dtf?.deployer ? (
            <div className="flex items-center gap-1">
              <span className="font-bold">{shortenAddress(dtf.deployer)}</span>
              <Link
                to={getExplorerLink(
                  dtf.deployer,
                  chainId,
                  ExplorerDataType.ADDRESS
                )}
                target="_blank"
                className="p-1 bg-muted rounded-full"
              >
                <ArrowUpRight size={12} />
              </Link>
            </div>
          ) : (
            <Skeleton className="w-30 h-5" />
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 p-2 pl-4">
        <div className="hidden sm:block p-1.5 border border-foreground rounded-full">
          <MousePointerClick size={16} />
        </div>
        <div>
          <span className="text-legend text-sm">Auction Launcher:</span>
          {dtf?.auctionLaunchers.length ? (
            <div className="flex items-center gap-1">
              <span className="font-bold">
                {shortenAddress(dtf?.auctionLaunchers[0])}
              </span>
              <Link
                to={getExplorerLink(
                  dtf.auctionLaunchers[0],
                  chainId,
                  ExplorerDataType.ADDRESS
                )}
                target="_blank"
                className="p-1 bg-muted rounded-full"
              >
                <ArrowUpRight size={12} />
              </Link>
            </div>
          ) : (
            <Skeleton className="w-30 h-5" />
          )}
        </div>
      </div>
    </div>
  )
}

const IndexTokenOverview = () => {
  const dtf = useAtomValue(indexDTFAtom)
  const meta = useAtomValue(iTokenMetaAtom)

  return (
    <Card className="p-2">
      <div className="flex items-center sm:mb-16 p-2 sm:p-4">
        <div className="mr-auto">
          <img
            src={meta?.logo || DEFAULT_LOGO}
            alt={dtf?.token.symbol ?? 'dtf token logo'}
            className="h-8 w-8 rounded-full"
          />
        </div>
        <TokenAddresses />

        {/* <TokenSocials /> */}
      </div>
      <div className="p-2 sm:p-4 relative max-w-96 sm:max-w-[620px] break-words">
        {!dtf ? (
          <TokenNameSkeleton />
        ) : (
          <>
            <h4>${dtf.token.symbol}</h4>
            <h1 className="mt-2 sm:mt-4 text-2xl md:text-5xl  font-medium w-full break-words">
              {dtf.token.name}
            </h1>
          </>
        )}
      </div>

      <RolesOverview />
    </Card>
  )
}

export default IndexTokenOverview
