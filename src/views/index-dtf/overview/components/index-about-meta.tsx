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
import { ROUTES } from '@/utils/constants'
import { ExplorerDataType, getExplorerLink } from '@/utils/getExplorerLink'
import { Trans } from '@lingui/react/macro'
import { useAtomValue } from 'jotai'
import { ArrowUpRight, ChevronDown, Crown } from 'lucide-react'
import type React from 'react'
import { Link } from 'react-router-dom'

const CreatorLink = () => {
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
    <Link
      to={link}
      target="_blank"
      className="inline-flex h-9 items-center gap-2 rounded-full border px-3 text-sm text-muted-foreground hover:text-foreground"
    >
      {brandData?.creator?.icon ? (
        <TokenLogo src={brandData.creator.icon} size="sm" />
      ) : (
        <Crown size={16} />
      )}
      <span>
        <Trans>Created by</Trans>
      </span>
      <span className="inline-flex items-center gap-1 text-foreground">
        {creator}
        <ArrowUpRight size={14} />
      </span>
    </Link>
  )
}

const AboutLinksDropdown = () => {
  const brandData = useAtomValue(indexDTFBrandAtom)
  const links = [
    brandData?.socials?.website && {
      label: <Trans>Website</Trans>,
      to: brandData.socials.website,
      external: true,
    },
    {
      label: <Trans>Performance Sheet</Trans>,
      to: `../${ROUTES.FACTSHEET}`,
      external: false,
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
          className="h-9 gap-1 rounded-full px-3 text-sm font-normal"
        >
          <Trans>Links</Trans>
          <ChevronDown size={14} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {links.map(({ label, to, external }) => (
          <DropdownMenuItem key={to} asChild>
            <Link
              to={to}
              target={external ? '_blank' : undefined}
              className="flex items-center gap-2"
            >
              {label}
              {external && <ArrowUpRight size={14} />}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

const IndexAboutMeta = () => (
  <div className="mt-4 flex flex-wrap items-center gap-2">
    <CreatorLink />
    <AboutLinksDropdown />
  </div>
)

export default IndexAboutMeta
