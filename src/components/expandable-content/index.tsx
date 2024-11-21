import { useState } from 'react'
import { Minus, Plus } from 'react-feather'
import { Box, BoxProps, Text } from 'theme-ui'

export interface ExpandableContentProps
  extends Omit<BoxProps, 'title' | 'content'> {
  title: React.ReactNode
  content: React.ReactNode
  expanded?: boolean
}

const ExpandableContent = ({
  title,
  content,
  expanded = false,
  ...props
}: ExpandableContentProps) => {
  const [isOpen, setOpen] = useState(expanded)

  return (
    <Box {...props}>
      <Box
        py={2}
        variant="layout.verticalAlign"
        sx={{ cursor: 'pointer', fontSize: 3 }}
        onClick={() => setOpen(!isOpen)}
      >
        <Text variant="bold" mr="auto">
          {title}
        </Text>
        {isOpen ? <Minus /> : <Plus />}
      </Box>
      {isOpen && (
        <Box py={2} sx={{ color: 'secondaryText' }}>
          {content}
        </Box>
      )}
    </Box>
  )
}

export default ExpandableContent
