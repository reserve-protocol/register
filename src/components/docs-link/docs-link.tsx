import { Box, BoxProps } from 'theme-ui'
import ExternalArrowIcon from 'components/icons/ExternalArrowIcon'

interface Props extends BoxProps {
  link: any
  size?: number
}

const DocsLink = ({ link, sx = {}, ...props }: Props) => {
  return (
    <Box
      onClick={() => window.open('{ link }', '_blank')}
      sx={{ cursor: 'pointer', ...sx }}
      pt={2}
      ml={2}
    >
      <ExternalArrowIcon />
    </Box>
  )
}

export default DocsLink
