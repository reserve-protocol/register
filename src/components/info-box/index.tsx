import { Box, Text } from '@theme-ui/components'

export type IInfoBox = {
  title: string
  subtitle: string
  description?: string
}

const InfoBox = ({ title, subtitle, description, ...props }: IInfoBox) => (
  <Box {...props} sx={{ textAlign: 'center' }}>
    <Text
      sx={{ fontSize: 5, display: 'block', marginBottom: description ? 0 : 3 }}
    >
      {title}
    </Text>
    {!!description && (
      <Text sx={{ display: 'block', fontSize: 1, marginTop: '-5px' }}>
        Description
      </Text>
    )}
    <Text sx={{ fontSize: 3 }}>{subtitle}</Text>
  </Box>
)

export default InfoBox
