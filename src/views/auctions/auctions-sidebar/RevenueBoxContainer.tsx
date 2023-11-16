import { Button } from 'components'
import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'react-feather'
import { Box, BoxProps, Card, Divider, Spinner, Text } from 'theme-ui'

interface RevenueBoxContainer extends BoxProps {
  icon: React.ReactNode
  title: string
  subtitle: string
  btnLabel: string
  muted?: boolean
  defaultOpen?: boolean
  loading?: boolean
}

const RevenueBoxContainer = ({
  icon,
  title,
  subtitle,
  btnLabel,
  muted,
  children,
  defaultOpen,
  loading = false,
  ...props
}: RevenueBoxContainer) => {
  const [expanded, setExpanded] = useState(!!defaultOpen)

  return (
    <Card
      p={0}
      sx={{ border: '1px dashed', backgroundColor: 'white' }}
      {...props}
    >
      <Box p={3} variant="layout.verticalAlign">
        <Box mr={3} sx={{ color: !muted ? 'text' : 'muted' }}>
          {icon}
        </Box>
        <Box>
          <Box variant="layout.verticalAlign">
            <Text variant="title">{title}</Text>
          </Box>
          {loading ? <Spinner size={16} /> : <Text>{subtitle}</Text>}
        </Box>
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
      </Box>
      {expanded && (
        <>
          <Divider sx={{ borderColor: 'darkBorder' }} m={0} />
          <Box p={3}>{children}</Box>
        </>
      )}
    </Card>
  )
}

export default RevenueBoxContainer
