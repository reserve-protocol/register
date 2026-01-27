import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import DgnETHButtonAppendix from '@/components/utils/integrations/dgneth-btn-appendix'
import { ChainId } from '@/utils/chains'
import { Trans } from '@lingui/macro'
import useRToken from 'hooks/useRToken'
import { atom, useAtomValue } from 'jotai'
import { MoreHorizontal } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { estimatedApyAtom, rTokenListAtom } from 'state/atoms'
import { rTokenMetaAtom } from 'state/rtoken/atoms/rTokenAtom'
import { formatCurrency } from 'utils'
import { ROUTES } from 'utils/constants'

interface Socials {
  label: string
  href: string
}

const tokenSocialsAtom = atom((get) => {
  const token = get(rTokenMetaAtom)
  const tokenList = get(rTokenListAtom)

  if (!token || !tokenList[token.address]) {
    return null
  }

  const socials: Socials[] = []

  if (tokenList[token.address].social?.twitter) {
    socials.push({
      label: 'Twitter',
      href: tokenList[token.address].social?.twitter ?? '',
    })
  }

  // Some RTokens list register as their website, self-reference is not a great idea
  if (
    tokenList[token.address].website &&
    !tokenList[token.address]?.website?.includes('register')
  ) {
    socials.push({
      label: 'Website',
      href: tokenList[token.address].website ?? '',
    })
  }

  return socials.length ? socials : null
})

const SocialList = ({
  socials,
  onClick,
}: {
  socials: Socials[]
  onClick(): void
}) => (
  <div className=" border bg-card">
    {socials.map((social) => (
      <a
        key={social.label}
        className="block px-4 py-3 text-foreground cursor-pointer hover:bg-border"
        onClick={onClick}
        target="_blank"
        rel="noopener noreferrer"
        href={social.href}
      >
        {social.label}
      </a>
    ))}
  </div>
)

const TokenSocials = () => {
  const socials = useAtomValue(tokenSocialsAtom)
  const [isVisible, setVisible] = useState(false)

  // Tokens without logo are not listed - no socials
  if (!socials) {
    return null
  }

  return (
    <Popover open={isVisible} onOpenChange={setVisible}>
      <PopoverTrigger asChild>
        <Button
          size="lg"
          variant="outline-primary"
          className="w-full sm:w-auto"
          onClick={() => setVisible(true)}
        >
          <div className="h-[22px]">
            <MoreHorizontal />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <SocialList socials={socials} onClick={() => setVisible(false)} />
      </PopoverContent>
    </Popover>
  )
}

const OverviewActions = () => {
  const rToken = useRToken()
  const navigate = useNavigate()
  const { holders, stakers, basket } = useAtomValue(estimatedApyAtom)

  return (
    <div className="mt-6 mr-4 sm:mr-0 mb-2 flex flex-col sm:flex-row items-start gap-2 sm:gap-3">
      {rToken?.chainId !== ChainId.Arbitrum && (
        <DgnETHButtonAppendix rTokenSymbol={rToken?.symbol} basketAPY={basket}>
          <Button
            size="lg"
            className="whitespace-nowrap w-full sm:w-auto"
            onClick={() => navigate(`../${ROUTES.ISSUANCE}`)}
          >
            <Trans>
              {!!holders
                ? `Mint ${formatCurrency(holders, 1)}% Est. APY`
                : 'Mint'}
            </Trans>
          </Button>
        </DgnETHButtonAppendix>
      )}
      <Button
        size="lg"
        variant="outline-primary"
        className="whitespace-nowrap w-full sm:w-auto "
        onClick={() => navigate(`../${ROUTES.STAKING}`)}
      >
        Stake RSR {!!stakers && `- ${formatCurrency(stakers, 1)}% Est. APY`}
      </Button>
      <TokenSocials />
    </div>
  )
}

export default OverviewActions
