import { Trans, useLingui } from '@lingui/react/macro'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import CollaterizationIcon from 'components/icons/CollaterizationIcon'
import TokenLogo from 'components/icons/TokenLogo'
import TabMenu from 'components/tab-menu'
import useRToken from 'hooks/useRToken'
import { trackClick } from 'hooks/useTrackPage'
import { atom, useAtom, useAtomValue } from 'jotai'
import {
  type AnchorHTMLAttributes,
  type ReactNode,
  useMemo,
  useState,
} from 'react'
import {
  ArrowUpRight,
  BookOpen,
  Check,
  ChevronDown,
  Copy,
  FileCode2,
  Globe,
} from 'lucide-react'
import Skeleton from 'react-loading-skeleton'
import { chainIdAtom } from 'state/atoms'
import { collateralsMetadataAtom } from 'state/cms/atoms'
import {
  CollateralDetail,
  rTokenCollateralDetailedAtom,
} from 'state/rtoken/atoms/rTokenBackingDistributionAtom'
import { formatCurrency, shortenAddress } from 'utils'
import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'
import { YIELD_PROTOCOL_DOCS } from '@/utils/constants'

interface DetailedCollateralWithMeta extends CollateralDetail {
  website?: string
  appUrl?: string
  description: string
  addresses: { label: string; address: string }[]
}

const backingTypeAtom = atom('total')
const backingDetailAtom = atom((get) => {
  const collaterals = get(rTokenCollateralDetailedAtom)
  const metadata = get(collateralsMetadataAtom)
  const chainId = get(chainIdAtom)

  if (!collaterals) {
    return null
  }

  return collaterals.map((c) => {
    const meta = metadata?.[c.symbol.toLowerCase().replace('-vault', '')]
    // TODO: Define multitoken case
    const token = meta?.underlying?.[0]
    const addresses = [{ label: 'Collateral', address: c.address }]

    if (token && token.addresses[chainId]) {
      addresses.push({ label: 'Token', address: token.addresses[chainId] })
    }

    return {
      ...c,
      website: token?.website,
      appUrl: meta?.appUrls?.[chainId],
      description: meta?.description ?? '',
      addresses,
    }
  }) as DetailedCollateralWithMeta[]
})

const ExternalLinkButton = ({
  icon,
  children,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & {
  icon: ReactNode
  'data-testid'?: string
}) => (
  <Button variant="outline" size="sm" className="h-11 sm:h-9 gap-2" asChild>
    <a target="_blank" rel="noopener noreferrer" {...props}>
      {icon}
      {children}
      <ArrowUpRight size={14} className="text-legend" />
    </a>
  </Button>
)

const contractActionClass =
  'flex w-11 sm:w-9 shrink-0 items-center justify-center border-l border-border text-legend transition-colors hover:bg-accent hover:text-foreground'

const ContractButton = ({
  address,
  chainId,
}: {
  address: string
  chainId: number
}) => {
  const { t } = useLingui()
  const [copied, setCopied] = useState(false)

  const copy = () => {
    navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="col-span-2 flex h-11 sm:h-9 items-stretch overflow-hidden rounded-md border border-border text-sm">
      <span className="flex min-w-0 flex-1 items-center gap-2 px-3">
        <FileCode2 size={14} className="shrink-0" />
        <span className="flex min-w-0 font-mono sm:hidden">
          <span className="truncate">{address.slice(0, -4)}</span>
          <span className="shrink-0">{address.slice(-4)}</span>
        </span>
        <span className="hidden font-mono sm:inline">
          {shortenAddress(address)}
        </span>
      </span>
      <button
        type="button"
        aria-label={t`Copy address`}
        onClick={copy}
        className={contractActionClass}
      >
        {copied ? <Check size={14} /> : <Copy size={14} />}
      </button>
      <a
        href={getExplorerLink(address, chainId, ExplorerDataType.TOKEN)}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t`View on explorer`}
        className={contractActionClass}
      >
        <ArrowUpRight size={14} />
      </a>
    </div>
  )
}

const CollateralDetails = ({
  collateral,
}: {
  collateral: DetailedCollateralWithMeta
}) => {
  const chainId = useAtomValue(chainIdAtom)
  const [expanded, setExpanded] = useState(false)
  const backingType = useAtomValue(backingTypeAtom)
  const websiteUrl = collateral.appUrl ?? collateral.website

  return (
    <div
      data-testid="yield-collateral-row"
      data-collateral={collateral.address.toLowerCase()}
      className={cn(
        'font-semibold relative items-center border-b last:border-b-0',
        expanded ? 'border-input' : 'border-border'
      )}
    >
      <div
        data-testid="yield-collateral-toggle"
        onClick={() => setExpanded(!expanded)}
        className="grid grid-cols-1 sm:grid-cols-[3fr_1fr_1fr_1fr] cursor-pointer hover:sm:bg-muted p-3 sm:p-4"
      >
        <div className="flex items-center">
          <TokenLogo symbol={collateral.symbol} />
          <span className="ml-2 text-primary">
            {collateral.distribution.toFixed(2)}%
          </span>
          <span className="ml-2">{collateral.displayName}</span>
        </div>
        <div>
          <span className="font-semibold sm:hidden">
            <Trans>Yield:</Trans>{' '}
          </span>
          <span>{collateral.yield.toFixed(2)}%</span>
        </div>

        <div className="flex flex-wrap">
          <span className="mr-1 font-semibold sm:hidden">
            <Trans>Value:</Trans>
          </span>
          {!!collateral.valueTarget && !!collateral.valueSingleTarget && (
            <span className="mr-2 whitespace-nowrap">
              {formatCurrency(
                backingType === 'total'
                  ? collateral.valueTarget
                  : collateral.valueSingleTarget
              )}{' '}
              {collateral.targetUnit}
            </span>
          )}
          <span
            className={
              collateral.valueTarget ? 'text-legend font-normal text-sm' : ''
            }
          >
            {!!collateral.valueTarget && '('}$
            {formatCurrency(
              backingType === 'total'
                ? collateral.valueUsd
                : collateral.valueSingleUsd
            )}
            {!!collateral.valueTarget && ')'}
          </span>
        </div>

        <div className="text-right absolute sm:relative top-[68px] sm:top-0 right-5 sm:right-0 flex items-center justify-end">
          <ChevronDown size={16} />
        </div>
      </div>
      {!!expanded && (
        <div className="mt-3 font-normal px-3 sm:px-4 pb-3 sm:pb-4">
          <p>{collateral.description}</p>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
            {!!websiteUrl && (
              <ExternalLinkButton
                href={websiteUrl}
                icon={<Globe size={14} />}
                data-testid={
                  collateral.appUrl ? 'yield-collateral-app-link' : undefined
                }
                onClick={() =>
                  trackClick(
                    'yield_dtf_backing',
                    'collateral_website',
                    collateral.address,
                    collateral.symbol,
                    chainId
                  )
                }
              >
                <Trans>Website</Trans>
              </ExternalLinkButton>
            )}
            <ExternalLinkButton
              href={YIELD_PROTOCOL_DOCS}
              icon={<BookOpen size={14} />}
            >
              <Trans>Docs</Trans>
            </ExternalLinkButton>
            <ContractButton address={collateral.address} chainId={chainId} />
          </div>
        </div>
      )}
    </div>
  )
}

const CollateralList = () => {
  const collaterals = useAtomValue(backingDetailAtom)

  const sortedCollaterals = useMemo(() => {
    return collaterals?.sort((a, b) => b.distribution - a.distribution)
  }, [collaterals])

  if (!sortedCollaterals) {
    return (
      <div className="px-4 mb-3">
        <Skeleton count={3} height={66} />
      </div>
    )
  }

  return (
    <div>
      {sortedCollaterals?.map((collateral) => (
        <CollateralDetails key={collateral.address} collateral={collateral} />
      ))}
    </div>
  )
}

const Header = () => {
  const { t } = useLingui()
  const [backingType, setBackingType] = useAtom(backingTypeAtom)
  const rToken = useRToken()

  const backingOptions = useMemo(
    () => [
      { key: 'total', label: t`Total backing` },
      { key: 'unit', label: `1 ${rToken?.symbol}` },
    ],
    [rToken, t]
  )

  return (
    <div className="flex items-center p-3 sm:p-4 border-b border-border flex-wrap">
      <CollaterizationIcon width={20} height={20} />
      <span className="ml-2 mr-auto text-xl ">
        <Trans>Collateral Exposure</Trans>
      </span>
      <TabMenu
        mt={[2, 0]}
        active={backingType}
        items={backingOptions}
        small
        background="border"
        onMenuChange={setBackingType}
      />
    </div>
  )
}

const CollateralExposure = () => {
  return (
    <div className="h-fit bg-card w-full rounded-2xl overflow-hidden">
      <Header />
      <div className="hidden sm:grid grid-cols-[3fr_1fr_1fr_1fr] py-2.5 px-4 text-legend text-sm">
        <span>
          <Trans>Token</Trans>
        </span>
        <span>
          <Trans>Yield</Trans>
        </span>
        <span>
          <Trans>Value</Trans>
        </span>
        <span className="text-right">
          <Trans>Detail</Trans>
        </span>
      </div>
      <CollateralList />
    </div>
  )
}

export default CollateralExposure
