import { Box, Flex, BoxProps } from 'theme-ui'
import ExternalArrowIcon from 'components/icons/ExternalArrowIcon'

interface Props extends BoxProps {
  link: any
  size?: number
}

const DocsLink = ({ link }: Props) => {
  return (
    <Flex
      onClick={() => window.open(link, '_blank')}
      sx={{ cursor: 'pointer' }}
      ml={2}
    >
      <ExternalArrowIcon />
    </Flex>
  )
}

export default DocsLink
