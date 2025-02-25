import {
  Box,
  Card as ThemeCard,
  CardProps,
  Divider,
  Flex,
  Text,
} from 'theme-ui'

const Card = ThemeCard

interface TitleCardProps extends CardProps {
  title?: string
  customTitle?: React.ReactNode
  right?: any
}

export const TitleCard = ({
  title,
  customTitle,
  right = null,
  children,
  ...props
}: TitleCardProps) => (
  <Card p={4} {...props}>
    <Flex sx={{ alignItems: 'center' }} pt={0} pb={2}>
      {customTitle ? customTitle : <Text sx={{ fontSize: 3 }}>{title}</Text>}
      <Box mx="auto" />
      <Box>{right}</Box>
    </Flex>
    <Divider mx={-4} mb={3} />
    {children}
  </Card>
)

export default Card
