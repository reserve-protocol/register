import { t, Trans } from '@lingui/macro'
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
      <Circle size={7} fill="#000" stroke="#999999" />
    </Box>
    <Box ml={3}>
      <Text variant="strong">{title}</Text>
      <Text variant="legend" sx={{ fontSize: 1 }}>
        {subtitle}
      </Text>
    </Box>
  </Box>
)

/**
 * View: Deploy
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
          <Text variant="sectionTitle" sx={{ fontWeight: 500 }} mb={2}>
            <Trans>First, Who is this for?</Trans>
          </Text>
          <Text as="p" variant="legend" sx={{ fontSize: 2 }}>
            <Trans>
              While it doesn’t require deep technical knowledge, this wizard
              requires you to thoughtfully design a good token. We encourage you
              to talk to the Reserve team and read the docs to learn more before
              confirming any transactions.
            </Trans>
          </Text>
          <Flex mt={3}>
            <SmallButton
              variant="muted"
              onClick={() =>
                window.open('https://discord.gg/Ryk6P67c', '_blank')
              }
              mr={3}
            >
              <Trans>Community Discord</Trans>
            </SmallButton>
            <SmallButton
              variant="muted"
              onClick={() =>
                window.open('https://reserve.org/protocol/', '_blank')
              }
            >
              <Trans>Protocol docs</Trans>
            </SmallButton>
          </Flex>
        </Box>
      </Box>
    </Grid>
  )
}

export default DeployIntro
