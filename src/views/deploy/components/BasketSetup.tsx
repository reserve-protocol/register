import { BoxProps, Grid } from 'theme-ui'
import BackupBasket from './BackupBasket'
import PrimaryBasket from './PrimaryBasket'

interface Props extends BoxProps {
  onViewChange(index: number): void
}
const BasketSetup = ({ ...props }: Props) => {
  return (
    <Grid gap={5} columns={[1, 2]} mb={4}>
      <PrimaryBasket />
      <BackupBasket />
    </Grid>
  )
}

export default BasketSetup
