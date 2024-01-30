import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'react-feather'
import { Box, BoxProps, Divider, Flex } from 'theme-ui'

interface Props extends BoxProps {
  defaultOpen?: boolean
  open?: boolean
  onToggle?(state: boolean): void
  header: React.ReactNode
}

const CollapsableBox = ({
  defaultOpen = false,
  open,
  onToggle,
  children,
  header,
  ...props
}: Props) => {
  const [isOpen, setOpen] = useState(defaultOpen)

  return (
    <Box {...props}>
      <Flex
        sx={{ cursor: 'pointer', width: '100%' }}
        onClick={() => {
          if (onToggle) {
            onToggle(!open)
          } else {
            setOpen(!isOpen)
          }
        }}
      >
        <Box sx={{ width: '100%' }}>{header}</Box>
        <Box variant="layout.verticalAlign" ml="auto">
          {open || isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </Box>
      </Flex>
      {(open || isOpen) && (
        <>
          <Divider my={3} mx={-4} sx={{ borderColor: 'darkBorder' }} />
          {children}
        </>
      )}
    </Box>
  )
}

export default CollapsableBox
