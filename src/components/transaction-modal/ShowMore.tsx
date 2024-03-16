import Button from 'components/button'
import AsteriskIcon from 'components/icons/AsteriskIcon'
import { useState } from 'react'
import { Box, BoxProps, Divider, Text } from 'theme-ui'

const ShowMore = ({ children, ...props }: BoxProps) => {
  const [isVisible, setVisible] = useState(false)

  return (
    <Box {...props}>
      <Box variant="layout.verticalAlign">
        <Divider
          sx={{ flexGrow: 1, borderStyle: 'dashed', borderColor: 'darkBorder' }}
        />
        <Button small variant="hover" onClick={() => setVisible(!isVisible)}>
          <Box variant="layout.verticalAlign" sx={{ color: 'secondaryText' }}>
            <Text mr="2">Show more</Text>
            <AsteriskIcon />
          </Box>
        </Button>
        <Divider
          sx={{ flexGrow: 1, borderStyle: 'dashed', borderColor: 'darkBorder' }}
        />
      </Box>
      {isVisible && <Box mt={2}>{children}</Box>}
    </Box>
  )
}

export default ShowMore
