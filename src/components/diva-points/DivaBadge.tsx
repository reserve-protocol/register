import DivaIcon from 'components/icons/DivaIcon'
import { Box, Text } from 'theme-ui'
import { DIVA_SAFE_POOLS } from 'utils/constants'

type Props = {
  poolId?: string
}

const DivaBadge = ({ poolId }: Props) => {
  const show = poolId && DIVA_SAFE_POOLS.includes(poolId)

  if (!show) return null

  return (
    <Box
      variant="layout.verticalAlign"
      pr={2}
      pl={1}
      py={1}
      sx={{
        background: 'divaBackground',
        borderRadius: '40px',
        gap: 1,
      }}
    >
      <DivaIcon />
      <Text color="diva">Diva safe</Text>
    </Box>
  )
}

export default DivaBadge
