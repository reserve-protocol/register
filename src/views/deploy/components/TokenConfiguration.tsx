import { Trans } from '@lingui/macro'
import { Button } from 'components'
import RTokenLight from 'components/icons/RTokenLight'
import { borderRadius } from 'theme'
import { Box, Grid, Text } from 'theme-ui'
import BackingForm from './BackingForm'
import OtherForm from './OtherForm'
import StakingTokenInfo from './StakingTokenInfo'
import TokenForm from './TokenForm'

/**
 * View: Deploy
 * Token Configuration
 *
 * @param onViewChange(index: number)
 * @returns
 */
const TokenConfiguration = ({
  onViewChange,
}: {
  onViewChange(index: number): void
}) => (
  <Grid gap={5} columns={[1, 2]}>
    <Box>
      <TokenForm mb={4} />
      <BackingForm mb={4} />
      <OtherForm />
    </Box>
    <Box>
      <StakingTokenInfo />
      <Box
        sx={(theme: any) => ({
          display: 'flex',
          border: `1px solid ${theme.colors.border}`,
          borderRadius: borderRadius.boxes,
          alignItems: 'center',
          flexDirection: 'column',
          justifyContent: 'center',
          minHeight: 286,
        })}
      >
        <RTokenLight />
        <Text mt={3} mb={3} sx={{ fontSize: 3 }}>
          <Trans>Set your collateral basket</Trans>
        </Text>
        <Button onClick={() => onViewChange(1)} px={4}>
          <Trans>Set basket</Trans>
        </Button>
      </Box>
    </Box>
  </Grid>
)

export default TokenConfiguration
