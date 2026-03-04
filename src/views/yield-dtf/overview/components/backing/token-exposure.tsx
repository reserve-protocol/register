import { Trans } from '@lingui/macro'
import { Button } from '@/components/ui/button'
import CopyValue from '@/components/ui/copy-value'
import GoTo from '@/components/ui/go-to'
import BluechipLogo from 'components/icons/BluechipIcon'
import CirclesIcon from 'components/icons/CirclesIcon'
import HiperlinkIcon from 'components/icons/HiperlinkIcon'
import TokenLogo from 'components/icons/TokenLogo'
import { atom, useAtomValue } from 'jotai'
import Skeleton from 'react-loading-skeleton'
import { chainIdAtom } from 'state/atoms'
import { collateralsMetadataAtom } from 'state/cms/atoms'
import { rTokenCollateralDetailedAtom } from 'state/rtoken/atoms/rTokenBackingDistributionAtom'
import { shortenAddress } from 'utils'
import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'

interface TokenExposureData {
  symbol: string
  distribution: number
  rating?: string
  address: string
  chain: number
  website?: string
  description: string
}

const dataAtom = atom((get) => {
  const metadata = get(collateralsMetadataAtom)
  const chainId = get(chainIdAtom)
  const collaterals = get(rTokenCollateralDetailedAtom)

  if (!collaterals || !metadata) {
    return null
  }

  const tokenDetails: Record<string, TokenExposureData> = {}

  for (const collateral of collaterals) {
    const meta = metadata[collateral.symbol.toLowerCase().replace('-vault', '')]
    const tokens = meta?.underlying
    const distribution = meta?.tokenDistribution ?? []

    // token distribution
    if (distribution.length) {
      for (const dist of distribution) {
        const token = tokens[dist.token]

        if (token) {
          if (tokenDetails[token.symbol]) {
            tokenDetails[token.symbol].distribution +=
              dist.distribution * collateral.distribution
          } else {
            tokenDetails[token.symbol] = {
              symbol: token.symbol,
              distribution: dist.distribution * collateral.distribution,
              rating: token.rating,
              address: token.addresses[chainId],
              chain: chainId,
              website: token.website,
              description: token.description,
            }
          }
        }
      }
    } else if (tokens && Object.keys(tokens).length) {
      const token = tokens[Object.keys(tokens)[0]]
      tokenDetails[token.symbol] = {
        symbol: token.symbol,
        distribution: collateral.distribution * 100,
        rating: token.rating,
        address: token.addresses[chainId],
        chain: chainId,
        website: token.website,
        description: token.description,
      }
    }
  }

  return Object.values(tokenDetails)
})

const TokenExposure = () => {
  const data = useAtomValue(dataAtom)

  return (
    <div className="bg-card rounded-3xl">
      <div className="flex items-center p-3 sm:p-4 border-b border-border">
        <CirclesIcon color="currentColor" />
        <span className="ml-2 mr-auto text-xl">
          <Trans>Underlying Token Exposure</Trans>
        </span>
      </div>
      {!data && <Skeleton count={3} height={80} />}
      {data?.map((item) => (
        <div
          key={item.symbol}
          className="p-3 sm:p-4  border-b border-border last:border-b-0"
        >
          <div className="flex items-center">
            <TokenLogo symbol={item.symbol} width={24} />
            <span className="ml-2 text-primary font-bold">
              {item.distribution.toFixed(2)}%
            </span>
            <span className="ml-1 font-bold">{item.symbol}</span>
          </div>
          <p className="mt-3 text-legend">{item.description}</p>
          <div className="mt-3 flex items-center flex-wrap">
            <Button
              size="sm"
              variant="outline"
              className="border-2"
              onClick={() => window.open(item.website, '_blank')}
            >
              <div className="flex items-center">
                <HiperlinkIcon />
                <span className="ml-2">Website</span>
              </div>
            </Button>
            {!!item.rating && (
              <Button
                size="sm"
                className="ml-3 border-2"
                variant="outline"
                onClick={() => window.open('https://bluechip.org/', '_blank')}
              >
                <div className="flex items-center">
                  <BluechipLogo />
                  <span className="font-bold ml-2">Rating:</span>
                  <span className="ml-1 text-primary font-bold">
                    {item.rating}
                  </span>
                </div>
              </Button>
            )}
            <div className="hidden sm:block w-px h-6 bg-border mx-3" />
            {!!item.address && (
              <div className="flex items-center basis-full sm:basis-auto mt-3 sm:mt-0">
                <span className="mr-2 text-legend">
                  {!!item.address && shortenAddress(item.address)}
                </span>
                <CopyValue mr={1} ml="auto" value={item.address} />
                <GoTo
                  style={{ position: 'relative', top: '2px' }}
                  href={getExplorerLink(
                    item.address,
                    item.chain,
                    ExplorerDataType.TOKEN
                  )}
                />
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default TokenExposure
