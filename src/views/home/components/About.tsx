import { Trans } from '@lingui/macro'
import { SmallButton } from 'components/button'
import { useNavigate } from 'react-router-dom'
import { t } from '@lingui/macro'
import { ContentHead } from 'components/info-box'
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
    <Box {...props}>
      <ContentHead pl={3} title={t`About`} />
      <Grid columns={[1, 1, 2]} mt={7} px={3} gap={[4, 4, 7]}>
        <Box>
          <Text mb={2} variant="strong">
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
          <SmallButton py={2} mt={3} mb={5} onClick={handleDeploy}>
            <Trans>Deploy RToken</Trans>
          </SmallButton>
          <Text mb={2} variant="strong">
            <Trans>The Reserve Project</Trans>
          </Text>
          <Text variant="legend" as="p">
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
        </Box>
        <Box>
          <Text mb={2} variant="strong">
            <Trans>This app</Trans>
          </Text>
          <Text variant="legend" as="p" mb={5}>
            <Trans>
              Register is developed and maintained by LC Labs as the first dApp
              to interact with the Reserve Protocol and various RTokens deployed
              with the platform.
            </Trans>
            <br />
            <br />
            <Trans>
              If an RToken is listed on Register, it doesn't mean that Reserve
              or LC Labs endorses the safety or risk levels of the RToken. LC
              Labs requires Github requests with additional information beyond
              what is available on the blockchain to give users relevant data to
              make informed decisions. As a user, please evaluate any new RToken
              carefully before holding or staking your RSR on them.
            </Trans>
          </Text>
          <Text mb={2} variant="strong">
            <Trans>User tracking</Trans>
          </Text>
          <Text variant="legend" as="p" mb={4}>
            <Trans>
              LC Labs uses industry standard anonymized analytics tools to
              understand usage and improve the user experience. LC labs does not
              collect any information about users or their financial activity.
            </Trans>
            <br />
            <br />
            <Trans>
              Please keep in mind that interactions with the Ethereum blockchain
              are pseudonymous and publicly available.
            </Trans>
          </Text>
        </Box>
      </Grid>
    </Box>
  )
}

export default About
