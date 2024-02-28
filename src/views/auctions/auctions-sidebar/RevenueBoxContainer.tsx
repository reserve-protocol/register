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
        backgroundColor: 'backgroundNested',
      }}
      {...props}
    >
      <Box p={3} variant="layout.verticalAlign">
        <Box mx={2} sx={{ color: !muted ? 'text' : 'muted', width: 22 }}>
          {icon}
        </Box>
        <Box>
          <Box variant="layout.verticalAlign">
            <Text variant="title" sx={{ fontSize: [2, 3] }}>
              {title}
            </Text>
          </Box>
          {loading ? (
            <Spinner size={16} />
          ) : (
            <Text sx={{ fontSize: [1, 2] }}>{subtitle}</Text>
          )}
        </Box>
        {right ? (
          right
        ) : (
          <Button
            ml="auto"
            small
            sx={{
              display: 'flex',
              flexShrink: 0,
              alignItems: 'center',
              backgroundColor: !muted ? 'primary' : 'secondary',
              color: !muted ? 'white' : 'text',
            }}
            disabled={!!loading}
            onClick={() => setExpanded(!expanded)}
          >
            <Text sx={{ fontSize: [0, 1] }} mr={2}>
              {btnLabel}
            </Text>
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
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
