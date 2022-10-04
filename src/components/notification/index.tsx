import { X } from 'react-feather'
import toast from 'react-hot-toast'
import { Box, Button, Flex, Text } from 'theme-ui'

const Notification = ({
  toastId,
  icon,
  title,
  subtitle,
}: {
  toastId: string
  icon?: any
  title: string
  subtitle?: string
}) => {
  return (
    <Box p={2} sx={{ width: '100%' }}>
      <Flex>
        {!!icon && icon}
        <Button
          ml="auto"
          variant="circle"
          onClick={() => toast.remove(toastId)}
        >
          <X />
        </Button>
      </Flex>
      <Box mt={2}>
        <Text sx={{ display: 'block', color: 'text' }} mb={1}>
          {title}
        </Text>
        {!!subtitle && (
          <Text sx={{ fontSize: 1 }} variant="legend">
            {subtitle}
          </Text>
        )}
      </Box>
    </Box>
  )
}

export default Notification
