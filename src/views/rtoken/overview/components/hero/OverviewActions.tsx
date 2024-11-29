import { Trans } from '@lingui/macro'
import { Button } from 'components'
import DgnETHButtonAppendix from 'components/dgneth/DgnETHButtonAppendix'
import Popup from 'components/popup'
import useRToken from 'hooks/useRToken'
import { atom, useAtomValue } from 'jotai'
import { useState } from 'react'
import { MoreHorizontal } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { estimatedApyAtom, rTokenListAtom } from 'state/atoms'
import { rTokenMetaAtom } from 'state/rtoken/atoms/rTokenAtom'
import { Box, Card, Link } from 'theme-ui'
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

  // TODO: Currently only doing X/Website as those are the only applicable for current listed rtokens
  if (tokenList[token.address].social?.twitter) {
    socials.push({
      label: 'X',
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
  <Card p={0}>
    {socials.map((social) => (
      <Link
        key={social.label}
        px={4}
        py={3}
        onClick={onClick}
        target="_blank"
        href={social.href}
        sx={{
          ':hover': { background: 'border' },
          color: 'text',
          display: 'block',
          cursor: 'pointer',
        }}
      >
        {social.label}
      </Link>
    ))}
  </Card>
)

const TokenSocials = () => {
  const socials = useAtomValue(tokenSocialsAtom)
  const [isVisible, setVisible] = useState(false)

  // Tokens without logo are not listed - no socials
  if (!socials) {
    return null
  }

  return (
    <Popup
      show={isVisible}
      onDismiss={() => setVisible(false)}
      content={
        <SocialList socials={socials} onClick={() => setVisible(false)} />
      }
    >
      <Button
        sx={{ width: ['100%', ''] }}
        variant="bordered"
        onClick={() => setVisible(true)}
      >
        <Box sx={{ height: 22 }}>
          <MoreHorizontal />
        </Box>
      </Button>
    </Popup>
  )
}

const OverviewActions = () => {
  const rToken = useRToken()
  const navigate = useNavigate()
  // TODO: Grab this from theGraph?
  const { holders, stakers, basket } = useAtomValue(estimatedApyAtom)

  return (
    <Box
      mt={4}
      mr={[4, 0]}
      mb={2}
      sx={{
        display: 'flex',
        flexDirection: ['column', 'row'],
        alignItems: 'left',
        gap: [2, 3],
      }}
    >
      <DgnETHButtonAppendix rTokenSymbol={rToken?.symbol} basketAPY={basket}>
        <Button
          variant="accent"
          onClick={() => navigate(`../${ROUTES.ISSUANCE}`)}
          sx={{ whiteSpace: 'nowrap' }}
        >
          <Trans>
            {!!holders
              ? `Mint ${formatCurrency(holders, 1)}% Est. APY`
              : 'Mint'}
          </Trans>
        </Button>
      </DgnETHButtonAppendix>
      <Button
        variant="bordered"
        onClick={() => navigate(`../${ROUTES.STAKING}`)}
        sx={{ whiteSpace: 'nowrap' }}
      >
        Stake RSR {!!stakers && `- ${formatCurrency(stakers, 1)}% Est. APY`}
      </Button>
      <TokenSocials />
    </Box>
  )
}

export default OverviewActions
