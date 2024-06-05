import ExternalArrowIcon from 'components/icons/ExternalArrowIcon'
import { BoxProps, Flex } from 'theme-ui'

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
      mt={1}
    >
      <ExternalArrowIcon />
    </Flex>
  )
}

export default DocsLink
