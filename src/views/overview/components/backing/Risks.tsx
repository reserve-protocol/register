import { Trans, t } from '@lingui/macro'
import AsteriskIcon from 'components/icons/AsteriskIcon'
import RBrand from 'components/icons/RBrand'
import RiskIcon from 'components/icons/RiskIcon'
import { useMemo } from 'react'
import { Box, BoxProps, Card, Flex, Link, Text } from 'theme-ui'

const Brand = (props: BoxProps) => {
  return (
    <Flex
      sx={{
        width: 20,
        height: 20,
        backgroundColor: 'accent',
        justifyContent: 'center',
        alignItems: 'center',
      }}
      {...props}
    >
      <RBrand />
    </Flex>
  )
}

const Section = ({
  title,
  description,
}: {
  title: string
  description: React.ReactNode
}) => (
  <Box p={4} sx={{ borderBottom: '1px solid', borderColor: 'border' }}>
    <Box variant="layout.verticalAlign" mb={3}>
      <Brand />
      <Text ml="2" variant="bold">
        {title}
      </Text>
    </Box>
    {description}
  </Box>
)

const Risks = () => {
  const content = useMemo(
    () => [
      {
        title: t`Reserve Protocol Smart-Contract Risk`,
        description: (
          <Text as="p">
            Because the Reserve protocol is built using smart contracts, it’s
            possible that undiscovered bugs or vulnerabilities in these
            contracts could be exploited, resulting in loss of user funds.
            Accordingly, the protocol’s contracts undergo{' '}
            <Link
              target="_blank"
              href="https://reserve.org/protocol/security/#smart-contract-security-audits"
            >
              regular and rigorous security audits.
            </Link>
          </Text>
        ),
      },
      {
        title: 'Collateral Plugin Wrappers',
        description: (
          <Text as="p">
            There are a{' '}
            <Link
              target="_blank"
              href="https://reserve.org/protocol/security/#collateral-asset-risks"
            >
              handful of risks
            </Link>{' '}
            associated with any given RToken’s collateral assets, including
            assets’ redeemability, the health of their reserves, price
            volatility, etc. Likewise, because many RTokens leverage assets from
            external protocols, RToken holders assume all of the risks of its
            underlying protocols (smart contract, governance, or otherwise).
          </Text>
        ),
      },
      {
        title: 'Governance',
        description: (
          <Text as="p">
            Because RTokens are governed in a decentralized manner by those
            staking their RSR on the RToken, the possibility of “governance
            attacks” exists. While{' '}
            <Link
              href="https://reserve.org/protocol/security/#reserve-protocol-risks"
              target="_blank"
            >
              undesirable governance outcomes
            </Link>{' '}
            are possible, the protocol’s design ensures that there is sufficient
            incentivisation for responsible, balanced governance decisions.
            Built-in delays throughout the governance cycle also provide
            additional layers of security. Nevertheless, research on a specific
            RToken’s governance structure is strongly recommended.
          </Text>
        ),
      },
    ],
    []
  )

  return (
    <Card variant="inner">
      <Box
        variant="layout.verticalAlign"
        p={4}
        sx={{ borderBottom: '1px solid', borderColor: 'border' }}
      >
        <RiskIcon />
        <Text ml="2" mr="auto" variant="bold" sx={{ fontSize: 3 }}>
          <Trans>Other Risks</Trans>
        </Text>
      </Box>
      {content.map((item, index) => (
        <Section key={index} {...item} />
      ))}
      <Box variant="layout.verticalAlign" p={4}>
        <AsteriskIcon />
        <Text ml="2" variant="legend">
          This list is not intended to be conclusive.{' '}
          <Link
            href="https://reserve.org/protocol/security/"
            target="_blank"
            sx={{ textDecoration: 'underline' }}
          >
            You can read more about risk in the Reserve docs.
          </Link>
        </Text>
      </Box>
    </Card>
  )
}

export default Risks
