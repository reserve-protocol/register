import { t, Trans } from '@lingui/macro'
import { useFormContext } from 'react-hook-form'
import { Box, Text, Flex, BoxProps, Divider, Grid } from 'theme-ui'

interface InfoProps extends BoxProps {
  title: string
  subtitle: string
}

const Info = ({ title, subtitle, ...props }: InfoProps) => {
  return (
    <Box {...props}>
      <Text variant="legend" sx={{ display: 'block', fontSize: 0 }}>
        {title}
      </Text>
      <Flex variant="layout.verticalAlign">
        <Text sx={{ fontSize: 2 }}>{subtitle}</Text>
      </Flex>
    </Box>
  )
}

const GovernanceSummary = () => {
  const { getValues } = useFormContext()
  const {
    defaultGovernance,
    unfreeze,
    votingDelay, // 5 blocks
    votingPeriod, // 100 blocks
    proposalThresholdAsMicroPercent, // 1%
    quorumPercent, // 4%
    minDelay, // 24 hours -> 86400
    freezer,
    pauser,
    owner,
  } = getValues()

  return (
    <Grid columns={2} mb={3} gap={0} variant="layout.card">
      <Box
        px={5}
        py={4}
        sx={{ borderRight: '1px solid', borderColor: 'border' }}
      >
        <Text variant="title">
          <Trans>Permissions</Trans>
        </Text>
        <Divider my={3} />
        {!defaultGovernance && (
          <Info mb={3} title={t`RToken Owner address`} subtitle={owner} />
        )}
        <Info mb={3} title={t`RToken Freezer address`} subtitle={freezer} />
        <Info mb={3} title={t`RToken Pauser address`} subtitle={pauser} />
        {defaultGovernance && (
          <>
            <Text variant="title">
              <Trans>Governance Parameters</Trans>
            </Text>
            <Divider my={3} />
            <Info
              mb={3}
              title={t`Voting Delay`}
              subtitle={`${votingDelay} blocks`}
            />
            <Info
              mb={3}
              title={t`Voting Period`}
              subtitle={`${votingPeriod} blocks`}
            />
            <Info
              mb={3}
              title={t`Proposal Threshold`}
              subtitle={`${proposalThresholdAsMicroPercent}%`}
            />
            <Info mb={3} title={t`Quorum`} subtitle={`${quorumPercent}%`} />
            <Info
              mb={3}
              title={t`Minimum delay`}
              subtitle={`${minDelay} hours`}
            />
          </>
        )}
      </Box>
      <Box px={5} py={4}>
        <Info
          mb={3}
          title={t`Default Governance?`}
          subtitle={defaultGovernance ? 'Yes' : 'No'}
        />
        <Info
          mb={3}
          title={t`Leave RToken on freeze?`}
          subtitle={unfreeze === '0' ? 'Yes' : 'No'}
        />
      </Box>
    </Grid>
  )
}

export default GovernanceSummary
