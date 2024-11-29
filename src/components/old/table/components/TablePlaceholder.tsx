import { borderRadius } from 'theme'
import { BoxProps, Flex, Text } from 'theme-ui'

interface Props extends BoxProps {
  icon?: boolean // TODO: custom icon?
  text?: string
  loading?: boolean
}

const defaultText = 'No data found'

const TablePlaceholder = ({
  icon = false,
  text = defaultText,
  loading = false,
  ...props
}: Props) => (
  <Flex
    sx={{
      justifyContent: 'center',
      alignItems: 'center',
      border: '1px dashed',
      borderColor: 'darkBorder',
      borderRadius: borderRadius.boxes,
    }}
    p={7}
    mt={4}
    {...props}
  >
    <Text>{text}</Text>
  </Flex>
)

export default TablePlaceholder
