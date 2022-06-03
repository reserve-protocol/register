import { BoxProps, Box, Flex, Text } from 'theme-ui'

export interface IconInfoProps extends BoxProps {
  icon: any
  text: string
  title: string
}

const IconInfo = ({ icon, sx, title, text, ...props }: IconInfoProps) => (
  <Flex sx={{ alignItems: 'center', ...sx }} {...props}>
    {icon}
    <Box ml={2}>
      <Text variant="contentTitle">{title}</Text>
      <Text>{text}</Text>
    </Box>
  </Flex>
)

export default IconInfo
