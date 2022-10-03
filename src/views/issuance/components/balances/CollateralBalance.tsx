import { formatUnits } from '@ethersproject/units'
import { Trans } from '@lingui/macro'
import TokenBalance from 'components/token-balance'
import { useAtomValue } from 'jotai'
import { Circle } from 'react-feather'
import { balancesAtom } from 'state/atoms'
import { Box, BoxProps, Flex, Progress, Text } from 'theme-ui'
import { Token } from 'types'
import { formatCurrency } from 'utils'
import { quantitiesAtom } from 'views/issuance/atoms'

interface Props extends BoxProps {
  token: Token
}

const CollateralBalance = ({ token, ...props }: Props) => {
  const quantities = useAtomValue(quantitiesAtom)
  const balances = useAtomValue(balancesAtom)

  if (!quantities[token.address]) {
    return (
      <TokenBalance
        symbol={token.symbol}
        balance={balances[token.address]}
        {...props}
      />
    )
  }

  const current = +balances[token.address]?.toFixed(3) || 0
  const required = +formatUnits(quantities[token.address], token.decimals)
  const isValid = current >= +required.toFixed(3)

  return (
    <Box {...props}>
      <Flex variant="layout.verticalAlign">
        <TokenBalance symbol={token.symbol} balance={balances[token.address]} />
        <Box ml="auto">
          <Circle
            size={8}
            fill={isValid ? '#11BB8D' : '#FF0000'}
            stroke={undefined}
          />
        </Box>
      </Flex>
      <Box sx={{ textAlign: 'right', fontSize: 0 }} mb={1} ml="auto">
        <Text variant="legend">
          <Trans>Required:</Trans>
        </Text>{' '}
        <Text
          sx={{
            fontWeight: 500,
          }}
        >
          {formatCurrency(required)}
        </Text>
      </Box>
      {!isValid && <Progress mb={3} max={required} value={current} />}
    </Box>
  )
}

export default CollateralBalance
