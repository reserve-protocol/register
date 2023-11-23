import { Button } from 'components'
import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'react-feather'
import { Box, BoxProps, Card, Divider, Spinner, Text } from 'theme-ui'

export interface RevenueBoxContainerProps extends BoxProps {
  icon: React.ReactNode
  title: string
  subtitle: string
  btnLabel?: string
  muted?: boolean
  defaultOpen?: boolean
  loading?: boolean
  right?: React.ReactNode
}

const RevenueBoxContainer = ({
  icon,
  title,
  subtitle,
  muted,
  children,
  defaultOpen,
  btnLabel = 'Inspect',
  loading = false,
  right,
  ...props
}: RevenueBoxContainerProps) => {
  const [expanded, setExpanded] = useState(!!defaultOpen)

  return (
    <Card
      p={0}
      sx={{
        border: '1px solid',
        borderColor: 'darkBorder',
        backgroundColor: 'background',
      }}
      {...props}
    >
      <Box p={3} variant="layout.verticalAlign">
        <Box mr={3} sx={{ color: !muted ? 'text' : 'muted', width: 22 }}>
          {icon}
        </Box>
        <Box>
          <Box variant="layout.verticalAlign">
            <Text variant="title">{title}</Text>
          </Box>
          {loading ? <Spinner size={16} /> : <Text>{subtitle}</Text>}
        </Box>
        {right ? (
          right
        ) : (
          <Button
            ml="auto"
            small
            sx={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: !muted ? 'primary' : 'muted',
              color: !muted ? 'white' : 'text',
            }}
            disabled={!!loading}
            onClick={() => setExpanded(!expanded)}
          >
            <Text mr={2}>{btnLabel}</Text>
            {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </Button>
        )}
      </Box>
      {expanded && (
        <>
          <Divider sx={{ borderColor: 'darkBorder' }} m={0} />
          <Box p={4} pt={0}>
            {children}
          </Box>
        </>
      )}
    </Card>
  )
}

export default RevenueBoxContainer
