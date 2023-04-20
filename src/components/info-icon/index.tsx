import Help from 'components/help'
import { BoxProps, Box, Flex, Text } from 'theme-ui'

export interface IconInfoProps extends BoxProps {
  icon: any
  text: string
  title: string
  help?: string
}

const IconInfo = ({ icon, sx, title, text, help, ...props }: IconInfoProps) => (
  <Flex sx={{ alignItems: 'center', ...sx }} {...props}>
    {icon}
    <Box ml={2}>
      <Box variant="layout.verticalAlign">
        <Text variant="contentTitle">{title}</Text>
        {!!help && <Help ml={2} content={help} />}
      </Box>
      <Text>{text}</Text>
    </Box>
  </Flex>
)

export default IconInfo
