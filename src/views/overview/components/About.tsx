import { Trans, t } from '@lingui/macro'
import { useAtomValue } from 'jotai'
import { rTokenAtom } from 'state/atoms'
import { Box, BoxProps, Link, Text } from 'theme-ui'
import MandateIcon from 'components/icons/MandateIcon'
import rtokens from 'utils/rtokens'

// TODO: Pull this info from listing
const About = (props: BoxProps) => {
  const rToken = useAtomValue(rTokenAtom)

  if (rToken && !rToken.main) {
    return (
      <Box {...props} px={3} sx={{ maxWidth: '720px' }}>
        <Text variant="title" mb={3}>
          <Trans>About</Trans>
        </Text>
        <Text variant="legend" as="p">
          <Trans>
            RSV is backed by a basket of on-chain collateral assets, held by the
            Reserve Vault smart contract. This basket is currently compromised
            of entirely USDC — so each RSV is initially redeemable with the
            Reserve smart contracts for 1 USDC. Since each RSV token is
            redeemable directly for this basket, value of the RSV token is
            economically linked to the value of the basket. This anchors RSV at
            $1.00, as each of the current collateral tokens is redeemable for
            USD 1:1.
          </Trans>{' '}
        </Text>
        <Link
          href="https://medium.com/reserve-currency/preparing-to-exclude-busd-from-rsvs-backing-4af7e575dcfb"
          target="_blank"
          sx={{ textDecoration: 'underline' }}
        >
          <Trans>Read more here on most recent backing change.</Trans>
        </Link>
      </Box>
    )
  }

  return (
    <Box {...props} pt={2} px={3} sx={{ maxWidth: '720px' }}>
      {rToken?.mandate && (
        <>
          <MandateIcon />
          <Text mb={2} mt={2} variant="pageTitle">
            {rToken?.symbol} <Trans>Mandate</Trans>
          </Text>
          <Text as="p" variant="legend">
            {rToken?.mandate}
          </Text>
        </>
      )}
      {rToken?.listed && (
        <>
          <Text mt={4} mb={2} variant="title">
            <Trans>+ Off-chain note</Trans>
          </Text>
          <Text as="p" variant="legend">
            {rtokens[rToken.address]?.about}
          </Text>
        </>
      )}
      {!rToken?.listed && !rToken?.mandate && (
        <>
          <Text mb={3} variant="title">
            <Trans>About</Trans>
          </Text>
          <Text as="p" variant="legend">
            <Trans>There is no information about this token.</Trans>
          </Text>
        </>
      )}
    </Box>
  )
}

export default About
