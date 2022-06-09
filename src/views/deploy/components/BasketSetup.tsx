import { Button } from 'components'
import { Box, BoxProps } from 'theme-ui'

interface Props extends BoxProps {
  onViewChange(index: number): void
}
const BasketSetup = ({ onViewChange, ...props }: Props) => {
  return (
    <Box>
      <Button onClick={() => onViewChange(0)}>overview</Button>
    </Box>
  )
}

export default BasketSetup
