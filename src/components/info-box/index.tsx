import Help from 'components/help'
import { Flex, Text, BoxProps, Box } from 'theme-ui'

// TODO: Change component structure for "InfoBoxes" or something more generic
interface Props extends BoxProps {
  title: string
  subtitle?: string
  help?: string
  light?: boolean
}

const InfoBox = ({ title, subtitle, light, ...props }: Props) => (
  <Box {...props}>
    <Text
      variant={light ? 'legend' : 'strong'}
      sx={{ fontSize: 1, display: 'block' }}
    >
      {title}
    </Text>
    <Text
      variant={light ? 'primary' : 'legend'}
      as="p"
      sx={{ fontSize: light ? 2 : 1 }}
    >
      {subtitle}
    </Text>
  </Box>
)

export const ContentHead = ({ title, subtitle, ...props }: Props) => (
  <Box {...props}>
    <Text
      sx={{ display: 'block', marginBottom: 1, fontWeight: 500, fontSize: 5 }}
    >
      {title}
    </Text>
    {!!subtitle && (
      <Text
        as="p"
        pr={3}
        sx={{ maxWidth: 620, fontWeight: 300 }}
        variant="legend"
      >
        {subtitle}
      </Text>
    )}
  </Box>
)

export const InfoHeading = ({ title, subtitle, help, ...props }: Props) => (
  <Box {...props}>
    <Flex mb={2} variant="layout.verticalAlign">
      <Text variant="legend" sx={{ fontWeight: 300 }}>
        {title}
      </Text>
      {!!help && <Help ml={2} size={14} mt="1px" content={help} />}
    </Flex>
    {!!subtitle && <Text variant="title">{subtitle}</Text>}
  </Box>
)

export default InfoBox
