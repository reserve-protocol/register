import { Button } from 'components'
import Sparkles from 'components/icons/Sparkles'
import { useState } from 'react'
import { Box, Text } from 'theme-ui'

const STORAGE_KEY = '3.0-announcement'

const Announcement = () => {
  const [show, setShow] = useState(!localStorage.getItem(STORAGE_KEY))

  if (!show) {
    return null
  }

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, 'dismissed')
    setShow(false)
  }

  return (
    <Box
      variant="layout.verticalAlign"
      sx={{
        backgroundColor: 'rBlueLight',
        border: '1px solid',
        borderColor: 'rBlue',
        borderRadius: '8px',
        flexWrap: 'wrap',
      }}
      px={3}
      py={2}
      mb={5}
    >
      <Box variant="layout.verticalAlign" mr={3} mb={[2, 2, 0]}>
        <Sparkles />
      </Box>
      <Box>
        <Box sx={{ fontWeight: 'bold' }}>
          <Text sx={{ color: 'rBlue' }}>Releasing 3.0.0</Text>{' '}
          <Text>of the Reserve Protocol V.1</Text>
        </Box>
        <Text as="p">
          Streamlining trades with Dutch Auctions, Fortifying Security, Enhanced
          Developer Experience & Governance improvements.
        </Text>
      </Box>
      <Box ml={[0, 0, 0, 'auto']} mt={[3, 3, 3, 0]}>
        <Button small variant="bordered" onClick={handleDismiss}>
          Dismiss
        </Button>
        <Button
          ml="3"
          small
          sx={{ backgroundColor: 'rBlue', whiteSpace: 'nowrap' }}
          onClick={() =>
            window.open(
              'https://blog.reserve.org/reserve-protocol-v1-3-0-0-release-9c539334f771',
              '_blank'
            )
          }
        >
          Read the blog post
        </Button>
      </Box>
    </Box>
  )
}

export default Announcement
