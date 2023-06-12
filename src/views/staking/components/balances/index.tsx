import { Card, Box, BoxProps, Divider, Grid } from 'theme-ui'
import AvailableBalance from './AvailableBalance'
import PendingBalance from './PendingBalance'
import RSRBalance from './RSRBalance'
import StakeBalance from './StakeBalance'

/**
 * Display collateral tokens balances
 */
const Balances = (props: BoxProps) => (
  <Card p={0} {...props}>
    <Grid columns={[1, 2]} gap={0}>
      <StakeBalance />
      <Box
        sx={(theme: any) => ({
          borderLeft: ['none', `1px solid ${theme.colors.darkBorder}`],
          borderTop: [`1px solid ${theme.colors.darkBorder}`, 'none'],
        })}
      >
        <RSRBalance />
        <Divider m={0} sx={{ borderColor: 'darkBorder' }} />
        <AvailableBalance />
        <Divider m={0} sx={{ borderColor: 'darkBorder' }} />
        <PendingBalance />
      </Box>
    </Grid>
  </Card>
)

export default Balances
