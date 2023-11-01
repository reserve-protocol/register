import { Trans, t } from '@lingui/macro'
import { SmallButton } from 'components/button'
import DiscordIcon from 'components/icons/DiscordIcon'
import GithubIcon from 'components/icons/GithubIcon'
import { ContentHead } from 'components/info-box'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { Box, BoxProps, Grid, Link, Text } from 'theme-ui'
import { ROUTES } from 'utils/constants'

/**
 * Section: Home > About footer
 */
const About = (props: BoxProps) => {
  const navigate = useNavigate()

  const handleDeploy = () => {
    navigate(ROUTES.DEPLOY)
    document.getElementById('app-container')?.scrollTo(0, 0)
  }

  return (
    <Box px={[3, 4]} {...props}>
      <ContentHead title={t`About`} />
      <Grid columns={[1, 1, 2]} mt={7} gap={[4, 4, 7]}>
        <Box mb={[0, 7]}>
          <Text mb={3} variant="strong">
            <Trans>RTokens & Deploying your own</Trans>
          </Text>
          <Text variant="legend" as="p">
            <Trans>
              The creation of new RToken designs is permissionless. If you are
              the inventive type and have ideas for what assets should be in the
              basket, what a good governance looks like, or anything novel that
              could work within the realms of the protocol, please consider
              putting those ideas into practice or sharing them with the
              community.
            </Trans>
          </Text>
          <SmallButton variant="primary" mt={4} mb={6} onClick={handleDeploy}>
            <Trans>Open RToken Deployer</Trans>
          </SmallButton>
          <Text mb={3} variant="strong">
            <Trans>The Reserve Project</Trans>
          </Text>
          <Text variant="legend" as="p" mb={6}>
            <Trans>
              Reserve aims to help people around the world maintain their
              spending power by allowing anyone to create asset-backed
              currencies with tokenized assets on the Ethereum blockchain in
              customizable and novel ways. Read more here in
            </Trans>{' '}
            <Link
              sx={{ textDecoration: 'underline' }}
              href="https://reserve.org/protocol/"
              target="_blank"
            >
              <Trans>Reserve's documentation.</Trans>
            </Link>
          </Text>
          <Text mb={3} variant="strong">
            <Trans>User tracking</Trans>
          </Text>
          <Text variant="legend" as="p" mb={2}>
            <Trans>
              LC Labs uses industry standard anonymized analytics tools to
              understand usage and improve the user experience. LC labs does not
              collect any information about users or their financial activity.
            </Trans>
          </Text>
          <Text variant="legend" as="p" mb={[1, 3]}>
            <Trans>
              Please keep in mind that interactions on the blockchain are
              pseudonymous and publicly available.
            </Trans>
          </Text>
          <Text mb={3} variant="strong">
            <Trans>This app</Trans>
          </Text>
          <Text variant="legend" as="p" mb={4}>
            <Trans>
              Register is an open source project developed and maintained by LC
              Labs as the first dApp to interact with the Reserve Protocol and
              various RTokens deployed with the platform.
            </Trans>
          </Text>
          <Text variant="legend" as="p" mb={3}>
            <Trans>
              If an RToken is listed on Register, it doesn't mean that Reserve
              or LC Labs endorses the safety or risk levels of the RToken. LC
              Labs requires Github requests with additional information beyond
              what is available on the blockchain to give users relevant data to
              make informed decisions. As a user, please evaluate any new RToken
              carefully before holding or staking your RSR on them.
            </Trans>
          </Text>

          <Box variant="layout.verticalAlign" sx={{ fontSize: 5 }}>
            <RouterLink
              to="https://github.com/lc-labs"
              target="_blank"
              style={{ all: 'unset', cursor: 'pointer' }}
            >
              <GithubIcon style={{ marginRight: 20 }} />
            </RouterLink>
            <RouterLink
              to="'https://discord.gg/hQ2VJbjjg7'"
              style={{ all: 'unset', cursor: 'pointer' }}
              target="_blank"
            >
              <DiscordIcon />
            </RouterLink>
          </Box>
        </Box>
        <Box></Box>
      </Grid>
    </Box>
  )
}

export default About
