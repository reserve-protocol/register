import { Box, Card as ThemeCard, Text } from 'theme-ui'

const Card = ThemeCard

export const SectionCard = ({
  children,
  title,
  ...props
}: {
  children: any
  title: string
}) => (
  <Box {...props}>
    <Text variant="sectionTitle" mb={2}>
      {title}
    </Text>
    <Card>{children}</Card>
  </Box>
)

export default Card
