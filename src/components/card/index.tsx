import { Box, Card as ThemeCard, Text } from '@theme-ui/components'

const Card = ({
  title = '',
  children,
  ...props
}: {
  title?: string
  children: any
  [x: string]: any
}) => (
  <ThemeCard {...props}>
    {title && (
      <Text sx={{ fontSize: 2, fontWeight: 'bold', display: 'block' }} mb={2}>
        {title}
      </Text>
    )}
    {children}
  </ThemeCard>
)

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
