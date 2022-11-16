import { useEffect, useState } from 'react'
import { Box, Flex, Text } from 'theme-ui'

interface Props {
  readMore?: string
  id: string
}

const TopBanner = ({ id }: Props) => {
  const [isVisible, setVisible] = useState(false)

  useEffect(() => {
    if (!window.localStorage.getItem(`top-banner-${id}`)) {
      setVisible(true)
    }
  }, [])

  const handleDismiss = () => {
    setVisible(false)
    window.localStorage.setItem(`top-banner-${id}`, 'true')
  }

  if (!isVisible) {
    return null
  }

  return (
    <Flex
      sx={{
        justifyContent: 'center',
        backgroundColor: '#ebfffa',
        color: '#333',
      }}
      p="10px"
    >
      <Text>
        <strong>FYI</strong>, there has been a recent basket change to RSV that
        is temporarily affecting the metrics shown below.
      </Text>
      <Text
        sx={{ cursor: 'pointer', display: 'block' }}
        mx={3}
        variant="legend"
        onClick={handleDismiss}
      >
        Dismiss
      </Text>
      <Text
        as="a"
        sx={{ cursor: 'pointer' }}
        onClick={() =>
          window.open(
            'https://medium.com/reserve-currency/were-updating-the-rsv-backing-to-usdc-and-busd-8bff1e466358',
            '_blank'
          )
        }
      >
        <strong>Read more</strong>
      </Text>
    </Flex>
  )
}

export default TopBanner
