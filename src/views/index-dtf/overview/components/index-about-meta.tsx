import TokenLogo from '@/components/token-logo'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { chainIdAtom } from '@/state/atoms'
import { indexDTFAtom, indexDTFBrandAtom } from '@/state/dtf/atoms'
import { ExplorerDataType, getExplorerLink } from '@/utils/getExplorerLink'
import { Trans } from '@lingui/react/macro'
import { useAtomValue } from 'jotai'
import { ArrowUpRight, ChevronDown, Crown } from 'lucide-react'
import type React from 'react'
import { Link } from 'react-router-dom'

export const CreatorLink = () => {
  const dtf = useAtomValue(indexDTFAtom)
  const brandData = useAtomValue(indexDTFBrandAtom)
  const chainId = useAtomValue(chainIdAtom)

  const creator = brandData?.creator?.name
  const link =
    brandData?.creator?.link ||
    getExplorerLink(dtf?.deployer || '', chainId, ExplorerDataType.ADDRESS)

  if (!creator) {
    return null
  }

  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex h-12 max-w-full flex-none items-center justify-start gap-1.5 rounded-xl border px-3 text-sm font-normal text-muted-foreground hover:text-foreground sm:h-9 sm:gap-2 sm:rounded-full"
    >
      <span className="hidden sm:inline-flex">
        {brandData?.creator?.icon ? (
          <TokenLogo src={brandData.creator.icon} size="sm" />
        ) : (
          <Crown size={16} />
        )}
      </span>
      <span>
        <Trans>Created by</Trans>
      </span>
      <span className="inline-flex items-center gap-1 text-foreground">
        {creator}
        <ArrowUpRight size={14} />
      </span>
    </a>
  )
}

export const AboutLinksDropdown = () => {
  const brandData = useAtomValue(indexDTFBrandAtom)
  const links = [
    brandData?.socials?.website && {
      label: <Trans>Website</Trans>,
      to: brandData.socials.website,
      external: true,
    },
    brandData?.socials?.twitter && {
      label: <Trans>X Account</Trans>,
      to: brandData.socials.twitter,
      external: true,
    },
  ].filter(Boolean) as {
    label: React.ReactNode
    to: string
    external: boolean
  }[]

  if (!links.length) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-12 min-w-20 flex-1 justify-between gap-1.5 rounded-xl px-3 text-sm font-normal text-muted-foreground hover:text-foreground sm:h-9 sm:flex-none sm:justify-center sm:gap-1 sm:rounded-full"
        >
          <Trans>Links</Trans>
          <ChevronDown size={14} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {links.map(({ label, to, external }) => (
          <DropdownMenuItem key={to} asChild>
            {external ? (
              <a
                href={to}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                {label}
                <ArrowUpRight size={14} />
              </a>
            ) : (
              <Link to={to} className="flex items-center gap-2">
                {label}
              </Link>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

const IndexAboutMeta = () => (
  <div className="mt-4 hidden flex-wrap items-center gap-2 md:flex">
    <CreatorLink />
    <AboutLinksDropdown />
  </div>
)

export default IndexAboutMeta
