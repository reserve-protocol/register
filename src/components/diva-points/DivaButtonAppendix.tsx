import DivaIcon from 'components/icons/DivaIcon'
import { FC, PropsWithChildren, memo } from 'react'
import { Plus } from 'react-feather'
import { Box, ButtonProps, Text } from 'theme-ui'
import useDivaPoints from './hooks/useDivaPoints'

type Props = {
  rTokenSymbol?: string
  borderColor?: string
} & PropsWithChildren<ButtonProps>

const DivaButtonAppendix: FC<Props> = ({
  rTokenSymbol,
  borderColor = 'divaBorder',
  children,
}) => {
  const { rewardsRate } = useDivaPoints()

  if (rTokenSymbol !== 'bsdETH') return <>{children}</>

  return (
    <Box
      variant="layout.verticalAlign"
      sx={{
        border: '2px solid',
        borderColor: borderColor,
        borderRadius: '14px 46px 46px 14px',
        gap: 2,
      }}
    >
      {children}
      <Box
        variant="layout.verticalAlign"
        pr="12px"
        sx={{
          gap: 1,
        }}
      >
        <Plus strokeWidth={1.2} size={16} />
        <DivaIcon />
        <Text color="diva" sx={{ fontWeight: 'bold' }}>
          {rewardsRate}
        </Text>
        <Text>Diva/ETH/day</Text>
      </Box>
    </Box>
  )
}

export default memo(DivaButtonAppendix)
