import { Trans } from '@lingui/macro'
import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Box, BoxProps, Text } from 'theme-ui'

interface Props extends BoxProps {
  count: number // number of changes
  title: string
  collapsed?: boolean
}

const PreviewBox = ({
  count,
  title,
  children,
  collapsed = true,
  ...props
}: Props) => {
  const [visible, setVisible] = useState(!collapsed)

  return (
    <Box {...props}>
      <Box
        variant="layout.verticalAlign"
        onClick={() => setVisible(!visible)}
        sx={{
          borderBottom: visible ? '1px solid' : 'none',
          borderColor: 'border',
          cursor: 'pointer',
        }}
        pb={visible ? 3 : 0}
      >
        <Box>
          <Box variant="layout.verticalAlign">
            <Text variant="strong" mr={2}>
              {count}
            </Text>
            <Text variant="legend" sx={{ fontSize: 1 }}>
              <Trans>Change in:</Trans>
            </Text>
          </Box>

          <Text variant="strong">{title}</Text>
        </Box>
        <Box ml="auto" variant="layout.verticalAlign">
          {visible ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </Box>
      </Box>
      {visible && children}
    </Box>
  )
}

export default PreviewBox
