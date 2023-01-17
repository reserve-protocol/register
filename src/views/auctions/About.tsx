import { Trans } from '@lingui/macro'
import { SmallButton } from 'components/button'
import { t } from '@lingui/macro'
import { ContentHead } from 'components/info-box'
import { Box, BoxProps, Grid, Text, Flex } from 'theme-ui'

/**
 * Section: Auction > About auctions footer
 */
const About = (props: BoxProps) => {
  return (
    <Box {...props}>
      <ContentHead pl={3} title={t`About`} />
      <Grid columns={[1, 1, 2]} mt={7} px={3} gap={[4, 4, 7]}>
        <Box>
          <Text mb={3} variant="strong">
            <Trans>
              The Reserve Protocol makes a few different types of trades
            </Trans>
          </Text>
          <ul>
            <Text variant="legend" as="p" mb={3}>
              <li>
                From collateral to RSR or RToken, in order to distribute
                collateral yields. These happen often.
              </li>
            </Text>

            <Text variant="legend" as="p" mb={3}>
              <li>
                From reward tokens to RSR or RToken, in order to distribute
                tokens rewards from collateral. These also happen often.
              </li>
            </Text>

            <Text variant="legend" as="p" mb={3}>
              <li>
                RSR to collateral, in order to recollateralize the protocol from
                stRSR over-collateralization, after a basket change. These
                auctions should be even rarer, happening when there's a basket
                change and insufficient capital to achieve recollateralization
                without using the over-collateralization buffer.
              </li>
            </Text>
            <Text variant="legend" as="p" mb={4}>
              <li>
                RSR to collateral, in order to recollateralize the protocol from
                stRSR over-collateralization, after a basket change. These
                auctions should be even rarer, happening when there's a basket
                change and insufficient capital to achieve recollateralization
                without using the over-collateralization buffer.
              </li>
            </Text>
          </ul>
          <Text variant="legend" as="p" mb={3}>
            <Trans>
              Each type of trade can currently happen in only one way; the
              protocol launches a Gnosis EasyAuction. The Reserve Protocol is
              designed to make it easy to add other trading methods, but none
              others are currently supported.
            </Trans>
          </Text>
          <Text variant="legend" as="p" mb={3}>
            <Trans>
              A good explainer for how Gnosis auctions work can be found (on
              their github)[https://github.com/gnosis/ido-contracts].
            </Trans>
          </Text>
        </Box>
        <Box>
          <Text mb={3} variant="strong">
            <Trans>How to see current surplus & trigger an auction</Trans>
          </Text>
          <Text variant="legend" as="p" mb={3}>
            <Trans>
              Here we should put text and add links to tools they can use to
              monitor and trigger auctions. We explain that this feature should
              eventually come to Register but it's not currently being worked
              on.
            </Trans>
          </Text>
        </Box>
      </Grid>
    </Box>
  )
}

export default About
