import { Trans } from '@lingui/macro'
import { useAtomValue } from 'jotai'
import { rTokenAtom } from 'state/atoms'
import { Box, BoxProps, Link, Text } from 'theme-ui'

// TODO: Pull this info from listing
const About = (props: BoxProps) => {
  const rToken = useAtomValue(rTokenAtom)

  if (rToken?.isRSV) {
    return (
      <Box {...props}>
        <Text variant="title" mb={3}>
          <Trans>Overview</Trans>
        </Text>
        <Text variant="legend" as="p" mb={4}>
          Here you can find usage data about RSV, which is mostly used in the
          RPay app. Transactions data includes off-chain data that as been
          anonymized to protect user privacy.
        </Text>
        <Text variant="title" mb={3}>
          <Trans>About</Trans>
        </Text>
        <Text variant="legend" as="p">
          RSV is backed by a basket of on-chain collateral assets, held by the
          Reserve Vault smart contract. This basket is comprised of equal parts
          TUSD, USDP, and USDC — so each RSV is initially redeemable with the
          Reserve smart contracts for 1/3 TUSD + 1/3 USDP + 1/3 USDC. Since each
          RSV token is redeemable directly for this basket, value of the RSV
          token is economically linked to the value of the basket. This anchors
          RSV at $1.00, as each of the current collateral tokens is redeemable
          for USD 1:1.
          <br />
          <br />
          RSV is not integrated with the Reserve protocol at this time and is a
          separate discrete set of smart contracts.{' '}
          <Link
            href="https://reserve.org/protocol/how_rsv_works/index.html"
            target="_blank"
          >
            Learn more here.
          </Link>
        </Text>
      </Box>
    )
  }

  return (
    <Box {...props}>
      {rToken?.mandate && (
        <>
          <Text mb={3} variant="title">
            {rToken?.symbol} <Trans>Mandate</Trans>
          </Text>
          <Text as="p" variant="legend">
            {rToken?.mandate}
          </Text>
        </>
      )}
      {rToken?.meta?.about && (
        <>
          <Text mt={4} mb={3} variant="title">
            <Trans>About</Trans>
          </Text>
          <Text as="p" variant="legend">
            {rToken?.meta?.about}
          </Text>
        </>
      )}
      {!rToken?.meta?.about && !rToken?.mandate && (
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
