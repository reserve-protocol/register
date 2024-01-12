import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'react-feather'
import { Box, BoxProps, Divider, Flex } from 'theme-ui'

interface Props extends BoxProps {
  open?: boolean
  header: React.ReactNode
}

const CollapsableBox = ({
  open = false,
  children,
  header,
  ...props
}: Props) => {
  const [isOpen, setOpen] = useState(open)

  return (
    <Box {...props}>
      <Flex
        sx={{ cursor: 'pointer', width: '100%' }}
        onClick={() => setOpen(!isOpen)}
      >
        <Box sx={{ width: '100%' }}>{header}</Box>
        <Box variant="layout.verticalAlign" ml="auto">
          {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </Box>
      </Flex>
      {isOpen && (
        <>
          <Divider my={3} mx={-4} sx={{ borderColor: 'darkBorder' }} />
          {children}
        </>
      )}
    </Box>
  )
}

export default CollapsableBox
