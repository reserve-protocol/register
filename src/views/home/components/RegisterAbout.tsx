import { Trans } from '@lingui/macro'
import DiscordIcon from 'components/icons/DiscordIcon'
import GithubIcon from 'components/icons/GithubIcon'
import Logo from 'components/icons/Logo'
import { Link as RouterLink } from 'react-router-dom'
import { Box, Divider, Grid, Link, Text } from 'theme-ui'
import { DISCORD_INVITE, PROTOCOL_DOCS } from 'utils/constants'

const SocialLinks = () => (
  <Box variant="layout.verticalAlign" mt={4} sx={{ fontSize: 5 }}>
    <RouterLink
      to="https://github.com/lc-labs/register"
      target="_blank"
      style={{ all: 'unset', cursor: 'pointer' }}
    >
      <GithubIcon style={{ marginRight: 20 }} />
    </RouterLink>
    <RouterLink
      to={DISCORD_INVITE}
      style={{ all: 'unset', cursor: 'pointer' }}
      target="_blank"
    >
      <DiscordIcon />
    </RouterLink>
  </Box>
)

const Intro = () => (
  <Box>
    <Text variant="title">
      <Trans>A Brief RToken Introduction</Trans>
    </Text>
    <Grid columns={[1, 2]} gap={[0, 7]}>
      <Box>
        <Text mt={3} as="p" variant="legend">
          <Trans>
            Welcome to Register - the user interface for registering,
            inspecting, and interacting with RTokens. "RToken" is the generic
            name given to asset-backed stablecoins created on the Reserve
            Protocol, the creation of which is entirely permissionless.
          </Trans>
        </Text>
        <Text mt={2} as="p" variant="legend">
          <Trans>
            Whether you're an economist looking to improve the fiat standard, a
            DeFi-entrepreneur seeking to fill a gap in the market, or simply an
            innovator with a wild idea, anyone can create their own asset-backed
            currency.
          </Trans>
        </Text>
        <Text mt={2} as="p" variant="legend">
          <Trans>
            RTokens live on a blockchain, either Ethereum or Base, wich means
            that they can be transacted worldwide within seconds. They're also
            100% backed by other assets living on that same blockchain. The
            users of the currency can - at any time - redeem their RTokens for
            backing assets worthe the same value.
          </Trans>
        </Text>
      </Box>
      <Box>
        <Text mt={3} as="p" variant="legend">
          <Trans>
            Whenever you see the term "overcollateralization", we're referring
            to the built-in defence mechanism included in RTokens that help
            protect their stability in the case of any of their backing assets
            defaulting.
          </Trans>{' '}
          <Link
            sx={{ textDecoration: 'underline' }}
            href="https://www.youtube.com/watch?v=rXCAHlshSm8"
            target="_blank"
          >
            You can learn more about overcollateralization here.
          </Link>
        </Text>
        <Text mt={2} as="p" variant="legend">
          <Trans>
            Still have questions? Come talk to the Reserve community in our
            Discord server. We'd be more than happy to help!
          </Trans>{' '}
          <Link
            sx={{ textDecoration: 'underline' }}
            href={PROTOCOL_DOCS}
            target="_blank"
          >
            You can also read the Reserve Protocol Documentation.{' '}
          </Link>
        </Text>
      </Box>
    </Grid>
  </Box>
)

const About = () => (
  <Grid columns={[1, 2]} gap={[4, 7]}>
    <Box>
      <Text variant="title">
        <Trans>The Reserve Project</Trans>
      </Text>
      <Text mt={3} as="p" variant="legend">
        <Trans>
          Reserve aims to help people around the world maintain their spending
          power by allowing anyone to create asset-backed currencies with
          tokenized assets on the Ethereum blockchain in customizable and novel
          ways.
        </Trans>{' '}
        <Link
          sx={{ textDecoration: 'underline' }}
          href="https://reserve.org/"
          target="_blank"
        >
          Learn more about Reserve on their website.
        </Link>
      </Text>
      <Text mt={4} variant="title">
        <Trans>This App</Trans>
      </Text>
      <Text mt={2} as="p" variant="legend">
        <Trans>
          Register is an open source project developed and maintained by LC Labs
          as the first dApp to interact with the Reserve Protocol and various
          RTokens deployed with the platform.
        </Trans>
      </Text>
      <Text mt={2} as="p" variant="legend">
        <Trans>
          If an RToken is listed on Register, it doesn't mean that Reserve or LC
          Labs endorses the safety or risk levels of the RToken. LC Labs
          requires Github requests with additional information beyond what is
          available on the blockchain to give users relevant data to make
          informed decisions. As a user, please evaluate any new RToken
          carefully before holding or staking your RSR on them.
        </Trans>
      </Text>
    </Box>
    <Box>
      <Text variant="title">
        <Trans>User Tracking</Trans>
      </Text>
      <Text mt={2} as="p" variant="legend">
        <Trans>
          LC Labs uses industry standard anonymized analytics tools to
          understand usage and improve the user experience. LC labs does not
          collect any information about users or their financial activity.
        </Trans>
      </Text>
      <Text mt={2} as="p" variant="legend">
        <Trans>
          Please keep in mind that interactions with the Ethereum blockchain are
          pseudonymous and publicly available.
        </Trans>
      </Text>
    </Box>
  </Grid>
)

const DashedDivider = () => (
  <Divider sx={{ border: '1px dashed', borderColor: 'text' }} my={[7, 8]} />
)

/**
 * Section: Home > About footer
 */
const RegisterAbout = () => (
  <Box mt={[3, 7]} sx={{ borderTop: '1px solid', borderColor: 'border' }}>
    <Box variant="layout.wrapper" my={[3, 7]} px={4}>
      <Text variant="strong" mb={5} sx={{ fontSize: [4, 5] }}>
        <Trans>Not sure what you’re looking at?</Trans>
      </Text>
      <Intro />
      <DashedDivider />
      <About />
      <SocialLinks />

      <DashedDivider />
      <Box sx={{ textAlign: 'center' }}>
        <Logo />
        <Link
          sx={{ display: 'block', fontSize: 1 }}
          target="_blank"
          href="https://github.com/lc-labs"
        >
          <Text>Made by LC Labs</Text>
        </Link>
      </Box>
    </Box>
  </Box>
)

export default RegisterAbout
