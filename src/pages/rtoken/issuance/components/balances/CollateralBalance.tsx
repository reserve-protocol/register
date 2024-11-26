import { Trans } from '@lingui/macro'
import TokenBalance from 'components/token-balance'
import { useAtomValue } from 'jotai'
import { Circle } from 'react-feather'
import { balancesAtom } from 'state/atoms'
import { Box, BoxProps, Flex, Progress, Text } from 'theme-ui'
import { Token } from 'types'
import { formatCurrency } from 'utils'
import { formatUnits } from 'viem'
import { quantitiesAtom } from '../../atoms'

interface Props extends BoxProps {
  token: Token
}

const CollateralBalance = ({ token, ...props }: Props) => {
  const quantities = useAtomValue(quantitiesAtom)
  const balances = useAtomValue(balancesAtom)

  if (!quantities || !quantities[token.address]) {
    return (
      <TokenBalance
        symbol={token.symbol}
        balance={+(balances[token.address]?.balance ?? '0')}
        {...props}
      />
    )
  }

  const current = +(balances[token.address]?.balance ?? 0)
  const required = +formatUnits(quantities[token.address], token.decimals)
  const isValid =
    current && balances[token.address].value >= quantities[token.address]

  return (
    <Box {...props}>
      <Flex variant="layout.verticalAlign">
        <TokenBalance
          symbol={token.symbol}
          balance={+(balances[token.address]?.balance ?? '0')}
        />
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
          {formatCurrency(required, 6)}
        </Text>
      </Box>
      {!isValid && <Progress mb={3} max={required} value={current} />}
    </Box>
  )
}

export default CollateralBalance
