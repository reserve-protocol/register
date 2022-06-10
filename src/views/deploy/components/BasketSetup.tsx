import { Button } from 'components'
import { Grid, Box, BoxProps } from 'theme-ui'

interface Props extends BoxProps {
  onViewChange(index: number): void
}
const BasketSetup = ({ onViewChange, ...props }: Props) => {
  return (
    <Grid gap={5} columns={[1, 2]} mb={4}>
      <Box>
        <Button onClick={() => onViewChange(0)}>overview</Button>
      </Box>
      <Box>asdsd</Box>
    </Grid>
  )
}

export default BasketSetup
