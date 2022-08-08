import { Flex, Text, BoxProps, Box } from 'theme-ui'

// TODO: Change component structure for "InfoBoxes" or something more generic
interface Props extends BoxProps {
  title: string
  subtitle?: string
}

const InfoBox = ({ title, subtitle, ...props }: Props) => (
  <Box {...props}>
    <Text sx={{ fontSize: 1, fontWeight: 500, display: 'block' }}>{title}</Text>
    <Text variant="legend" as="p" sx={{ fontSize: 1 }}>
      {subtitle}
    </Text>
  </Box>
)

export const ContentHead = ({ title, subtitle, ...props }: Props) => (
  <Box {...props}>
    <Text sx={{ display: 'block', fontWeight: 500, fontSize: 3 }}>{title}</Text>
    {!!subtitle && <Text variant="legend">{subtitle}</Text>}
  </Box>
)

export const InfoHeading = ({ title, subtitle, ...props }: Props) => (
  <Box {...props}>
    <Text variant="legend" mb={2} sx={{ display: 'block' }}>
      {title}
    </Text>
    {!!subtitle && (
      <Text sx={{ fontSize: 4, fontWeight: 500 }}>{subtitle}</Text>
    )}
  </Box>
)

export default InfoBox
