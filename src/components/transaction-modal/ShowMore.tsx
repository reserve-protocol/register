import { Button } from '@/components/ui/button'
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
        <Button size="sm" variant="ghost" onClick={() => setVisible(!isVisible)}>
          <span className="flex items-center text-muted-foreground">
            <span className="mr-2">Show more</span>
            <AsteriskIcon />
          </span>
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
