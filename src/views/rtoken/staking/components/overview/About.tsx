import { Trans, t } from '@lingui/macro'
import ExpandableContent from '@/components/old/expandable-content'
import { Box, BoxProps, Text } from 'theme-ui'

const faqs = [
  {
    title: <Trans>Staking RSR</Trans>,
    content: (
      <Trans>
        When staking RSR, you are putting your RSR at risk in the case of a
        collateral default in exchange for 1) the rights to govern the RToken
        and 2) for a portion of the revenue generated by the collateral. The
        revenue sent to the staked RSR pool will be distributed amongst RSR
        stakers proportionally to their stake in the pool.
      </Trans>
    ),
  },
  {
    title: <Trans>Mechanics</Trans>,
    content: (
      <Trans>
        When you stake your RSR, you will receive a stRSR receipt token which
        represents your ownership in the staked RSR contract. As revenue is
        distributed, the receipt token will be redeemable for an increasing
        amount of RSR. If there is a default scenario where the staked RSR is
        slashed, then the receipt token will be redeemable for a decreased
        amount of RSR.
      </Trans>
    ),
  },
  {
    title: <Trans>Unstaking RSR</Trans>,
    content: (
      <Trans>
        When you unstake your stRSR, there will be a delay (defined by
        governance). This is to eliminate game theory scenarios that would make
        the backstop RSR staked pool less effective because people would
        continually be incentivized to unstake and restake.
      </Trans>
    ),
  },
  {
    title: <Trans>Risk evaluation</Trans>,
    content: (
      <Trans>
        Please carefully evaluate the RToken before choosing to stake your RSR
        here. If any of the various collaterals of this RToken default, then the
        staked RSR will be the first funds that get auctioned off to make up the
        difference for RToken holders.
      </Trans>
    ),
  },
]

const About = (props: BoxProps) => (
  <Box variant="layout.borderBox" p={4} {...props}>
    {faqs.map((faq, i) => (
      <ExpandableContent key={`About.${i}`} {...faq} />
    ))}
  </Box>
)

export default About
