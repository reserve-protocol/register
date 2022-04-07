import { Flex, Text, BoxProps } from 'theme-ui'

interface Props extends BoxProps {
  title: string
  subtitle: string
}

const InfoBox = ({ title, subtitle, ...props }: Props) => (
  <Flex {...props} sx={{ flexDirection: 'column' }}>
    <Text variant="contentTitle">{title}</Text>
    <Text sx={{ fontSize: 3 }}>{subtitle}</Text>
  </Flex>
)

export default InfoBox
