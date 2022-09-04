import { t, Trans } from '@lingui/macro'
import { InfoBox } from 'components'
import { SmallButton } from 'components/button'
import { Circle } from 'react-feather'
import { Box, BoxProps, Flex, Grid, Text } from 'theme-ui'

interface InfoBoxProps extends BoxProps {
  title: string
  subtitle: string
}

const Title = ({ prefix, text }: { prefix: string; text: string }) => (
  <Box
    sx={{ borderBottom: '1px solid', borderColor: 'border', fontSize: 3 }}
    py={3}
  >
    <Text sx={{ color: 'secondaryText' }}>{prefix}</Text>
    <Text sx={{ fontWeight: 500 }} pl={2}>
      {text}
    </Text>
  </Box>
)

const StepItem = ({ title, subtitle, ...props }: InfoBoxProps) => (
  <Box variant="layout.verticalAlign" {...props}>
    <Box>
      <Circle size={10} fill="#999999" stroke="#999999" />
    </Box>
    <Box ml={3}>
      <Text sx={{ display: 'block', fontWeight: 500 }}>{title}</Text>
      <Text variant="legend" sx={{ fontSize: 1 }}>
        {subtitle}
      </Text>
    </Box>
  </Box>
)

/**
 * View: Deploy
 *
 * TODO: Info links
 * TODO: Text copy
 */
const DeployIntro = () => {
  // const navigate = useNavigate()

  return (
    <Grid
      columns={2}
      sx={{ backgroundColor: 'contentBackground', borderRadius: 10 }}
    >
      <Box
        px={5}
        py={4}
        sx={{ borderRight: '1px solid', borderColor: 'border' }}
      >
        <Title prefix="Tx 1." text={t`RToken Deployment`} />
        <StepItem
          title={t`Set Primary & Emergency collaterals`}
          subtitle={t`Primary, emergency, target units & their initial scale`}
          mt={4}
          mb={4}
        />
        <StepItem
          title={t`Set RToken parameters`}
          subtitle={t`Choose between simple setup & advanced settings`}
          mb={4}
        />
        <StepItem
          title={t`Deploy RToken`}
          subtitle={t`Create necessary smart contracts for all RTokens ops`}
          mb={4}
        />
        <Title prefix="Tx 2." text={t`Governance Deployment`} />
        <StepItem
          title={t`Default RSR Governance`}
          subtitle={t`Anyone can stake RSR to participate in governance decisions`}
          mb={4}
          mt={4}
        />
        <StepItem
          title={t`Roles & Permissions`}
          subtitle={t`Set the guardian, and pauser roles`}
          mb={4}
        />
        <StepItem
          title={t`Voting Schedules`}
          subtitle={t`Set proposal period, voting period, implementation period`}
        />
      </Box>
      <Box px={5} py={4}>
        <Box>
          <Text
            mt={2}
            mb={2}
            sx={{
              display: 'block',
              fontSize: 4,
            }}
          >
            👋
          </Text>
          <Text variant="sectionTitle" sx={{ fontWeight: 500 }}>
            <Trans>First, Who is this for?</Trans>
          </Text>
          <Text as="p" variant="legend" sx={{ fontSize: 1 }}>
            <Trans>
              While it doesn’t require deep technical knowledge, this wizard
              requires you to thoughtfully design a good token. We encourage you
              to talk to the Reserve team and read the docs to learn more before
              confirming any transactions.
            </Trans>
          </Text>
          <Flex mt={3}>
            <SmallButton variant="muted" mr={3}>
              <Trans>Community Discord</Trans>
            </SmallButton>
            <SmallButton variant="muted">
              <Trans>Protocol docs</Trans>
            </SmallButton>
          </Flex>
        </Box>
        <Box mt={6}>
          <InfoBox
            title={t`Default Configuration`}
            subtitle={t`This tool will guide you through the RToken deployment process with the out-of-the-box collateral plugins, parameter recommendations, and governance contracts. `}
            mb={3}
          />
          <InfoBox
            title="Customization is Possible"
            subtitle="But most things can be customized! There is a huge amount of flexibility possible with the Reserve protocol and if you are considering changes, please check with team in case there are unforseen consequences."
            mb={3}
          />
        </Box>
      </Box>
    </Grid>
  )
}

export default DeployIntro
