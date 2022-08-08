import styled from '@emotion/styled'
import { t, Trans } from '@lingui/macro'
import { SmallButton } from 'components/button'
import { Circle } from 'react-feather'
import { Box, BoxProps, Flex, Grid, Text } from 'theme-ui'

const InfoContainer = styled(Flex)`
  border-radius: 25px;
  border-color: var(--theme-ui-colors-border) !important;
  border-top: 2px solid;
  border-left: 2px solid;
  border-right: 2px solid;
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
  padding: 20px;
  padding-bottom: 0;
  align-items: center;
`

interface InfoBoxProps extends BoxProps {
  title: string
  subtitle: string
}

const InfoBox = ({ title, subtitle, ...props }: InfoBoxProps) => (
  <Box {...props}>
    <Text sx={{ fontSize: 1, fontWeight: 500, display: 'block' }}>{title}</Text>
    <Text variant="legend" as="p" sx={{ fontSize: 1 }}>
      {subtitle}
    </Text>
  </Box>
)

const Title = ({ prefix, text }: { prefix: string; text: string }) => (
  <Box
    sx={{ borderBottom: '1px solid', borderColor: 'border', fontSize: 4 }}
    py={3}
  >
    <Text sx={{ color: 'secondaryText' }}>{prefix}</Text>
    <Text sx={{ fontWeight: 500 }} pl={2}>
      {text}
    </Text>
  </Box>
)

interface StepItemProps extends BoxProps {
  title: string
  subtitle: string
}

const StepItem = ({ title, subtitle, ...props }: StepItemProps) => (
  <Box variant="layout.verticalAlign" {...props}>
    <Box>
      <Circle size={10} fill="#999999" stroke="#999999" />
    </Box>
    <Box ml={3}>
      <Text sx={{ display: 'block', fontSize: 3, fontWeight: 500 }}>
        {title}
      </Text>
      <Text variant="legend">{subtitle}</Text>
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
        <Title prefix="Tx 1." text={t`RToken Deploy`} />
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
          subtitle={t`Primary, emergency, target units & their initial scale`}
          mb={4}
        />
        <Title prefix="Tx 2." text={t`Governance Deploy`} />
        <StepItem
          title={t`Set Primary & Emergency collaterals`}
          subtitle={t`Primary, emergency, target units & their initial scale`}
          mb={4}
          mt={4}
        />
        <StepItem
          title={t`Set RToken parameters`}
          subtitle={t`Choose between simple setup & advanced settings`}
          mb={4}
        />
        <StepItem
          title={t`Deploy RToken`}
          subtitle={t`Primary, emergency, target units & their initial scale`}
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
              The Register RToken Deployer requires a good understanding of the
              Reserve Protocol. The interface itself doesn’t require deep
              technical knowledge, but it’s not for beginners. Talk to the
              Reserve team or read our docs to learn more.
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
            title="Something something"
            subtitle="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam maximus facilisis velit, at venenatis nunc iaculis vitae. Vestibulum ante ipsum primis in faucibus orci luctus et  posuere cubilia curae"
            mb={3}
          />
          <InfoBox
            title="Something something"
            subtitle="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam maximus facilisis velit, at venenatis nunc iaculis vitae. Vestibulum ante ipsum primis in faucibus orci luctus et  posuere cubilia curae"
            mb={3}
          />
          <InfoBox
            title="Something something"
            subtitle="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam maximus facilisis velit, at venenatis nunc iaculis vitae. Vestibulum ante ipsum primis in faucibus orci luctus et  posuere cubilia curae"
            mb={3}
          />
        </Box>
      </Box>
    </Grid>
  )
}

export default DeployIntro
