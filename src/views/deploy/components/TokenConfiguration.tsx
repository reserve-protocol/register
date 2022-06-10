import { Box, BoxProps, Grid } from 'theme-ui'
import BackingForm from './BackingForm'
import BasketOverview from './BasketOverview'
import OtherForm from './OtherForm'
import TokenForm from './TokenForm'

interface Props extends BoxProps {
  onViewChange(index: number): void
}

const TokenConfiguration = ({ onViewChange }: Props) => (
  <Grid gap={5} columns={[1, 2]}>
    <Box>
      <TokenForm mb={4} />
      <BackingForm mb={4} />
      <OtherForm />
    </Box>
    <Box>
      <BasketOverview onSetup={() => onViewChange(1)} />
    </Box>
  </Grid>
)

export default TokenConfiguration
