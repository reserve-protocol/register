import { Trans } from '@lingui/macro'
import CollaterizationIcon from 'components/icons/CollaterizationIcon'
import { ListedToken } from 'hooks/useTokenList'
import { memo, useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Box, BoxProps, Divider, Text } from 'theme-ui'
import CollateralPieChartTooltip from '@/views/yield-dtf/overview/components/CollateralPieChartTooltip'

interface Props extends BoxProps {
  token: ListedToken
}

const MobileCollateralInfo = ({ token }: Props) => {
  const [collapsed, setCollapsed] = useState(true)
  const navigate = useNavigate()

  return (
    <Box
      variant="layout.centered"
      sx={{
        gap: 2,
        alignItems: 'start',
        justifyContent: 'start',
        display: ['block', 'none'],
        width: '100%',
      }}
    >
      <Divider my={3} sx={{ borderColor: 'darkBorder', width: '100%' }} />
      <Box
        variant="layout.verticalAlign"
        sx={{
          gap: 2,
          display: ['flex', 'none'],
          justifyContent: 'space-between',
          width: '100%',
        }}
        onClick={(e) => {
          e.stopPropagation()
          setCollapsed((c) => !c)
        }}
      >
        <Box variant="layout.verticalAlign" sx={{ gap: 2 }}>
          <CollaterizationIcon />
          <Text variant="legend">
            <Trans>Backing + Overcollaterization:</Trans>
          </Text>
        </Box>
        <Box variant="layout.verticalAlign" sx={{ gap: 1 }}>
          <Text variant="strong" color="text">
            {(token.backing + token.overcollaterization).toFixed(0)}%
          </Text>
          {collapsed ? (
            <ChevronDown fontSize={16} color="#808080" />
          ) : (
            <ChevronUp fontSize={16} color="#808080" />
          )}
        </Box>
      </Box>
      <Box
        sx={{
          overflow: 'hidden',
          maxHeight: collapsed ? '0px' : '1000px',
          transition: 'max-height 0.4s ease-in-out',
        }}
      >
        <Box
          variant="layout.centered"
          sx={{ gap: 2, width: '100%', display: ['flex', 'none'] }}
        >
          <Divider sx={{ borderColor: 'darkBorder', width: '100%' }} />
          <CollateralPieChartTooltip token={token} />
          {/* <Button
            medium
            onClick={() => handleNavigate(ROUTES.OVERVIEW)}
            variant="transparent"
            fullWidth
            px={3}
            py={2}
          >
            <Box
              variant="layout.verticalAlign"
              sx={{ gap: 2, justifyContent: 'center' }}
            >
              <CollaterizationIcon />
              <Text sx={{ fontWeight: 700 }}>{t`Full exposure view`}</Text>
              <ChevronRight />
            </Box>
          </Button> */}
        </Box>
      </Box>
    </Box>
  )
}

export default memo(MobileCollateralInfo)
